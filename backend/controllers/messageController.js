const {prisma}=require('../db/dbconfig.js')

module.exports.getMessages = async (req, res, next) => {
  try {
    const { from, to } = req.body;

    // Fetch messages where both senderId and receiverId match
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: parseInt(from), receiverId: parseInt(to) },
          { senderId: parseInt(to), receiverId: parseInt(from) },
        ],
      },
      orderBy: {
        updatedAt: 'asc', // Order by updatedAt in ascending order
      },
    });

    // Map the response to fit the desired output structure
    const projectedMessages = messages.map((msg) => ({
      fromSelf: msg.senderId === parseInt(from), // Check if the sender is the current user
      message: msg.text,
    }));

    res.json(projectedMessages);
  } catch (error) {
    next(error);
  }
};

module.exports.addMessage = async (req, res, next) => {
  try {
    const { from, to, message } = req.body;
    const senderId = parseInt(from);
    const receiverId = parseInt(to);

    // Check if both sender and receiver exist
    const sender = await prisma.user.findUnique({
      where: { id: senderId }
    });

    const receiver = await prisma.user.findUnique({
      where: { id: receiverId }
    });

    if (!sender) {
      return res.status(404).json({ error: `User with id ${senderId} not found.` });
    }

    if (!receiver) {
      return res.status(404).json({ error: `User with id ${receiverId} not found.` });
    }

    // Create the message
    const createdMessage = await prisma.message.create({
      data: {
        text: message,
        senderId: senderId,
        receiverId: receiverId,
      },
    });

    if (createdMessage) {
      return res.json({ msg: "Message added successfully." });
    } else {
      return res.json({ msg: "Failed to add message to the database" });
    }
  } catch (ex) {
    next(ex);
  }
};
