const express = require('express');
const connectDB = require('./utils/db');

const app = express();
const port = 8000;

//Connect Database
connectDB();

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});