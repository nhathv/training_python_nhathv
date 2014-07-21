__author__ = 'NhatHV'

from google.appengine.api import users

from django import forms

from guestbookdemo.models import Guestbook


class GreetingForm(forms.Form):
    guestbook_name = forms.CharField(widget=forms.HiddenInput(),
                                     required=False,)
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

        Guestbook.put_greeting_with_data(guestbook_name, greeting_author, greeting_content)


class SwitchGuestbookForm(forms.Form):
    guestbook_name = forms.CharField(max_length=20,
                                     label="Guestbook name",)