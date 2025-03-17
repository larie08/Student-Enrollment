const express = require('express');
const mysql = require('mysql');
const fileupload = require("express-fileupload");
const path = require("path");
require("dotenv").config();
const port = process.env.PORT || 4321;
const app = express();
const students = require("./api/students");
const subjects = require("./api/subjects");
const users = require("./api/users");

app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ "extended": true }));
app.use(express.json());
app.use(fileupload());
app.use("/api/students", students);
app.use("/api/subjects", subjects);
app.use("/api/users", users);

const MySQL = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    multipleStatements: true
});

MySQL.getConnection((err, connection) => {
    if (err) {
        console.error("Error connecting to MySQL database: ", err);
        process.exit(1); 
    }
    console.log("Connected to MySQL database.");
    connection.release(); 
});


app.post("/saveimage",(req,res)=>{
	var file;
    if(!req.files.webcam){
        res.send("File was not found");
        return;
    }
    file = req.files.webcam;  // here is the field name of the form
	filename = req.query.name;
	console.log(file);
	file.mv(path.join(__dirname,"/public/assets/image/"+filename))
    res.send("File Uploaded");
});


app.get("/", (req, res) => {
    res.render("login.html");
});

app.listen(port, () => {
    console.log(`Listening at Port ${port}.`);
});
