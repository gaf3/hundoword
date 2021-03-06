from django.conf.urls import patterns, url

from learning import views

urlpatterns = patterns('',
    url(r'^v0/register/$', views.register, name='register'),
    url(r'^v0/token/$', 'rest_framework.authtoken.views.obtain_auth_token'),
    url(r'^v0/achievement/(?P<pk>-?\d+|)/?$', views.achievement, name='achievement'),
    url(r'^v0/achievement/(?P<pk>-?[^/]+|)/(?P<action>-?slug)/?$', views.achievement, name='achievement_action'),
    url(r'^v0/lesson/(?P<pk>-?\d+|)/?$', views.lesson, name='lesson'),
    url(r'^v0/lesson/(?P<pk>-?\d+|)/(?P<action>-?append|remove)/?$', views.lesson, name='lesson_action'),
    url(r'^v0/student/(?P<pk>-?\d+|)/?$', views.student, name='student'),
    url(r'^v0/student/(?P<pk>-?\d+|)/(?P<action>-?append|remove|focus|blur|attain|yield|position|learned|evaluate|chart|history)/?$', views.student, name='student_action'),
    url(r'^v0/audio/(?P<word>-?.+)/$', views.audio, name='audio'),
)