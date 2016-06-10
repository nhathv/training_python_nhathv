import urllib

from google.appengine.api import users
from google.appengine.api.labs import taskqueue

from django.views.generic import TemplateView
from django.views.generic.edit import FormView
from django.http import HttpResponseRedirect

from guestbookdemo.models import Guestbook
from guestbookdemo.forms import GreetingForm, SwitchGuestbookForm, EditGreetingForm
from guestbookdemo.appconstants import AppConstants


class MainPageView(TemplateView):
	template_name = "guestbook/main_page.html"

	def get_context_data(self, **kwargs):
		context = super(MainPageView, self).get_context_data(**kwargs)

		# get guestbook_name
		guestbook_name = self.request.GET.get('guestbook_name',
		                                      AppConstants.get_default_guestbook_name())

		# get list of Greeting
		greetings = self.get_queryset()

		# create login/logout url
		if users.get_current_user():
			url = users.create_logout_url(self.request.get_full_path())
			url_linktext = 'Logout'
		else:
			url = users.create_login_url(self.request.get_full_path())
			url_linktext = 'Login'

		context['guestbook_name'] = guestbook_name
		context['greetings'] = greetings
		context['url'] = url
		context['url_linktext'] = url_linktext
		context['is_user_admin'] = users.is_current_user_admin()
		context['user_login'] = users.get_current_user()

		# get greeting form in in_valid case (if needed)
		greeting_form = kwargs.get('sign_guestbook_form',
		                           GreetingForm(initial={'guestbook_name': guestbook_name}))
		context['sign_guestbook_form'] = greeting_form

		# get switch guestbookdemo form in in_valid case (if needed)
		switch_guestbook_form = kwargs.get('switch_guestbook_form',
		                                   SwitchGuestbookForm(initial={
			                                   'guestbook_name': guestbook_name}))
		context['switch_guestbook_form'] = switch_guestbook_form

		return context

	def get_queryset(self, number_of_greeting=AppConstants.get_default_number_of_greeting()):
		guestbook_name = self.request.GET.get('guestbook_name',
		                                      AppConstants.get_default_guestbook_name())
		greetings = Guestbook.get_lastest_greeting(guestbook_name, number_of_greeting)

		return greetings

	def get(self, request, *args, **kwargs):
		action = self.request.GET.get('action', 'list')

		if action == 'delete-message':
			# get greeting_id
			greeting_id = self.request.GET.get('greeting_id', -1)

			if greeting_id > 0:
				# get guestbook_name
				guestbook_name = self.request.GET.get('guestbook_name',
				                                      AppConstants.get_default_guestbook_name())
				Guestbook.delete_greeting_by_id(guestbook_name, greeting_id)

				return HttpResponseRedirect('/?' +
				                            urllib.urlencode({'guestbook_name': guestbook_name}))

		return super(MainPageView, self).get(request, *args, **kwargs)


class SignGuestbook(MainPageView, FormView):
	template_name = "guestbook/main_page.html"
	form_class = GreetingForm
	success_url = '/'

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

		# get guestbook_name
		guestbook_name = form.cleaned_data['guestbook_name']
		self.success_url = '/?' + urllib.urlencode({'guestbook_name': guestbook_name})

		return super(SignGuestbook, self).form_valid(form)

	def form_invalid(self, form):

		return self.render_to_response(self.get_context_data(sign_guestbook_form=form))


class SwitchGuestbook(MainPageView, FormView):
	template_name = "guestbook/main_page.html"
	form_class = SwitchGuestbookForm
	success_url = '/'

	def form_valid(self, form):
		guestbook_name = form.cleaned_data['guestbook_name']
		self.success_url = '/?' + urllib.urlencode({'guestbook_name': guestbook_name})

		return super(SwitchGuestbook, self).form_valid(form)

	def form_invalid(self, form):
		return self.render_to_response(self.get_context_data(switch_guestbook_form=form))


class EditGreeting(FormView):
	template_name = "guestbook/edit_greeting.html"
	form_class = EditGreetingForm
	success_url = "/"

	def get_context_data(self, **kwargs):
		context = super(EditGreeting, self).get_context_data(**kwargs)

		# get greeting_id
		greeting_id = self.request.GET.get('greeting_id', -1)
		# get guestbook_name
		guestbook_name = self.request.GET.get('guestbook_name',
		                                      AppConstants.get_default_guestbook_name())

		greeting = Guestbook.get_greeting_by_id(guestbook_name, greeting_id)
		if greeting:
			if greeting.author:
				greeting_author = greeting.author
			else:
				greeting_author = "Anonymous"
			edit_form = EditGreetingForm(initial={'guestbook_name': guestbook_name,
			                                      'greeting_id': greeting_id,
			                                      'greeting_author': greeting_author,
			                                      'greeting_content': greeting.content})

			context['form'] = edit_form

		return context

	def form_valid(self, form):
		form.update_greeting()
		guestbook_name = form.cleaned_data['guestbook_name']
		self.success_url = '/?' + urllib.urlencode({'guestbook_name': guestbook_name})

		return super(EditGreeting, self).form_valid(form)

	def form_invalid(self, form):
		return self.render_to_response(self.get_context_data(form=form))


class DojoGuestbook(TemplateView):
	template_name = "guestbook/dojo_guestbook.html"

	def get_context_data(self, **kwargs):
		context = super(DojoGuestbook, self).get_context_data(**kwargs)

		# create login/logout url
		if users.get_current_user():
			url = users.create_logout_url(self.request.get_full_path())
			url_linktext = 'Logout'
			context['user_login'] = users.get_current_user().nickname()
			context['is_user_admin'] = users.is_current_user_admin()
		else:
			url = users.create_login_url(self.request.get_full_path())
			url_linktext = 'Login'

		context['url'] = url
		context['url_linktext'] = url_linktext

		return context
