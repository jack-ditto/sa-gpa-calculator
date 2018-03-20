import requests, json, urllib, re

class Scraper:
	
	USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36"
	
	def __init__(self, username, password):
		self.username = username						# Username string
		self.password = password						# Password string
		self.s = requests.Session()						# Browser object (important to keep  session)
		self.headers = {'user-agent': self.USER_AGENT}	# Set header for browser
		
	def login(self):
		''' 
		Sets parameters to log in and makes the request to login. Response is bool of login successful
		
		'''
		
		sign_in_url = "https://gosaints.myschoolapp.com/api/SignIn"						# API url for signing in
		remember_request_url = "https://gosaints.myschoolapp.com/api/RememberRequest"	# request made after sign in (sets cookies i think)
		sign_in_payload = {
			"From":"",					# blank param (just sent in browser request)
			"Username": self.username,	
			"Password": self.password,
			"remember": "false",
			"InterfaceSource": "WebApp"
		}
		
		self.s.get(remember_request_url, headers=self.headers)
		login_response = self.s.post(sign_in_url, data=sign_in_payload, headers=self.headers)
		self.user_id = login_response.json()["CurrentUserForExpired"]		# user ID from JSON login resp.
		return login_response.json()["LoginSuccessful"]
	
	def get_classes_info(self, year):
		''''
		
		'''
		semesters_info = self.get_semesters_info(year)
		classes_info_url = "https://gosaints.myschoolapp.com/api/datadirect/ParentStudentUserAcademicGroupsGet"
		
		semester_ids = {
			semesters_info[0]['DurationDescription']: semesters_info[0]['DurationId'],
			semesters_info[1]['DurationDescription']: semesters_info[1]['DurationId'],
		}
		
		self.classes_dict = {}
		for semester_name, _id in semester_ids.items():
		
			classes_info_payload = {
				"userId":self.user_id,			# User id
				"schoolYearLabel": year,		# School year (format: "2017-2018")
				"memberLevel": 3,				# No idea what this does
				"persona": 2,					# Same here
				"durationList": _id,	# Semester ID (must get this from different request)
				"markingPeriodId": ''			# No idea
			}
			
			classes_response = self.s.get(classes_info_url, data=classes_info_payload, headers=self.headers)
			self.classes_dict[semester_name] = classes_response.json()
			
		for semester in semesters_info:
			
			if semester['CurrentInd'] == 1:
				self.current_semester = semester['DurationDescription']
				
		return self.classes_dict
		
	def get_semesters_info(self, year):
		'''
		Returns list of dicts containing semester info. 
		'''
		term_info_url = "https://gosaints.myschoolapp.com/api/DataDirect/StudentGroupTermList/"
		term_info_payload = {
			"studentUserId": self.user_id,
			"schoolYearLabel": year,
			"personaId": 2
		}
		
		term_info_response = self.s.get(term_info_url, data=term_info_payload, headers=self.headers)	# JSON object of terms

		semesters_info = []
		for term in term_info_response.json():
			if term['DurationDescription'] == 'Fall Semester' or term['DurationDescription'] == 'Spring Semester':
				semesters_info.append(term)
				
		return semesters_info
		
	def get_quarters_info(self, semester_id):
		
		payload = {
			'userId': self.user_id,
			'personaId': 2,
			'durationSectionList':'[{"DurationId":' + str(semester_id) + ', "LeadSectionList":[{"LeadSectionId":0}]}]'
		}
		
		qtr_info_response = self.s.get('https://gosaints.myschoolapp.com/api/gradebook/GradeBookMyDayMarkingPeriods', data=payload, headers=self.headers).text
		qtr_info_response = json.loads(qtr_info_response)
		qtr_info_dict = {}
		
		for qtr in qtr_info_response:
			qtr_info_dict[qtr['MarkingPeriodDescription']] = qtr['MarkingPeriodId']
			if qtr['CurrentMarkingPeriod']:
				self.current_qtr = qtr['MarkingPeriodDescription']
		
		return qtr_info_dict
		
		
	def get_quarter_grades(self, year):
		
		classes_info_url = "https://gosaints.myschoolapp.com/api/datadirect/ParentStudentUserAcademicGroupsGet"
		quarter_grades_dict = {}
		for semester in self.get_semesters_info(year):
			semester_id = semester['DurationId']
			
			for qtr, qtr_id in self.get_quarters_info(semester_id).items():
				
				classes_info_payload = {
					"userId":self.user_id,			# User id
					"schoolYearLabel": year,		# School year (format: "2017-2018")
					"memberLevel": 3,				# No idea what this does
					"persona": 2,					# Same here
					"durationList": semester_id,	
					"markingPeriodId": qtr_id
				}
				
				classes_response = self.s.get(classes_info_url, data=classes_info_payload, headers=self.headers).json()
				quarter_grades_dict[qtr] = classes_response

		return quarter_grades_dict

				
			
	def get_parsed_grades(self, year):
		'''
		Calls other functions to scrape grades and return a dict of class to grades
		
		year - string of school year. Format: "2016 - 2017"
		semester - string of semester; either "fall" or "spring"

		'''

		all_quarter_grades = self.get_quarter_grades(year)
		pretty_classes_dict = {}

		for qtr, classes in all_quarter_grades.items():
		
			pretty_class_list = []
			for _class in classes:
				
				match = re.match(r'([-A-Za-z0-9.: ]+)(- [0-9]+) \((F?[0-9])\)', _class['sectionidentifier'])

				if match and match.group(1).strip() != 'Study Hall':
					pretty_class_name = match.group(1).strip()
					if '.' in pretty_class_name:
						pretty_class_name = pretty_class_name.replace('.', '')

					pretty_class_list.append({pretty_class_name:_class['cumgrade']})
			
			pretty_classes_dict[qtr] = pretty_class_list
			
		pretty_classes_dict.update({'current_qtr': self.current_qtr})	
		return pretty_classes_dict
	
