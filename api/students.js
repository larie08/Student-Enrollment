const express = require('express');
const mysql = require('mysql');
require("dotenv").config();
const fs = require('fs'); 
const path = require('path');
const Router = express.Router();

const MySQL = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    multipleStatements: true
});


Router.get("/studelist", (req, res) => {
    MySQL.query('SELECT * FROM students', (err, results) => {
        if (err) {
            console.error("Error fetching students: ", err);
            res.status(500).send("Internal Server Error");
            return;
        }
        res.status(200).json(results);
    });
});

Router.post('/saveimage', (req, res) => {
    const { pic, lastname } = req.body;

    if (!pic) {
        return res.status(400).send('Image data is required.');
    }

    if (!lastname) {
        return res.status(400).send('Last name is required to save the image.');
    }

    const imagePath = path.join(__dirname, '../public/resources/profile', `${lastname}.jpg`);

    // Delete the existing image if it exists
    fs.access(imagePath, fs.constants.F_OK, (err) => {
        if (!err) {
            // If the file exists, delete it
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error("Error deleting existing image: ", err);
                    return res.status(500).send('Internal Server Error');
                }
                // Proceed to save the new image after deletion
                saveNewImage();
            });
        } else {
            // Proceed to save the new image if the file does not exist
            saveNewImage();
        }
    });

    function saveNewImage() {
        fs.writeFile(imagePath, pic, 'base64', (err) => {
            if (err) {
                console.error("Error saving profile: ", err);
                return res.status(500).send('Internal Server Error');
            }
            res.status(200).send('Saved successfully.');
        });
    }
});

//$scope.studentinfo (OP. 5)
Router.post('/idnosearch', (req, res) => {
    const { idno } = req.body;
  
    MySQL.query('SELECT * FROM students WHERE idno = ?', [idno], (err, results) => {
      if (err) {
        console.error('Error searching:', err);
        res.status(500).json({ error: 'An internal server error occurred' });
        return;
      }
      res.status(200).json(results);
    });
  });

  // $scope.deleteperm (OP. 13)
  Router.post("/deletemulenrollstudent", (req, res) => {
    const { idnos, edpcode } = req.body;

    let idnosArray = Array.isArray(idnos) ? idnos : idnos.split(',').map(id => id.trim());

    MySQL.query('DELETE FROM enrollment WHERE idno IN (?) AND edpcode = ?', [idnosArray, edpcode], (err, result) => {
        if (err) {
            console.error("Error deleting students from enrollment table: ", err);
            res.status(500).send("Internal Server Error");
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).send("Students not found in enrollment table");
            return;
        }

        res.status(200).send("Students deleted successfully from subject enrolled");
    });
});

// $scope.enrolledsubjectList (OP. 11)
Router.get("/enrolledsubjectlist", (req, res) => {
    const { edpcode } = req.query;

    MySQL.query('SELECT idno FROM enrollment WHERE edpcode = ?', [edpcode], (err, results) => {
        if (err) {
            console.error("Error fetching idno from enrollment: ", err);
            res.status(500).send("Internal Server Error");
            return;
        }
        
        if (results.length === 0) {
            res.status(200).json([]);
            return;
        }

        const idnos = results.map(result => result.idno);

        MySQL.query('SELECT * FROM students WHERE idno IN (?)', [idnos], (err, students) => {
            if (err) {
                console.error("Error fetching students: ", err);
                res.status(500).send("Internal Server Error");
                return;
            }
            res.status(200).json(students);
        });
    });
});

Router.post('/savestudent', (req, res) => {
    const { idno, lastname, firstname, course, level } = req.body;

    MySQL.query('SELECT * FROM students WHERE idno = ?', [idno], (err, rows) => {
        if (err) {
            console.error("Error checking student existence: ", err);
            res.status(500).send("Internal Server Error");
            return;
        }

        if (rows.length > 0) {
            const student = rows[0];
            if (
                student.lastname !== lastname ||
                student.firstname !== firstname ||
                student.course !== course ||
                student.level !== level
            ) {
                res.status(400).send("IDNO already exist or assigned in other students");
                return;
            }
            res.status(200).send("Student already exists");
            return;
        }

        MySQL.query('INSERT INTO students (idno, lastname, firstname, course, level) VALUES (?, ?, ?, ?, ?)', [idno, lastname, firstname, course, level], (err, result) => {
            if (err) {
                console.error("Error saving student: ", err);
                res.status(500).send("Internal Server Error");
                return;
            }
            const newStudent = { idno, lastname, firstname, course, level };
            res.status(200).json(newStudent);
        });
    });
});

Router.get('/check/:lastname', (req, res) => {
    const lastname = req.params.lastname;
    const filePath = path.join(__dirname, '..', 'public', 'resources', 'profile', `${lastname}.jpg`);

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).send('Image not found');
        }
        res.status(200).send('Image exists');
    });
});

Router.post("/editstudent", (req, res) => {
    const { idno, lastname, firstname, course, level } = req.body;

    if (!lastname || !firstname || !course || !level) {
        res.status(400).json({ error: 'All fields are required' });
        return;
    }

    MySQL.query('SELECT lastname FROM students WHERE idno = ?', [idno], (err, results) => {
        if (err) {
            console.error("Error fetching old last name: ", err);
            res.status(500).send("Internal Server Error");
            return;
        }

        const oldLastName = results[0].lastname;
        const oldImagePath = path.join(__dirname, '../public/resources/profile', `${oldLastName}.jpg`);
        const newImagePath = path.join(__dirname, '../public/resources/profile', `${lastname}.jpg`);

        fs.access(oldImagePath, fs.constants.F_OK, (err) => {
            if (!err) {
                fs.rename(oldImagePath, newImagePath, (err) => {
                    if (err) {
                        console.error("Error renaming image: ", err);
                        res.status(500).send("Internal Server Error");
                        return;
                    }

                    updateStudentInfo();
                });
            } else {
                updateStudentInfo();
            }
        });

        function updateStudentInfo() {
            MySQL.query('UPDATE students SET lastname = ?, firstname = ?, course = ?, level = ? WHERE idno = ?', [lastname, firstname, course, level, idno], (err, result) => {
                if (err) {
                    console.error("Error updating student: ", err);
                    res.status(500).send("Internal Server Error");
                    return;
                }
                const editedStudentInfo = { lastname, firstname, course, level };
                res.status(200).json(editedStudentInfo);
            });
        }
    });
});

Router.post("/deletestudent", (req, res) => {
    const { idno } = req.body;

    MySQL.query('DELETE FROM students WHERE idno = ?', [idno], (err, result) => {
        if (err) {
            console.error("Error deleting student from students table: ", err);
            res.status(500).send("Internal Server Error");
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).send("Student not found in students");
            return;
        }

        MySQL.query('DELETE FROM enrollment WHERE idno = ?', [idno], (err, result) => {
            if (err) {
                console.error("Error deleting enrollment record: ", err);
                res.status(500).send("Internal Server Error");
                return;
            }

            res.status(200).send("Student deleted successfully");
        });
    });
});



module.exports = Router; 
