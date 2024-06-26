const {prisma}=require('../db/dbconfig.js')
const bcrypt = require('bcryptjs');

module.exports.login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await prisma.user.findUnique({
        where: { email }
      });
      if (!user) {
        return res.json({ msg: "Incorrect Email or Password", status: false });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.json({ msg: "Incorrect Email or Password", status: false });
      }
      const { password: _, ...userWithoutPassword } = user; // Exclude password
      return res.json({ status: true, user: userWithoutPassword });
    } catch (ex) {
      next(ex);
    }
  };


  module.exports.register = async (req, res, next) => {
    try {
      const { username, email, password } = req.body;
      
      const usernameCheck = await prisma.user.findUnique({
        where: { username }
      });
      if (usernameCheck) {
        return res.json({ msg: "Username already used", status: false });
      }
  
      const emailCheck = await prisma.user.findUnique({
        where: {
        email: email,
      },
      });
      if (emailCheck) {
        return res.json({ msg: "Email already used", status: false });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
        }
      });
  
      const { password: _, ...userWithoutPassword } = user; // Exclude password
      return res.json({ status: true, user: userWithoutPassword });
    } catch (ex) {
      next(ex);
    }
  };