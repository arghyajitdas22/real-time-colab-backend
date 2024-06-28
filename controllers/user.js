const { prisma } = require("../db/dbconfig.js");
const { StatusCodes, INTERNAL_SERVER_ERROR } = require("http-status-codes");

const getAllUsersOnPlatform = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const users = await prisma.user.findMany({
      where: {
        NOT: {
          id: Number(user_id),
        },
      },
    });
    return res.status(StatusCodes.OK).json({ users });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "An error occurred while fetching users",
      status: false,
    });
  }
};

const getAllCreatedTeams = async (req, res) => {
  const user_id = req.user.user_id;
  if (!user_id) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "User ID is required" });
  }

  try {
    const teams = await prisma.team.findMany({
      where: {
        creatorId: Number(user_id),
      },
    });

    res.status(StatusCodes.OK).json(teams);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "An error occurred while fetching teams" });
  }
};

module.exports = {
  getAllUsersOnPlatform,
  getAllCreatedTeams,
};
