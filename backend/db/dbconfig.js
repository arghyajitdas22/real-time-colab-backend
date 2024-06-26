const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function connectDB() {
  try {
    await prisma.$connect();
    console.log('Connected to the PostgreSQL database successfully.');
  } catch (error) {
    console.error('Error connecting to the database:', error);
    process.exit(1);
  }
}

module.exports = {
  prisma,
  connectDB
};
