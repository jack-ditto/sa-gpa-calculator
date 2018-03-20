# GPA CALC SITE / MAIN / FORMS
from django import forms

class BasicForm(forms.Form):
	username = forms.CharField(label='Username:', max_length=100)
	password = forms.CharField(widget=forms.PasswordInput)