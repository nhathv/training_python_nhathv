from django.conf.urls import patterns, url

from guestbookdemo import views
from guestbookdemo.utils import SendEmail
from guestbookdemo.api import APIListGreeting, APIGreetingDetail

urlpatterns = patterns('',
                       url(r'^$', views.MainPageView.as_view(), name='mainpage'),
                       url(r'^sign_guestbook/$', views.SignGuestbook.as_view(),
                           name='sign_guestbook'),
                       url(r'^switch_guestbook/$', views.SwitchGuestbook.as_view(),
                           name='switch_guestbook'),
                       url(r'^send_email/$', SendEmail.as_view()),
                       url(r'^delete/$', views.MainPageView.as_view(),
                           name='mainpage-delete-message'),
                       url(r'^edit/$', views.EditGreeting.as_view(), name='edit-message'),
                       # API url handle
                       url(r'^api/guestbook/(?P<guestbook_name>(.)+)/greeting/$',
                           APIListGreeting.as_view(),
                           name="list-greeting"),
                       url(
	                       r'^api/guestbook/(?P<guestbook_name>(.)+)/greeting/(?P<greeting_id>(.)+)$',
	                       APIGreetingDetail.as_view(),
	                       name="detail-greeting"),
                       # dojo-demo
                       url(r'^dojo/$', views.DojoGuestbook.as_view())
                       )
