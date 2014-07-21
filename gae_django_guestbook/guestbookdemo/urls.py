__author__ = 'NhatHV'

from django.conf.urls import patterns, url

from guestbookdemo import views

urlpatterns = patterns('',
    url(r'^$', views.MainPageView.as_view(), name='mainpage'),
    url(r'^sign_guestbook/$', views.SignGuestbook.as_view(), name='sign_guestbook'),
    url(r'^switch_guestbook/$', views.SwitchGuestbook.as_view(), name='switch_guestbook'),
)