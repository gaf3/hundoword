from django.contrib import admin
from learning.models import *

class AchievementAdmin(admin.ModelAdmin):
    list_display = ('name','description')
    search_fields = ['name']

class LessonAdmin(admin.ModelAdmin):
    list_display = ('name','description')
    search_fields = ['name']

admin.site.register(Achievement,AchievementAdmin)
admin.site.register(Lesson,LessonAdmin)
admin.site.register(Student)
admin.site.register(Progress)