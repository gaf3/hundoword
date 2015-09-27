from django.conf.urls import patterns, url

from learning import views

urlpatterns = patterns('',
    url(r'^v0/register/$', views.register, name='register'),
    url(r'^v0/token/$', 'rest_framework.authtoken.views.obtain_auth_token'),
    url(r'^v0/achievement/(?P<pk>-?\d+|)/?$', views.achievement, name='achievement'),
    url(r'^v0/program/(?P<pk>-?\d+|)/?$', views.program, name='program'),
    url(r'^v0/program/(?P<pk>-?\d+|)/(?P<action>-?append|remove)/?$', views.program, name='program_action'),
    url(r'^v0/student/(?P<pk>-?\d+|)/?$', views.student, name='student'),
    url(r'^v0/student/(?P<pk>-?\d+|)/(?P<action>-?append|remove|attain|yield|position|history)/?$', views.student, name='student_action'),
)