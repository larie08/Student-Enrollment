var app = angular.module("myapp",["ngRoute"]);

app.run(function($rootScope, $location) {
    var localStorage = window.localStorage;
    $rootScope.adminLogged = localStorage.getItem('adminLogged') === 'true';

    $rootScope.$on('$routeChangeStart', function(event, next) {
        if ($rootScope.adminLogged && next.$$route.originalPath !== "/student_enrollment" && next.$$route.originalPath !== "/student_enrollment/student" && next.$$route.originalPath !== "/student_enrollment/subject"
				   && next.$$route.originalPath !== "/student_enrollment/enroll" && next.$$route.originalPath !== "/student_enrollment/report") {
            $location.path("/student_enrollment/student");
            event.preventDefault();
        } 
		else if (!$rootScope.adminLogged && next.$$route.originalPath === "/student_enrollment/student" && next.$$route.originalPath === "/student_enrollment/subject"
		&& next.$$route.originalPath === "/student_enrollment/enroll" && next.$$route.originalPath === "/student_enrollment/report") {
            $location.path("/login");
        }
    });

	//THIS FUNCTION WILL WORK IF NIG CLICK NIMOG REFRESH OR BACK MAG STAY RA GIHAPON SYA ANA NGA PAGE
    if (!$rootScope.adminLogged && $location.path() === "/student_enrollment/student" && $location.path() === "/student_enrollment/subject" && $location.path() === "/student_enrollment/enroll" && $location.path() === "/student_enrollment/report") {
        	$location.path("/login");
    } else if ($rootScope.adminLogged && $location.path() !== "/student_enrollment" && $location.path() !== "/student_enrollment/student" && $location.path() !== "/student_enrollment/subject" 
			   && $location.path() !== "/student_enrollment/enroll" && $location.path() !== "/student_enrollment/report") {
        $location.path("/student_enrollment/student");
    } 
});

app.config(function($routeProvider){
	$routeProvider.when("/",{
		templateUrl: 'mainmenu.html',
		controller: 'menuController'
	})

	$routeProvider.when("/creator",{
		templateUrl: 'creator.html',
		controller: 'creatorController'
	})

    $routeProvider.when("/student_enrollment/student", {
        templateUrl: 'student.html',
        controller: 'student',
        resolve: {
            'check': function($rootScope, $location) {
                if (!$rootScope.adminLogged) {
                    $location.path("/login");
                }
            }
        }
    })
	$routeProvider.when("/student_enrollment/subject", {
        templateUrl: 'subject.html',
        controller: 'subject',
        resolve: {
            'check': function($rootScope, $location) {
                if (!$rootScope.adminLogged) {
                    $location.path("/login");
                }
            }
        }
    })

	$routeProvider.when("/student_enrollment/enroll", {
        templateUrl: 'enroll.html',
        controller: 'enroll',
        resolve: {
            'check': function($rootScope, $location) {
                if (!$rootScope.adminLogged) {
                    $location.path("/login");
                }
            }
        }
    })
	$routeProvider.when("/student_enrollment/report", {
        templateUrl: 'report.html',
        controller: 'report',
        resolve: {
            'check': function($rootScope, $location) {
                if (!$rootScope.adminLogged) {
                    $location.path("/login");
                }
            }
        }
    })

	$routeProvider.when("/login",{
        templateUrl: 'login.html',
        controller: 'loginController',
    });

	$routeProvider.otherwise({
        redirectTo: '/student_enrollment/student'
    });
});


app.controller("menuController",function($scope,$location){
	$scope.mainmenu = function(){
		$location.path("/login");
	}
	$scope.creator = function(){
		$location.path("/creator")
	}
})


app.controller("creatorController",function($scope,$location){
	$scope.cremainmenu = function(){
		$location.path("/");
	}
})


app.controller("loginController", function($scope, $location, $rootScope, $http) {
	$scope.inputType = 'password';
		$scope.showPassword = false; 

		$scope.togglePasswordVisibility = function() {
			$scope.showPassword = !$scope.showPassword;
			$scope.inputType = $scope.showPassword ? 'text' : 'password';
		};
	
	
		$scope.login = function() {
			var email = $scope.email;
			var password = $scope.password;
		
			$http.get('api/users/usersacc').then(function(response) {
				var adminusers = response.data;
				var adminuser = adminusers.find(function(adminuser) {
					return adminuser.email === email && adminuser.password === password;
				});
		
				if (adminuser) {
					$rootScope.adminLogged = true;
					localStorage.setItem('adminLogged', 'true');
					localStorage.setItem('UserEmail', adminuser.email);
					$location.path("/student_enrollment/student");
				} else {
					alert('Invalid email or password.');
				}
			});
		};

    $scope.backmainmenu = function() {
        $location.path("/");
    };
});
				
					app.filter("startFrom",function(){
						return function(input, start) {
                    		if (!input || !Array.isArray(input)) {
                            	return [];
                        }
                            start = +start; 
                            return input.slice(start);
                        };
                });
                   
					
        			app.filter('capitfirname', function() {
                		return function(input) {
                    		if (!input) return '';
                        		return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
					};
			});

		
			app.controller("student",function($scope,$rootScope, $http, $location, $sce){
				$scope.navigateTo = function(path) {
					$location.path(path);
				};
			
				$scope.student = function() {
					window.location.reload();
					$location.path("/student_enrollment/student");
				};
		
				$scope.subject = function() {
					$location.path("/student_enrollment/subject");
				};
		
				$scope.enroll = function() {
					$location.path("/student_enrollment/enroll");
				};
		
				$scope.report = function() {
					$location.path("/student_enrollment/report");
				};

				$scope.Sidebar = function() {
					var sidebar = document.getElementById("enrollmentSidebar");
					if (sidebar.style.display === "none") {
						document.getElementById("pageview").style.marginLeft = "15%";
						sidebar.style.width = "15%";
						sidebar.style.display = "block";
					} else {
						document.getElementById("pageview").style.marginLeft = "0%";
						sidebar.style.display = "none";
					}
				};

				$scope.takeSnapshot = function() {
					Webcam.snap(function(data_uri) {
						document.getElementById('my_result').innerHTML = "<img id='imageprev' src='" + data_uri + "'>";
					});
				}

				// Function to save the snapshot
				$scope.saveSnapshot = function() {
					var base64image = document.getElementById('imageprev').src;
					var lastname = $scope.lastname;

					if (!$scope.lastname) {
						alert("Please enter Lastname to define picture.");
						return;
					}

					if (!base64image) {
						alert("No picture captured or taken yet.");
						return;
					}

					var data = {
						pic: base64image.split(',')[1],
						lastname: lastname
					};

					$http.post('/api/students/saveimage', data)
						.then(function(response) {
							alert("Captured Image Saved.");
						})
						.catch(function(error) {
							console.error("Error saving image: ", error);
						});
				}

				Webcam.set({
					width: 320,
					height: 240,
					dest_width: 320,
					dest_height: 240,
					image_type: 'jpeg',
					image_quality: 90
				});

				Webcam.attach("#my_camera");


/*
				
				
			// Function to take snapshot
			$scope.takeSnapshot = function () {
				Webcam.snap(function (data_uri) {
					$scope.snapshot = data_uri;
					// $scope.resultName = $scope.picname;
				});
			};

			// Function to save snapshot
			$scope.saveSnapshot = function () {
				var base64image = $scope.snapshot;
				var imagename = $scope.picname;
				Webcam.upload(base64image, "saveimage?name=" + imagename + ".jpg", function (code, text) {
					alert("Image Saved");
				});
			};
*/

				  $scope.courseOptions = [
					{ value: 'bsit', label: 'Bachelor of Science in Information Technology (BSIT)' },
					{ value: 'bscs', label: 'Bachelor of Science in Computer Science (BSCS)' },
					{ value: 'bsis', label: 'Bachelor of Science in Infomation Systems (BSIS)' },
					{ value: 'act', label: 'Associate in Computer Technology (ACT)' },
				];
		
				$scope.addOpt = function() {
					if ($scope.course === 'bscs' || $scope.course === 'bsis' || $scope.course === 'bsit' || $scope.course === 'act'
							  || $scope.course === 'bfa' || $scope.course === 'b.mus.' || $scope.course === 'bse'  || $scope.course === 'bsn') {
						$scope.levelOptions = [
											{value: '1', label: '1st Year'}, {value: '2', label:'2nd Year'}, 
											{value: '3', label: '3rd Year'}, {value: '4', label: '4th Year'}
											  ];
					}
				   };
		
				   $http({
					'url':'/api/students/studelist',
					'method':'get'
				}).then(function(response){
					$scope.studentlist = response.data;
					$scope.header = Object.keys($scope.studentlist[0]);
					// Function to display image from blob data
					$scope.getImage = function(blobData) {
						return 'data:image/jpeg;base64,' + blobData.toString('base64');
					}
				});									
		
					   $scope.pagesizes=[5,10,15,20,30];
					   $scope.pageSize=5;
					   $scope.currentPage = 0
					   $scope.sortType = 'idno';
					   $scope.sortReverse = false;
		
					   $scope.sortBy = function (type) {
						   if ($scope.sortType === type) {
								$scope.sortReverse = !$scope.sortReverse;
						   } else {
							   $scope.sortType = type;
							   $scope.sortReverse = false;
						   }
					   };
		
					   $scope.numberOfPages = function() {
						   return Math.ceil($scope.studentlist.length / $scope.pageSize);
					   }     
		
					   $scope.getPages = function() {
						   return Array.from({ length: $scope.numberOfPages() }, (_, i) => i);
					   };
		
					   $scope.getSheet = function () {
						   var totalPages = $scope.numberOfPages();
						   return new Array(totalPages);
					   };
		   
					   $scope.goTosheet = function (page) {
						   $scope.currentPage = page;
					   }
				
					   $scope.modalcontrol = function(modalname,control){
						document.getElementById(modalname).style.display=control;
					}

					$scope.editClass = function(student) {
						document.getElementById('editingstudent').style.display = 'block';
							$scope.editStudent = angular.copy(student);
						
							$scope.LevelCourseOpt();
					};
		
					$scope.LevelCourseOpt = function() {
						$scope.levelOptions = [];

						//THIS WILL BEUSED SA CHOICES SA LEVEL DEPENDS COURSE SELECTED
						switch ($scope.editStudent.course) {
							case 'bsit':
							case 'bsis':
							case 'bscs':
								$scope.levelOptions = [
									{ value: '1', label: '1st Year' },
									{ value: '2', label: '2nd Year' },
									{ value: '3', label: '3rd Year' },
									{ value: '4', label: '4th Year' }
								];
								break;
							case 'act':
								$scope.levelOptions = [
									{ value: '1', label: '1st Year' },
									{ value: '2', label: '2nd Year' }
								];
								break;
						}
					};					

					$scope.cancelEdit = function() {
						$scope.editingStudent = null; 
						$scope.modalcontrol('editingstudent', 'none');
					};
		
					$scope.saveStudent = function() {
						if (!$scope.editStudent.lastname || !$scope.editStudent.firstname || 
							!$scope.editStudent.course || !$scope.editStudent.level) {
							alert('Please fill out all fields.');
							return;
						}
						var data = {
							idno: $scope.editStudent.idno,
							lastname: $scope.editStudent.lastname,
							firstname: $scope.editStudent.firstname,
							course: $scope.editStudent.course,
							level: $scope.editStudent.level
						};
						$http.post('/api/students/editstudent', data)
							.then(function(response) {
								var idno = $scope.editStudent.idno;
								var index = $scope.studentlist.findIndex(student => student.idno === idno);
								if (index !== -1) {
									$scope.studentlist[index].lastname = response.data.lastname;
									$scope.studentlist[index].firstname = response.data.firstname;
									$scope.studentlist[index].course = response.data.course;
									$scope.studentlist[index].level = response.data.level;
								}
								$scope.cancelEdit(); // Hide modal
								alert("Successfully edited the student's information.");
							})
							.catch(function(error) {
								console.error('Error editing student:', error);
								alert('An error occurred while editing the student. Please try again.');
							});
					};

					var modal = document.getElementById('editingstudent');
						modal.style.display = 'none';


						$scope.addStudent = function() {
							if (!/^\d+$/.test($scope.idno)) {
								alert("Only numbers are allowed for ID Number");
								return;
							}
						
							if (!$scope.lastname || !$scope.firstname || !$scope.course || !$scope.level) {
								alert('Please fill out all fields.');
								return;
							}
						
							var data = {
								idno: $scope.idno,
								lastname: $scope.lastname,
								firstname: $scope.firstname,
								course: $scope.course,
								level: $scope.level
							};
						
							$scope.checkProf($scope.lastname, function(exists) {
								if (exists) {
									$http.post('/api/students/savestudent', data)
										.then(function(response) {
											$scope.studentlist.push(response.data); 
											alert("Successfully added new student.");
											$scope.canceladdStudent(); 
											document.getElementById('my_result').innerHTML = "";
										})
										.catch(function(error) {
											console.error('Error adding student:', error);
											alert('An error occurred while adding the student. Student already exists.');
										});
								} else {
									alert('Capture first.');
								}
							});
						};

						$scope.checkProf = function(lastname, callback) {
							$http.get('/api/students/check/' + lastname)
								.then(function(response) {
									callback(true);
								})
								.catch(function(error) {
									console.error('Error checking image:', error);
									callback(false);
								});
						};
		
				$scope.canceladdStudent = function(){
							$scope.idno = '';
							$scope.lastname = '';
							$scope.firstname = '';
							$scope.course = '';
							$scope.level = '';
				}
		
						   $scope.StudeDel = [];

							$scope.Popdelask = function(student) {
								$scope.StudeDel = student;
								if (window.confirm('Are you sure you want to delete this student?')) {
									$scope.deleteStudent();
								}
							};

							$scope.deleteStudent = function() {
								var idno = $scope.StudeDel.idno;
								var data = {
									idno: idno
								};
								$http.post('/api/students/deletestudent', data)
									.then(function(response) {
										if (response.data === "Student deleted successfully") {
											$scope.studentlist = $scope.studentlist.filter(function(student) {
												return student.idno !== idno;
											});
											window.alert('Student deleted successfully.');
										} else {
											console.error('Error deleting student:', response.data);
											window.alert('An error occurred while deleting the student. Please try again.');
										}
									})
									.catch(function(error) {
										console.error('Error deleting student:', error);
										window.alert('An error occurred while deleting the student. Please try again.');
									});
							};

		
							$scope.OpenDelSucce = function () {
								document.getElementById('DelSuccess').style.display = 'block';
							};
					
							$scope.CloseDelSucce = function () {
								document.getElementById('DelSuccess').style.display = 'none';
							};
		
							$scope.logout = function() {
								var logoutconfirm = confirm("Are you sure you want to logout?");
								if (logoutconfirm) {
									localStorage.setItem('adminLogged', 'false');
									$rootScope.adminLogged = false;
									localStorage.clear();
									$location.path("/login");
								}
							}
			});

	app.controller("subject",function($scope,$rootScope, $http, $location){
		$scope.navigateTo = function(path) {
			$location.path(path);
		};
	
		$scope.student = function() {
			$location.path("/student_enrollment/student");
		};

		$scope.subject = function() {
			window.location.reload();
			$location.path("/student_enrollment/subject");
		};

		$scope.enroll = function() {
			$location.path("/student_enrollment/enroll");
		};

		$scope.report = function() {
			$location.path("/student_enrollment/report");
		};

		$scope.Sidebar = function() {
			var sidebar = document.getElementById("enrollmentSidebar");
			if (sidebar.style.display === "none") {
				document.getElementById("pageview").style.marginLeft = "15%";
				sidebar.style.width = "15%";
				sidebar.style.display = "block";
			} else {
				document.getElementById("pageview").style.marginLeft = "0%";
				sidebar.style.display = "none";
			}
		};

			   $scope.pagesizes=[5,10,15,20,30];
			   $scope.pageSize=5;
			   $scope.currentPage = 0
			   $scope.sortType = 'idno';
			   $scope.sortReverse = false;

			   $scope.sortBy = function (type) {
				   if ($scope.sortType === type) {
						$scope.sortReverse = !$scope.sortReverse;
				   } else {
					   $scope.sortType = type;
					   $scope.sortReverse = false;
				   }
			   };

			   $scope.numberOfPages = function() {
				   return Math.ceil($scope.subjectlist.length / $scope.pageSize);
			   }     

			   $scope.getPages = function() {
				   return Array.from({ length: $scope.numberOfPages() }, (_, i) => i);
			   };

			   $scope.getSheet = function () {
				   var totalPages = $scope.numberOfPages();
				   return new Array(totalPages);
			   };
   
			   $scope.goTosheet = function (page) {
				   $scope.currentPage = page;
			   }
		
			   $scope.modalcontrol = function(modalname,control){
				document.getElementById(modalname).style.display=control;
			}
			
			$scope.EditPermissionPop = function () {
				document.getElementById('PermissionEdit').style.display = 'block';
			};

			$scope.ClosePermissionEdit = function () {
				document.getElementById('PermissionEdit').style.display = 'none';
			};

			$scope.openaddsubjsuccessmod = function() {
				$scope.modalcontrol('AddSubjSucce', 'block');
			};
			
			$scope.closeaddsubjsuccessmod = function() {
				$scope.modalcontrol('AddSubjSucce', 'none');
				window.location.reload();
			};


			$http({
				'url':'/api/subjects/subjectsdata',
				'method':'get'
			  }).then(function(response){
				   $scope.subjectlist = response.data;
				   $scope.header = Object.keys($scope.subjectlist[0]);
			  })
				   $scope.subjectlist = [];

				   $scope.addSubject = function() {
					if (!/^\d+$/.test($scope.edpcode)) {
						alert("Only numbers are allowed for EDP Code.");
						return;
					}
				
					if (!$scope.edpcode || !$scope.subjectcode ||
						!$scope.time || !$scope.days ||
						!$scope.room) {
						alert('Please fill out all fields.');
						return;
					}
				
					var daysSelected = [];
					if ($scope.days.monday) daysSelected.push('M');
					if ($scope.days.tuesday) daysSelected.push('T');
					if ($scope.days.wednesday) daysSelected.push('W');
					if ($scope.days.thursday) daysSelected.push('TH');
					if ($scope.days.friday) daysSelected.push('F');
					if ($scope.days.saturday) daysSelected.push('S');
				
					var newSubject = {
						edpcode: $scope.edpcode,
						subjectcode: $scope.subjectcode,
						time: $scope.time,
						days: daysSelected.join(''),
						room: $scope.room,
					};
				
					$http.post('/api/subjects/addSubject', newSubject)
						.then(function(response) {
							$scope.subjectlist.push(newSubject);
							$scope.resetForm();
							$scope.openaddsubjsuccessmod();
						})
						.catch(function(error) {
							console.error('Error adding subject:', error);
							if (error.data && error.data.error === 'The Subject already exist with different EDP Code.') {
								alert("Subject already in Subject Schedule Data with different EDP Code.");
							} else if (error.data && error.data.error === 'The EDP Code already assigned with different Schedule.') {
								alert("The EDP Code was already assigned with different Schedule.");
							} else if (error.data && error.data.error === 'The Class Schedule already exist.') {
								alert("The Class Schedule already exist data.");
							}
						});
				};							

			$scope.canceladdSubject = function() {
				$scope.resetForm();
			}

			$scope.resetForm = function() {
				$scope.edpcode = '';
				$scope.subjectcode = '';
				$scope.time = '';
				$scope.days = {};
				$scope.room = '';
			};	
			

			$scope.confirmEditSubject = function () {
				var modal = document.getElementById('editSubject');
				modal.style.display = 'block';
				$scope.ClosePermissionEdit();
			}

			$scope.editSched = function(subject) {
				$scope.EditPermissionPop(subject);
					$scope.editSubject = angular.copy(subject);
			
					if (!$scope.edit) {
						$scope.edit = {};
					}

					$scope.edit.days = {
						monday: false,
						tuesday: false,
						wednesday: false,
						thursday: false,
						friday: false,
						saturday: false
					};
				
					for (var i = 0; i < subject.days.length; i++) {
						var day = subject.days.substr(i, 1);
						switch (day) {
							case 'M':
								$scope.edit.days.monday = true;
								break;
							case 'T':
								var nextDay = subject.days.substr(i + 1, 1);
								if (nextDay === 'H') {
									$scope.edit.days.thursday = true; 
									i++; 
								} else {
									$scope.edit.days.tuesday = true;
								}
								break;
							case 'W':
								$scope.edit.days.wednesday = true;
								break;
							case 'F':
								$scope.edit.days.friday = true;
								break;
							case 'S':
								$scope.edit.days.saturday = true;
								break;
						}
					}					
			};

			$scope.cancelEdit = function() {
				$scope.editSubject = null; 
				$scope.modalcontrol('editSubject', 'none');
			};

			var modal = document.getElementById('editSubject');
				modal.style.display = 'none';

			$scope.openeditsucce = function() {
				$scope.modalcontrol('EditInfoSucce', 'block');
			};
			
			$scope.closeeditsucce = function() {
				$scope.modalcontrol('EditInfoSucce', 'none');
			};

			$scope.saveSubject = function() {
				var dayeditSelected = [];
				if ($scope.edit.days.monday) dayeditSelected.push('M');
				if ($scope.edit.days.tuesday) dayeditSelected.push('T');
				if ($scope.edit.days.wednesday) dayeditSelected.push('W');
				if ($scope.edit.days.thursday) dayeditSelected.push('TH');
				if ($scope.edit.days.friday) dayeditSelected.push('F');
				if ($scope.edit.days.saturday) dayeditSelected.push('S');

				if (!$scope.editSubject.edpcode || !$scope.editSubject.subjectcode || 
					!$scope.editSubject.time || !$scope.edit.days ||
				    !$scope.editSubject.room) {
					alert('Please fill out all fields.');
					return;
				}
				var data = {
					edpcode: $scope.editSubject.edpcode,
					subjectcode: $scope.editSubject.subjectcode,
					time: $scope.editSubject.time,
					days: dayeditSelected.join(''),
					room: $scope.editSubject.room
				};
				$http.post('/api/subjects/editsubject', data)
					.then(function (response) {
						var edpcode = $scope.editSubject.edpcode;
						var index = $scope.subjectlist.findIndex(subject => subject.edpcode === edpcode);
						if (index !== -2) {
							$scope.subjectlist[index].subjectcode = response.data.subjectcode;
							$scope.subjectlist[index].time = response.data.time;
							$scope.subjectlist[index].days = response.data.days;
							$scope.subjectlist[index].room = response.data.room;
						}
						
						$scope.reseteditForm();
						$scope.modalcontrol('editSubject', 'none');
						$scope.openeditsucce();
					})
					.catch(function (error) {
						console.error('Error editing subject:', error);
						if (error.data && error.data.error === 'The Subject already exist with different EDP Code.') {
							alert("The Subject already exist with different EDP Code.");
						}
					});	
				};

				$scope.reseteditForm = function() {
					$scope.editSubject.edpcode = '';
					$scope.editSubject.subjectcode = '';
					$scope.editSubject.time = '';
					$scope.edit.days = {};
					$scope.editSubject.room = '';
				};	

				$scope.SubjectDel = [];
				$scope.Popdelask = function(subject) {
					$scope.SubjectDel = subject;
					if (confirm('Are you sure you want to delete this subject?')) {
						$scope.deleteSubject();
					}
				};

				$scope.deleteSubject = function() {
					var edpcode = $scope.SubjectDel.edpcode;
					var data = {
						edpcode: edpcode
					};
					$http.post('/api/subjects/deletesubject', data)
						.then(function(response) {
							if (response.data === "Subject deleted successfully.") {
								$scope.subjectlist = $scope.subjectlist.filter(function(subject) {
									return subject.edpcode !== edpcode;
								});
								alert("Subject deleted successfully.");
							} else {
								console.error('Error deleting subject:', response.data);
								alert('An error occurred while deleting the subject. Please try again.');
							}
						})
						.catch(function(error) {
							console.error('Error deleting subject:', error);
							alert('An error occurred while deleting the subject. Please try again.');
						});
				};

					$scope.logout = function() {
						var logoutconfirm = confirm("Are you sure you want to logout?");
						if (logoutconfirm) {
							localStorage.setItem('adminLogged', 'false');
							$rootScope.adminLogged = false;
							localStorage.clear();
							$location.path("/login");
						}
					}
				});

				app.controller("enroll",function($scope,$rootScope, $http, $location){
						
							$scope.student = function() {
								$location.path("/student_enrollment/student");
							};
							
							$scope.subject = function() {
								$location.path("/student_enrollment/subject");
							};

							$scope.enroll = function() {
								window.location.reload();
								$location.path("/student_enrollment/enroll");
							};

							$scope.report = function() {
								$location.path("/student_enrollment/report");
								
							};
							
							$scope.Sidebar = function() {
								var sidebar = document.getElementById("enrollmentSidebar");
								if (sidebar.style.display === "none") {
									document.getElementById("pageview").style.marginLeft = "15%";
									sidebar.style.width = "15%";
									sidebar.style.display = "block";
								} else {
									document.getElementById("pageview").style.marginLeft = "0%";
									sidebar.style.display = "none";
								}
							};
							
							$scope.studentinfo = []; 
							$scope.search = function() {
							var data = {
								idno: $scope.searchidno
							};
					
							$http.post('/api/students/idnosearch', data)
								.then(function (response) {
									$scope.studentinfo = response.data;
								})
								localStorage.removeItem('EDPtoDel');
								localStorage.removeItem('SearchedIdno');
								localStorage.setItem('SearchedIdno', $scope.searchidno); 
							};

							
							function getSearchedIdno() {
								return localStorage.getItem('SearchedIdno');
							}

							
							$scope.subjectstudentenrolled = []; 
							$scope.enrolledsubject = function() {
								var idno = getSearchedIdno(); 
								$http.get('api/subjects/enrolledstudentlist?idno=' + idno)
									.then(function(response) {
										if (response.data.length === 0) {
											$scope.subjectstudentenrolled.length = 0;
										} else { 
											$scope.subjectstudentenrolled.length = 0;
											Array.prototype.push.apply($scope.subjectstudentenrolled, response.data);
										}
										
									})
									.catch(function(error) {
										console.error('Error fetching student list:', error);
									});
							};

						
							$scope.pagesizes=[5,10,15,20,30];
							$scope.pageSize=5;
							$scope.currentPage = 0
							$scope.sortType = 'edpcode';
							$scope.sortReverse = false;
			
							$scope.sortBy = function (type) {
								if ($scope.sortType === type) {
									$scope.sortReverse = !$scope.sortReverse;
								} else {
									$scope.sortType = type;
									$scope.sortReverse = false;
								}
							};
			
							$scope.numberOfPages = function() {
								return Math.ceil($scope.subjectstudentenrolled.length / $scope.pageSize);
							}     
			
							$scope.getPages = function() {
								return Array.from({ length: $scope.numberOfPages() }, (_, i) => i);
							};
			
							$scope.getSheet = function () {
								var totalPages = $scope.numberOfPages();
								return new Array(totalPages);
							};
				
							$scope.goTosheet = function (page) {
								$scope.currentPage = page;
							}

					
						function getEmail() {
							return localStorage.getItem('UserEmail');
						}

					$scope.edpfind = function() {
						var idno = getSearchedIdno();
						var edpcode = $scope.searchfoundidedp;
						var email = getEmail();
					
						var data = {
							idno: idno,
							edpcode: edpcode,
							email: email
						};
					
						$http.post('api/subjects/searchedpcodelist', data)
							.then(function(response) {
								$scope.subjectstudentenrolled = $scope.subjectstudentenrolled.concat(response.data); 
							})
							.catch(function(error) {
								console.error('Error fetching student list:', error);
								if (error.data && error.data.error === 'EDP code does not exist') {
									alert("The Subject EDP Code didn't exist in Subject data."); 
								} else if (error.data && error.data.error === 'Student already enrolled') {
									alert("The Student is already enrolled on this subject.");
								}
							});
					};					
	  
					  $scope.tempdeleteEDP = function() {
						$scope.selectedsubject = $scope.subjectstudentenrolled.filter(function(subject) {
							return subject.selected;
						});
					
						if ($scope.selectedsubject.length > 0) {
							$scope.SubjDel = {
								edpcodes: $scope.selectedsubject.map(function(subject) {
									return subject.edpcode;
								}).join(', ')
							};
					
							localStorage.setItem('EDPtoDel', JSON.stringify($scope.SubjDel.edpcodes));
		
							$scope.subjectstudentenrolled = $scope.subjectstudentenrolled.filter(function(subject) {
								return !$scope.selectedsubject.includes(subject);
							});
						}  else {
							alert('No Selected Subjects.');
						}
					};

					function getEDPtoDel() {
						var edpcodes = localStorage.getItem('EDPtoDel');
						return edpcodes ? JSON.parse(edpcodes) : [];
					}			
		
					$scope.deleteSched = function() {
						var idno = getSearchedIdno();
						var edpcodeDel = getEDPtoDel();
					
						if (edpcodeDel.length === 0) {
							alert("Save data successfully.");
						} else {
							$http.post('/api/subjects/deletemulenrollsubject', { idno: idno, edpcodes: edpcodeDel })
								.then(function(response) {
									alert("Save Successfully.");
									localStorage.removeItem('EDPtoDel');
								})
								.catch(function(error) {
									console.error("Error deleting Schedule of Student: ", error);
								});
						}
					};
  
				  $scope.logout = function() {
					  var logoutconfirm = confirm("Are you sure you want to logout?");
						  if (logoutconfirm) {
							  localStorage.setItem('adminLogged', 'false');
							  $rootScope.adminLogged = false;
							  localStorage.clear(); 
							  $location.path("/login");
						  }
				  }
	});

	app.controller("report",function($scope,$rootScope, $http, $location){

			$scope.student = function() {
				$location.path("/student_enrollment/student");
			};

			$scope.subject = function() {
				$location.path("/student_enrollment/subject");
			};

			$scope.enroll = function() {
				$location.path("/student_enrollment/enroll");
			};

			$scope.report = function() {
				window.location.reload();
				$location.path("/student_enrollment/report");
			};
			
			$scope.Sidebar = function() {
				var sidebar = document.getElementById("enrollmentSidebar");
				if (sidebar.style.display === "none") {
					document.getElementById("pageview").style.marginLeft = "15%";
					sidebar.style.width = "15%";
					sidebar.style.display = "block";
				} else {
					document.getElementById("pageview").style.marginLeft = "0%";
					sidebar.style.display = "none";
				}
			};
		
			$scope.findsubj = []; 
			$scope.search = function() {
			var data = {
				edpcode: $scope.searchedp
			};

			$http.post('/api/subjects/search', data)
				.then(function (response) {
					$scope.findsubj = response.data;
				})
			};		
			
			$scope.classlist = []; 
			$scope.enrolledsubjectList = function() {
				var edpcode = $scope.searchedp; 
				$http.get('api/students/enrolledsubjectlist?edpcode=' + edpcode)
					.then(function(response) {
						if (response.data.length === 0) {
							$scope.classlist.length = 0; 
							alert("No Students enrolled for the given EDP Code.");
						} else {	
							$scope.classlist.length = 0; 
							Array.prototype.push.apply($scope.classlist, response.data);
							localStorage.removeItem('SearchedEDPCode');
							localStorage.setItem('SearchedEDPCode', edpcode);
						}
					})
					.catch(function(error) {
						console.error('Error fetching student list:', error);
					});
			};

			function getSearchedEDPCode() {
				return localStorage.getItem('SearchedEDPCode');
			}
		
			$scope.StudeDel = {}; 
			$scope.tempdelete = function() {
				$scope.selectedStudents = $scope.classlist.filter(function(student) {
					return student.selected;
				});
			
				if ($scope.selectedStudents.length > 0) {
					$scope.StudeDel = {
						idnos: $scope.selectedStudents.map(function(student) {
							return student.idno;
						}).join(', ')
					};
			
					localStorage.setItem('IDNOtoDel', JSON.stringify($scope.StudeDel.idnos));

					$scope.classlist = $scope.classlist.filter(function(student) {
						return !$scope.selectedStudents.includes(student);
					});
				}  else {
					alert('No Selected Students.');
				}
			};

			function getIDNOtoDel() {
				var idnos = localStorage.getItem('IDNOtoDel');
				return idnos ? JSON.parse(idnos) : [];
			}			

			$scope.deleteperm = function() {
				var edpcode = getSearchedEDPCode();
				var idnosToDelete = getIDNOtoDel();
			
				if (idnosToDelete.length === 0) {
					alert("Save data successfully.");
				} else {
					$http.post('/api/students/deletemulenrollstudent', { idnos: idnosToDelete, edpcode: edpcode })
						.then(function(response) {
							localStorage.removeItem('IDNOtoDel');
							alert("Save Successfully.");
						})
						.catch(function(error) {
							console.error("Error deleting student: ", error);
						});
				}
			};								

		$scope.pagesizes=[5,10,15,20,30];
		$scope.pageSize=5;
		$scope.currentPage = 0
		$scope.sortType = 'idno';
		$scope.sortReverse = false;

		$scope.sortBy = function (type) {
			if ($scope.sortType === type) {
				$scope.sortReverse = !$scope.sortReverse;
			} else {
				$scope.sortType = type;
				$scope.sortReverse = false;
			}
		};

		$scope.numberOfPages = function() {
			return Math.ceil($scope.classlist.length / $scope.pageSize);
		}     

		$scope.getPages = function() {
			return Array.from({ length: $scope.numberOfPages() }, (_, i) => i);
		};

		$scope.getSheet = function () {
			var totalPages = $scope.numberOfPages();
			return new Array(totalPages);
		};

		$scope.goTosheet = function (page) {
			$scope.currentPage = page;
		}

		$scope.logout = function() {
			var logoutconfirm = confirm("Are you sure you want to logout?");
				if (logoutconfirm) {
					localStorage.setItem('adminLogged', 'false');
					$rootScope.adminLogged = false;
					localStorage.clear(); 
					$location.path("/login");
				}
		}
	});