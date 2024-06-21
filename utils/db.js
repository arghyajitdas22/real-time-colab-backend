const mongoose = require('mongoose');


const connectDB = async () => {
    try {
        const conn = await mongoose.connect("mongodb+srv://12shib34:bzExniVFCVpsicfb@cluster0.ehevkis.mongodb.net/");

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

module.exports = connectDB;