from django.contrib import admin
from learning.models import *

class AchievementAdmin(admin.ModelAdmin):
    list_display = ('name','description')
    search_fields = ['name']

class ProgramAdmin(admin.ModelAdmin):
    list_display = ('name','description')
    search_fields = ['name']

admin.site.register(Achievement,AchievementAdmin)
admin.site.register(Program,ProgramAdmin)
admin.site.register(Student)
admin.site.register(Progress)