from google.appengine.api import mail

from django.views.generic import View
from django.http import HttpResponse

from guestbookdemo.appconstants import AppConstants


class SendEmail(View):
	def get(self, request, *args, **kwargs):
		# get user email
		user_email = self.request.GET.get('user_email', 'Anonymous')
		self.send_email(user_email)

		return HttpResponse('Email has been sent')

	def send_email(self, user_email):
		message = mail.EmailMessage()
		message.sender = AppConstants.get_default_sender_email()
		message.to = AppConstants.get_default_receiver_email()
		message.subject = "Have new greeting"
		message.body = """
            Hello administrator!

            A new greeting is written by %s, please verify this content at
                http://upheld-quasar-641.appspot.com

            """ % user_email

		message.send()
