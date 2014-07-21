__author__ = 'NhatHV'
import logging

from google.appengine.api import users, mail

from django.views.generic import View
from django.http import HttpResponse

from guestbookdemo.appconstants import AppConstants


class SendEmail(View):

    def get(self, request, *args, **kwargs):
        useremail = self.request.GET.get('useremail')
        self.send_email(useremail)

        return HttpResponse('Email has been sent')

    def send_email(self, useremail):
        if useremail is not None:
            message = mail.EmailMessage()
            message.sender = useremail
            message.to = AppConstants.get_default_receiver_email()
            message.subject = "Have new greeting"
            message.body = """
                Hello administrator!

                A new greeting is written by %s, please verify this content at
                    http://upheld-quasar-641.appspot.com

                """ % useremail

            message.send()