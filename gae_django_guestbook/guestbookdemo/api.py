import json, logging

from google.appengine.api import users
from google.appengine.api.labs import taskqueue
from google.appengine.datastore.datastore_query import Cursor
from google.appengine.api import datastore_errors

from django.http import HttpResponse, QueryDict
from django.views.generic import FormView
from django.views.generic.detail import DetailView
from django.views.generic.edit import DeletionMixin

from guestbookdemo.appconstants import AppConstants
from guestbookdemo.models import Guestbook, Greeting
from guestbookdemo.forms import GreetingForm, APIEditGreetingForm


class JSONResponseMixin(object):

	def render_to_response(self, context, **response_kwargs):
		response = self.get_json_response(self.convert_context_to_json(context),**response_kwargs)
		return response

	def get_json_response(self, content, **httpresponse_kwargs):
		return HttpResponse(content,
							content_type='application/json',
							**httpresponse_kwargs)

	def convert_context_to_json(self, context):
		return json.dumps(context)


class APIListGreeting(JSONResponseMixin, FormView):
	form_class = GreetingForm
	success_url = '/'

	# Using method GET to handle request get list Greeting
	def get(self, request, *args, **kwargs):
		try:
			Cursor(urlsafe=self.request.GET.get('cursor'))
		except datastore_errors.BadValueError:
			return HttpResponse(status=404)

		return super(APIListGreeting, self).get(self, request, *args, **kwargs)

	# Get context data for API get list Greeting
	def get_context_data(self, **kwargs):
		guestbook_name = self.kwargs.get('guestbook_name',
										 AppConstants.get_default_guestbook_name())
		cursor_str = self.request.GET.get('cursor', None)

		# get list of Greeting, next_cursor, is_more
		greetings, next_cursor, is_more = self.get_queryset(guestbook_name, 20, cursor_str)

		greetings_dict = [greeting.to_dict() for greeting in greetings]

		data = {}
		data['greetings'] = greetings_dict
		if next_cursor:
			data['cursor'] = next_cursor.urlsafe()
		data['is_more'] = is_more
		data['guestbook_name'] = guestbook_name

		return data

	# Get queryset for API get list Greeting
	def get_queryset(self,
					 guestbook_name=AppConstants.get_default_guestbook_name(),
					 number_of_greeting=AppConstants.get_default_number_of_greeting(),
					 curs_str=None):

		greetings, nextcurs, more = Guestbook.get_page(guestbook_name,
													   number_of_greeting,
													   curs_str)

		return greetings, nextcurs, more

	# Using method form_valid for API create Greeting
	def post(self, request, *args, **kwargs):
		# convert request.body to request for form validation (if needed)
		try:
			json_object = json.loads(self.request.body)
		except ValueError:
			# invalid json
			self.request.POST = QueryDict(self.request.body)
		else:
			# valid json
			self.request.POST = json_object

		form_class = self.get_form_class()
		form = self.get_form(form_class)

		if form.is_valid():
			return self.form_valid(form)
		else:
			return self.form_invalid(form)

	# Using method form_valid for API create Greeting
	def form_valid(self, form):
		new_greeting = form.save_greeting()
		if new_greeting:
			if users.get_current_user():
				user_email = users.get_current_user().email()
			else:
				user_email = "Anonymous"

			taskqueue.add(url='/send_email/',
						  method='GET',
						  params={'user_email': user_email})

			response = HttpResponse(status=204)
			return response
		else:
			response = HttpResponse(status=404)
			return response

	# Using method form_invalid for API create Greeting
	def form_invalid(self, form):
		response =  HttpResponse(status=404)
		return response


class APIGreetingDetail(JSONResponseMixin, DetailView, FormView, DeletionMixin):
	object = Greeting
	form_class = APIEditGreetingForm
	success_url = "/"

	# Using method get_object for action get greeting
	def get_object(self, queryset=None):
		guestbook_name = self.kwargs.get('guestbook_name',
										 AppConstants.get_default_guestbook_name())
		greeting_id = self.kwargs.get('greeting_id', -1)

		greeting = Guestbook.get_greeting_by_id(guestbook_name, greeting_id)
		if greeting:
			return greeting
		else:
			return None

	# Using method get for action get greeting
	def get_context_data(self, **kwargs):
		if self.object:
			data = self.object.to_dict()
		else:
			data = {"error": "wrong greeting id"}

		return data

	# Dont use method Post
	def post(self, request, *args, **kwargs):
		return HttpResponse(status=404)

	# Using method PUT for action update greeting
	def put(self, *args, **kwargs):
		# convert request.body to request for form validation (if needed)
		if not self.request.POST:
			try:
				json_object = json.loads(self.request.body)
			except ValueError:
				# invalid json
				self.request.POST = QueryDict(self.request.body)
			else:
				# valid json
				self.request.POST = json_object

		# get data for verify role
		greeting_id = self.kwargs.get('greeting_id', -1)
		guestbook_name = self.kwargs.get('guestbook_name',
										 AppConstants.get_default_guestbook_name())
		if self.canUpdateGreeting(guestbook_name, greeting_id):
			form_class = self.get_form_class()
			form = self.get_form(form_class)
			if form.is_valid():
				return self.form_valid(form)
			else:
				return self.form_invalid(form)
		else:
			return HttpResponse(status=404)

	# Using method form_valid for action update greeting
	def form_valid(self, form):
		greeting_id = self.kwargs.get('greeting_id', -1)
		guestbook_name = self.kwargs.get('guestbook_name',
										 AppConstants.get_default_guestbook_name())
		if form.update_greeting(guestbook_name, greeting_id):
			return HttpResponse(status=204)
		else:
			return HttpResponse(status=404)

	# Using method form_invalid for action update greeting
	def form_invalid(self, form):
		return HttpResponse(status=404)

	# Using method delete for action delete greeting
	def delete(self, request, *args, **kwargs):
		greeting_id = self.kwargs.get('greeting_id', -1)
		guestbook_name = self.kwargs.get('guestbook_name',
										 AppConstants.get_default_guestbook_name())
		if self.canDeleteGreeting():
			if Guestbook.delete_greeting_by_id(guestbook_name, greeting_id):
				return HttpResponse(status=204)
			else:
				return HttpResponse(status=404)
		else:
			return HttpResponse(status=404)

	# Verify this user can update Greeting
	def canUpdateGreeting(self, guestbook_name, greeting_id):
		if users.is_current_user_admin():
			return True
		elif users.get_current_user():
			greeting = Guestbook.get_greeting_by_id(guestbook_name, greeting_id)
			if greeting:
				return users.get_current_user().nickname() == greeting.author
			else:
				return False
		else:
			return False

	# Verify this user can delete Greeting
	def canDeleteGreeting(self):
		if users.is_current_user_admin():
			return True
		else:
			return False