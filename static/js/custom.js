var grades_dict

function displayGradesData(quarter) {
	/* 
	This function takes the school quarter string as an argument and displays a table on the page for the quarter.
	Quarter is either 'Q1', 'Q2', 'Q3', 'Q4'
	*/
	
	// makes sure grade-disp-box div is shown
	$("#grade-disp-box").removeAttr('hidden');
	// selects classes from all classes dict based on quarter parameter
	var classes = grades_dict[quarter];
	// definining blank string to be table html
	var table_html = '';
	
	// iterates through classes in list of classes. "_class" is a dictionary {class_name:grade}
	for(var _class in classes) {
		
		// iterates through class dict (I think this is the best way to get key / values
		for(var class_name in classes[_class]) {
			
			var stripped_class_name = class_name.replace(/\s/g, '');
			var pretty_class_grade = classes[_class][class_name];
			
			// if the grade is null, there is no grade entered
			if(classes[_class][class_name] == null){
				pretty_class_grade = "No Grade"
			}
			
			// HTML for main table
			table_html += "<tr>";
			table_html += "<td class='class-name'>" + class_name + "</td>";
			table_html += "<td class='grade'>" + "<input type='text' value='" + pretty_class_grade + "'></td>";
			table_html += "<td class='class-level-selectors'>";
			table_html += "<div id='radioBtn' class='btn-group'>"; 
			table_html += "<a class='btn btn-primary btn-sm notActive' data-toggle='" + stripped_class_name + "' data-title='Honors'>Honors</a>";
			table_html += "<a class='btn btn-primary btn-sm notActive' data-toggle='" + stripped_class_name + "' data-title='AP'>AP</a>";
			table_html += "<a class='btn btn-primary btn-sm active' data-toggle='" + stripped_class_name + "' data-title='None'>None</a>";
			table_html += "</div>";
			table_html += "<input class='boost' type='hidden' value='None' name='" + stripped_class_name + "' id='" + stripped_class_name + "'>";
			table_html += "<td class='fa fa-trash remove-btn' id='remove" + stripped_class_name + "' onclick='removeClass(this)'>";
			table_html += "</td>";
			table_html += "</tr>";

		}
	}

	// actually adding table html to page
	document.getElementById('grades-disp').innerHTML = '<table id="classes-list">' + table_html + '</table>';
	
	// run the calculate gpa function to go ahead and display the GPA
	calculateGpa();
}

function restoreClasses() {
	/*
	Linked to the 'Restore Classes' button. Reads the value of the radio buttons for quarter selection 
	and if it is not none, it just reruns displayGradesData() effectively resetting
	*/
	
	if (document.getElementById('quarter-input').value != 'None'){
		displayGradesData(document.getElementById('quarter-input').value);
	}
}

function calculateGpa() {
	/*
	This function iterates through the HTML on the page and collects classes/grades/gpa boosts 
	and then translates them into a GPA and displays it on the page
	*/
	
	// selects all the '.grade' elements
	var classes_list = document.getElementById("classes-list").getElementsByClassName("grade");
	// selects all the '.boost' elements 
	var boosts = document.getElementById("classes-list").getElementsByClassName("boost");
	// raw undivided GPA sum
	var grades_sum = 0;
	// number of classes that will count toward GPA
	var entered_classes = 0;
	
	// iterates through elements containing classes in HTML 
	for (var j = 0; j < classes_list.length; j++){
		// retrieves grade from input box
		var grade = classes_list[j].getElementsByTagName("input")[0].value;
		
		// tries to parse float. If it can't be parsed (str or other), the result is falsy
		if(parseFloat(grade)){
			entered_classes++;
			// calls gpa_equiv function to convert grade out of 100 to a GPA
			grades_sum += gpa_equiv(parseFloat(grade));
		}
	}
	
	// iterates through elements containing the level of the class (honors/ap/regular)
	for (var i = 0; i < boosts.length; ++i) {
		
		// adds boosts to undivided GPA accordingly
		if(boosts[i].value == "Honors"){
			grades_sum += .25;
		} else if (boosts[i].value == "AP") {
			grades_sum += .5;
		}
	}
	
	// divides raw GPA by number of classes and rounds to first 2 digits
	gpa = (Math.round( (grades_sum / entered_classes) * 10 ) / 10).toFixed(1);
	// depending on user input, the GPA would not be able to be calculated and should be 0
	if(gpa == NaN || gpa == Infinity || gpa == 'NaN' || gpa == 'Infinity' || !gpa) {
		gpa = "0.0";
	}
	
	// Actually changing HTML on page to display GPA
	document.getElementById("gpa-display").innerHTML = "Your GPA is " + gpa;
}

function gpa_equiv(grade) {
	/*
	Simple function that takes in a number grade and returns its GPA equivalent 
	*/
	
	// Grade is rounded for calculation bc this is how MySchoolApp does it. 
    rounded_grade = Math.round(grade);

	if(rounded_grade >= 97){
		return 4.3
	} else if (rounded_grade >= 93) {
		return 4.0
	} else if (rounded_grade >= 90) {
		return 3.7
	} else if (rounded_grade >= 87) {
		return 3.3
	} else if (rounded_grade >= 83) {
		return 3.0
	} else if (rounded_grade >= 80) {
		return 2.7
	} else if (rounded_grade >= 77) {
		return 2.3
	} else if (rounded_grade >= 73) {
		return 2.0
	} else if (rounded_grade >= 70) {
		return 1.7
	} else if (rounded_grade < 70) {
		return 0.0
	}
}

function promptForNewClass() {
	/*
	Just adds HTML to page with input box to prompt for a new class when user presses 
	button to add a class 
	*/
	document.getElementById('add-class').innerHTML = "New Class Name<input id='new-class-input' type='text'><button onclick='addClass()'>Enter</button>";
}

function addClass() {
	/*
	This function adds a new clas to the already existing table. It gets the class name and number from 
	the input box created by promptForNewClass()
	*/
	var class_name = document.getElementById('new-class-input').value;
	var this_class_num = document.getElementById('classes-list').getElementsByTagName('li').length + 1;
	var new_class_html = '';
	
	new_class_html += "<tr>";
	new_class_html += "<td class='class-name'>" + class_name + "</td>";
	new_class_html += "<td class='grade'>" + "<input type='text' value='No Grade'></td>";
	new_class_html += "<td class='class-level-selectors'>";
	new_class_html += "<div id='radioBtn' class='btn-group'>"; 
	new_class_html += "<a class='btn btn-primary btn-sm notActive' data-toggle='customclass" + this_class_num + "' data-title='Honors'>Honors</a>";
	new_class_html += "<a class='btn btn-primary btn-sm notActive' data-toggle='customclass" + this_class_num + "' data-title='AP'>AP</a>";
	new_class_html += "<a class='btn btn-primary btn-sm active' data-toggle='customclass" + this_class_num + "' data-title='None'>None</a>";
	new_class_html += "</div>";
	new_class_html += "<input class='boost' type='hidden' value='None' name='customclass" + this_class_num + "' id='customclass" + this_class_num + "'>";
	new_class_html += "<td class='fa fa-trash remove-btn' id='removecustomclass" + this_class_num + "' onclick='removeClass(this)'>";
	new_class_html += "</td>";
	new_class_html += "</tr>";				
	document.getElementById('classes-list').innerHTML += new_class_html;
	
	// clearing the prompt for new class
	document.getElementById('add-class').innerHTML = '';
}

function removeClass(element) {
	/*
	Removes the parent of the element that triggers it. This is used to delete a class from the table when
	the trash can within the row is clicked
	*/
	
	document.getElementById(element.id).parentElement.remove();
	
	// recalculate GPA to account for the class you just removed
	calculateGpa();
}

$(document).ready(function () {
	/*
	Some JQuery. This js is a weird mix of regular js and JQuery but I'm still learning and this is my first time to 
	ever write javascript so bare with me.  
	*/
	
	// Runs when the login form is submitted
	$('#main-form').submit(function(event) {
		
		// prevents the page from reloading
		event.preventDefault();
		
		// Adds status text 
		document.getElementById('login-status').innerHTML = "Logging in...";
		
		// Posts the login data to app views.py which then calls backend python script. 
		$.post('/', $(this).serialize(), function(data){
			
			// parsing data returned from backend script
			grades_dict = JSON.parse(data);
			
			// if the script returns false, then MySA returned login failed
			if(grades_dict === false){
				document.getElementById('login-status').innerHTML = "There was a problem logging in.";
			
			// if returned null, then something broke with the backend script
			} else if (grades_dict === null) {
				document.getElementById('login-status').innerHTML = "There was an error with the server.";
				
			// if not false or null, then data should be a dict like expected
			} else {
				
				// clearing login status
				document.getElementById('login-status').innerHTML = "";
				
				// checking what the current quarter is, selecting radio button, and displaying classes/GPA
				if(grades_dict['current_qtr'] == 'Q1'){
					document.getElementById('quarter-input').value = 'Q1';
					$('#fall-semester-selector').trigger('click')
					displayGradesData('Q1');
				} else if(grades_dict['current_qtr'] == 'Q2'){
					document.getElementById('quarter-input').value = 'Q2';
					$('#fall-semester-selector').trigger('click')
					displayGradesData('Q2');
				} else if(grades_dict['current_qtr'] == 'Q3'){
					document.getElementById('quarter-input').value = 'Q3';
					$('#fall-semester-selector').trigger('click')
					displayGradesData('Q3');
				} else if(grades_dict['current_qtr'] == 'Q4'){
					document.getElementById('quarter-input').value = 'Q4';
					$('#fall-semester-selector').trigger('click')
					displayGradesData('Q4');
				}
				
				// AFTER the table is rendered (important lol), scroll it in to view all smooth like
				document.querySelector('table').scrollIntoView({
					behavior: 'smooth'
				})	
			}
			
		// if for whatever reason the request fails, display an error message
		}).fail(function(xhr) {
			document.getElementById('gpa-display').innerHTML = "uh oh that's not good. Something bad happened with your request to this site."
		});	
	})
	
	// Listener for class level buttons (honors/ap/none)
	$('body').on('click', '#radioBtn a', function(){

		var sel = $(this).data('title');
		var tog = $(this).data('toggle');
		
		// triggers keyup, which in turn recalculates the GPA
		$('#'+tog).prop('value', sel).trigger('keyup');
		
		$('a[data-toggle="'+tog+'"]').not('[data-title="'+sel+'"]').removeClass('active').addClass('notActive');
		$('a[data-toggle="'+tog+'"][data-title="'+sel+'"]').removeClass('notActive').addClass('active');
	})
	
	// Listener for quarter selector radio buttons (Q1/Q2/Q3/Q4)
	$('body').on('click', '#quarter-selectors a', function () {
		
		var sel = $(this).data('title');
		var tog = $(this).data('toggle');
		
		// triggers keyup, which in turn recalculates the GPA
		$('#'+tog).prop('value', sel).trigger('keyup');
		
		$('a[data-toggle="'+tog+'"]').not('[data-title="'+sel+'"]').removeClass('active').addClass('notActive');
		$('a[data-toggle="'+tog+'"][data-title="'+sel+'"]').removeClass('notActive').addClass('active');
		
		// When the quarter is changed, update the table accordingly
		if (document.getElementById('quarter-input').value != 'None'){
			displayGradesData(document.getElementById('quarter-input').value)
		}
	})
	
	// recalculate GPA when grades or radio buttons are changed
	$('body').on('keyup', '#classes-list,.boost', function () {
		calculateGpa()
	})
})