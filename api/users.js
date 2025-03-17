const express = require('express');
const mysql = require('mysql');
require("dotenv").config();
const Router = express.Router();

const MySQL = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    multipleStatements: true
});


//FUNCTIONALITY OF LOGIN, WHERE THIS AREA WILL BE USED TO GET THE email and password
//COMING FROM TABLE "user" IN MYSQL DATABASE (OP. 2)
Router.get('/usersacc', (req, res) => {
    MySQL.query('SELECT email, password FROM user', (err, results) => {
        if (err) {
            console.error('Error fetching student users:', err);
            res.status(500).json({ error: 'An error occurred while fetching student users' });
            return;
        }
        res.json(results);
    });
});

module.exports = Router; 
