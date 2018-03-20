# GPA CAlC SITE / MAIN / VIEWS
from django.shortcuts import render, HttpResponse
from django.views.generic import TemplateView
from django.http import HttpResponseRedirect
from .forms import BasicForm
from . import mysa_scraper
import json
# Create your views here.


def home_page(request):
	
	if request.method == 'POST':
		form = BasicForm(request.POST)
		
		if form.is_valid():
			username = form.cleaned_data['username']
			password = form.cleaned_data['password']
			ma = mysa_scraper.Scraper(username, password)
			try:
				login_successful = ma.login()
				
				if not login_successful:
					classes_info = False
				else:
					classes_info = ma.get_parsed_grades('2017 - 2018')
			except:
				classes_info = None
				

		return HttpResponse(json.dumps(classes_info))
			
	else:
		form = BasicForm()
	
	return render(request, 'home.html', {'form':form})
	