from django.conf.urls import patterns, url

from learning import views

urlpatterns = patterns('',
    url(r'^register/$', views.register, name='register'),
    url(r'^token/$', 'rest_framework.authtoken.views.obtain_auth_token'),
    url(r'^achievement/(?P<pk>-?\d+|)/?$', views.achievement, name='achievement'),
    url(r'^program/(?P<pk>-?\d+|)/?$', views.program, name='program'),
    url(r'^program/(?P<pk>-?\d+|)/(?P<action>-?append|remove)/?$', views.program, name='program_action'),
    url(r'^student/(?P<pk>-?\d+|)/?$', views.student, name='student'),
    url(r'^student/(?P<pk>-?\d+|)/(?P<action>-?append|remove|attain|yield|position|progress)/?$', views.student, name='student_action'),
)