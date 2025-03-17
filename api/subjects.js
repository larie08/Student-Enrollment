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

Router.get("/subjectsdata", (req, res) => {
    MySQL.query('SELECT * FROM subject', (err, results) => {
        if (err) {
            console.error("Error fetching Subject Table in Server: ", err);
            res.status(500).send("Internal Server Error");
            return;
        }
        res.status(200).json(results);
    });
});

// $scope.search (OP. 10)
Router.post('/search', (req, res) => {
    const { edpcode } = req.body;
  
    MySQL.query('SELECT * FROM subject WHERE edpcode = ?', [edpcode], (err, results) => {
      if (err) {
        console.error('Error searching:', err);
        res.status(500).json({ error: 'An internal server error occurred' });
        return;
      }
  
      res.status(200).json(results);
    });
  });

  //$scope.enrolledsubject (OP. 6)
  Router.get("/enrolledstudentlist", (req, res) => {
    const { idno } = req.query;

    MySQL.query('SELECT edpcode FROM enrollment WHERE idno = ?', [idno], (err, results) => {
        if (err) {
            console.error("Error fetching idno from enrollment: ", err);
            res.status(500).send("Internal Server Error");
            return;
        }

        const edpcodes = results.map(result => result.edpcode);

        if (edpcodes.length === 0) {
            res.status(200).json([]);
            return;
        }

        MySQL.query('SELECT * FROM subject WHERE edpcode IN (?)', [edpcodes], (err, subjects) => {
            if (err) {
                console.error("Error fetching subjects: ", err);
                res.status(500).send("Internal Server Error");
                return;
            }
            res.status(200).json(subjects);
        });
    });
});

// $scope.edpfind (OP. 7)
Router.post("/searchedpcodelist", (req, res) => {
    const { idno, edpcode, email } = req.body;

    // Check if EDPCode exists in the subject table
    MySQL.query('SELECT * FROM subject WHERE edpcode = ?', [edpcode], (err, result) => {
        if (err) {
            console.error("Error fetching subject data: ", err);
            res.status(500).send("Internal Server Error");
            return;
        }

        if (result.length === 0) {
            // If edpcode does not exist, send an alert to the frontend
            res.status(400).json({ error: 'EDP code does not exist'});
            return;
        }

        // Check if idno and edpcode already exist in the enrollment table
        MySQL.query('SELECT * FROM enrollment WHERE idno = ? AND edpcode = ?', [idno, edpcode], (err, enrollmentResult) => {
            if (err) {
                console.error("Error checking enrollment data: ", err);
                res.status(500).send("Internal Server Error");
                return;
            }

            if (enrollmentResult.length > 0) {
                // If idno and edpcode already exist in the enrollment table, send an alert to the frontend
                res.status(400).json({ error: 'Student already enrolled'});
                return;
            }

            // Insert a new row into the enrollment table
            MySQL.query('INSERT INTO enrollment (idno, edpcode, enrolledby) VALUES (?, ?, ?)', [idno, edpcode, email], (err, insertResult) => {
                if (err) {
                    console.error("Error inserting enrollment data: ", err);
                    res.status(500).send("Internal Server Error");
                    return;
                }

                MySQL.query('SELECT * FROM subject WHERE edpcode = ?', [edpcode], (err, subjectResult) => {
                    if (err) {
                        console.error("Error fetching subject data: ", err);
                        res.status(500).send("Internal Server Error");
                        return;
                    }
            
                    // Send the edpcode data back to the frontend
                    res.status(200).json(subjectResult);
                });
            });
        });
    });
});

  Router.post("/schedlist", (req, res) => {
    const { idno } = req.body;

        MySQL.query('SELECT edpcode FROM enrollment WHERE idno = ?', [idno], (err, results) => {
            if (err) {
                console.error("Error fetching edpcode from enrollment: ", err);
                res.status(500).send("Internal Server Error");
                return;
            }

            const edpcodes = results.map(result => result.edpcode);

            if (edpcodes.length === 0) {
                res.status(200).json([]); 
                return;
            }

            MySQL.query('SELECT * FROM subject WHERE edpcode IN (?)', [edpcodes], (err, subjects) => {
                if (err) {
                    console.error("Error fetching subjects: ", err);
                    res.status(500).send("Internal Server Error");
                    return;
                }
                
                res.status(200).json(subjects);
        });
    });
});

Router.post("/editsubject", (req, res) => {
    const { edpcode, subjectcode, time, days, room } = req.body;

    MySQL.query('SELECT * FROM subject WHERE subjectcode = ? AND time = ? AND days = ? AND room = ? AND (edpcode != ?)',
    [subjectcode, time, days, room, edpcode], (err, result) => {
        if (err) {
            console.error('Error checking if subject schedule already exist with different EDP Code:', err);
            res.status(500).json({ error: 'An internal server error occurred' });
            return;
        }

        if (result.length > 0) {
            res.status(400).json({ error: 'The Subject already exist with different EDP Code.' });
            return;
        }

        MySQL.query('UPDATE subject SET subjectcode = ?, time = ?, days = ?, room = ? WHERE edpcode = ?', [subjectcode, time, days, room, edpcode], (err, result) => {
            if (err) {
                console.error("Error updating student: ", err);
                res.status(500).send("Internal Server Error");
                return;
            }
            const editedSubjectSched = { subjectcode, time, days, room };
            res.status(200).json(editedSubjectSched);
        });
    });
});

Router.post('/addSubject', (req, res) => {
    const { edpcode, subjectcode, time, days, room } = req.body;

    MySQL.query('SELECT * FROM subject WHERE edpcode = ? AND subjectcode = ? AND time = ? AND days = ? AND room = ?',
        [edpcode, subjectcode, time, days, room], (err, result) => {
            if (err) {
                console.error('Error checking if class schedule already exists:', err);
                res.status(500).json({ error: 'An internal server error occurred' });
                return;
            }

            if (result.length > 0) {
                res.status(400).json({ error: 'The Class Schedule already exist.' });
                return;
            }

    MySQL.query('SELECT * FROM subject WHERE subjectcode = ? AND time = ? AND days = ? AND room = ? AND (edpcode != ?)',
        [subjectcode, time, days, room, edpcode], (err, result) => {
            if (err) {
                console.error('Error checking if subject schedule already exist with different EDP Code:', err);
                res.status(500).json({ error: 'An internal server error occurred' });
                return;
            }

            if (result.length > 0) {
                res.status(400).json({ error: 'The Subject already exist with different EDP Code.' });
                return;
            }

            MySQL.query('SELECT * FROM subject WHERE edpcode = ? AND (subjectcode != ? OR time != ? OR days != ? OR room != ?)',
                [edpcode, subjectcode, time, days, room], (err, result) => {
                    if (err) {
                        console.error('Error checking if edp code with different schedule already exists:', err);
                        res.status(500).json({ error: 'An internal server error occurred' });
                        return;
                    }

                    if (result.length > 0) {
                        res.status(400).json({ error: 'The EDP Code already assigned with different Schedule.' });
                        return;
                    }

                    MySQL.query('INSERT INTO subject (edpcode, subjectcode, time, days, room) VALUES (?, ?, ?, ?, ?)',
                        [edpcode, subjectcode, time, days, room], (err, result) => {
                            if (err) {
                                console.error('Error inserting new subject:', err);
                                res.status(500).json({ error: 'An internal server error occurred' });
                                return;
                            }

                            res.status(200).json({ message: 'Subject added to subject table successfully' });
                        });
                    });
                });
        });
});

// $scope.deleteSched (OP. 9)
Router.post("/deletemulenrollsubject", (req, res) => {
    const idno = req.body.idno;
    let edpcodes = req.body.edpcodes;

    if (!Array.isArray(edpcodes)) {
        edpcodes = edpcodes.split(',').map(code => code.trim());
    }

    MySQL.query('DELETE FROM enrollment WHERE idno = ? AND edpcode IN (?)', [idno, edpcodes], (err, result) => {
        if (err) {
            console.error("Error deleting Subject schedule from enrollment table: ", err);
            res.status(500).send("Internal Server Error");
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).send("Subjects not found for the given idno in enrollment table");
            return;
        }

        res.status(200).send("Subjects deleted successfully from enrollment table");
    });
});

Router.post("/deletesubject", (req, res) => {
    const { edpcode } = req.body;

    MySQL.query('DELETE FROM subject WHERE edpcode = ?', [edpcode], (err, result) => {
        if (err) {
            console.error("Error deleting Subject on table on server: ", err);
            res.status(500).send("Internal Server Error");
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).send("Subject not found");
            return;
        }

        res.status(200).send("Subject deleted successfully.");
    });
});

Router.post("/enrollsubjects", (req, res) => {
    const { email, idno, edpcodes } = req.body;

    if (!email || !idno || !edpcodes || !Array.isArray(edpcodes) || edpcodes.length === 0) {
        res.status(400).send("Invalid data provided.");
        return;
    }

    MySQL.query('SELECT edpcode FROM enrollment WHERE idno = ? AND edpcode IN (?)', [idno, edpcodes], (err, result) => {
        if (err) {
            console.error("Error checking existing enrollments: ", err);
            res.status(500).send("Internal Server Error");
            return;
        }

        if (result.length === edpcodes.length) {
            res.status(400).send("All selected subjects are already Enrolled to Student.");
            return;
        }

        const existingEdpcodes = result.map(row => row.edpcode);
        const newEdpcodes = edpcodes.filter(edpcode => !existingEdpcodes.includes(edpcode));

        if (existingEdpcodes.length > 0) {
            const message = `The following EDP Codes cannot be added or enrolled because the student already Enrolled: ${existingEdpcodes.join(', ')}`;
            res.status(400).send(message);
            return;
        }

        MySQL.query('INSERT INTO enrollment (idno, edpcode, enrolledby) VALUES ?', [newEdpcodes.map(edpcode => [idno, edpcode, email])], (err, result) => {
            if (err) {
                console.error("Error inserting subjects into enrollment table: ", err);
                res.status(500).send("No Given Student IDNO to Enroll Subject.");
                return;
            }

            res.status(200).send("Subjects enrolled successfully.");
        });
    });
});

module.exports = Router; 
