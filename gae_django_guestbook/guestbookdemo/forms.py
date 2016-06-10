from google.appengine.api import users

from django import forms

from guestbookdemo.models import Guestbook


class GreetingForm(forms.Form):
	guestbook_name = forms.CharField(widget=forms.HiddenInput(),
	                                 required=False, )
	content = forms.CharField(max_length=10,
	                          label="",
	                          widget=forms.Textarea)

	def save_greeting(self):
		guestbook_name = self.cleaned_data['guestbook_name']
		if users.get_current_user():
			greeting_author = users.get_current_user().nickname()
		else:
			greeting_author = None
		greeting_content = self.cleaned_data['content']

		new_greeting = Guestbook.put_greeting_with_data(guestbook_name,
		                                                greeting_author,
		                                                greeting_content)

		return new_greeting


class SwitchGuestbookForm(forms.Form):
	guestbook_name = forms.CharField(max_length=20,
	                                 label="Guestbook name", )


class EditGreetingForm(forms.Form):
	guestbook_name = forms.CharField(widget=forms.HiddenInput(),
	                                 required=False, )
	greeting_id = forms.CharField(widget=forms.HiddenInput(),
	                              required=False, )
	greeting_author = forms.CharField(label="Author",
	                                  required=False,
	                                  widget=forms.TextInput(attrs={'readonly': 'readonly'}))
	greeting_content = forms.CharField(label="",
	                                   required=True,
	                                   max_length=10,
	                                   widget=forms.Textarea)

	def update_greeting(self):
		guestbook_name = self.cleaned_data['guestbook_name']
		greeting_id = self.cleaned_data['greeting_id']
		greeting_content = self.cleaned_data['greeting_content']
		if users.get_current_user():
			greeting_updated_by = users.get_current_user().nickname()
		else:
			greeting_updated_by = None

		new_greeting = Guestbook.update_greeting_by_id(guestbook_name,
		                                               greeting_id,
		                                               greeting_content,
		                                               greeting_updated_by)

		return new_greeting


class APIEditGreetingForm(forms.Form):
	greeting_author = forms.CharField(label="Author",
	                                  required=False,
	                                  widget=forms.TextInput(attrs={'readonly': 'readonly'}))
	greeting_content = forms.CharField(label="",
	                                   required=True,
	                                   max_length=10,
	                                   widget=forms.Textarea)

	def update_greeting(self, guestbook_name, greeting_id):
		greeting_content = self.cleaned_data['greeting_content']
		if users.get_current_user():
			greeting_updated_by = users.get_current_user().nickname()
		else:
			greeting_updated_by = None

		new_greeting = Guestbook.update_greeting_by_id(guestbook_name,
		                                               greeting_id,
		                                               greeting_content,
		                                               greeting_updated_by)

		return new_greeting
