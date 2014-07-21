import urllib

from google.appengine.api import users
from google.appengine.api.labs import taskqueue

from django.views.generic import TemplateView
from django.views.generic.edit import FormView

from guestbookdemo.models import Guestbook
from guestbookdemo.forms import GreetingForm, SwitchGuestbookForm
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

        # get greeting form in in_valid case (if needed)
        greeting_form = kwargs.get('sign_guestbook_form',
                                   GreetingForm(initial={'guestbook_name': guestbook_name}))
        context['sign_guestbook_form'] = greeting_form

         # get switch guestbookdemo form in in_valid case (if needed)
        switch_guestbook_form = kwargs.get('switch_guestbook_form',
                                           SwitchGuestbookForm(initial={'guestbook_name': guestbook_name}))
        context['switch_guestbook_form'] = switch_guestbook_form

        return context

    def get_queryset(self, number_of_greeting=AppConstants.get_default_number_of_greeting()):
        guestbook_name = self.request.GET.get('guestbook_name',
                                              AppConstants.get_default_guestbook_name())
        greetings = Guestbook.get_lastest_greeting(guestbook_name, number_of_greeting)

        return greetings


class SignGuestbook(MainPageView, FormView):
    template_name = "guestbook/main_page.html"
    form_class = GreetingForm
    success_url = '/'

    def form_valid(self, form):
        new_greeting = form.save_greeting()
        if new_greeting is not None:
            taskqueue.add(url='/send_email/', method='GET')

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
