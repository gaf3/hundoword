from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

# Create your models here.

class Achievement(models.Model):

    name = models.CharField(max_length=64,unique=True)
    slug = models.CharField(max_length=32,unique=True)
    description = models.CharField(max_length=255,blank=True,default="")
    progression = models.IntegerField(unique=True)
    color = models.CharField(max_length=16,blank=True,default="")

    class Meta:
        ordering = ['progression']

    def __unicode__(self):
        return self.name


class Program(models.Model):

    name = models.CharField(max_length=128,unique=True)
    description = models.CharField(max_length=255,blank=True,default="")

    class Meta:
        ordering = ['name']

    def __unicode__(self):
        return self.name


class ProgramWord(models.Model):

    program = models.ForeignKey(Program,related_name='words')
    word = models.CharField(max_length=128)

    class Meta:
        ordering = ['program','word']
        unique_together = (('program', 'word'),)

    def __unicode__(self):
        return "%s - %s" % (self.program, self.word)


class Student(models.Model):

    teacher = models.ForeignKey(User)
    first_name = models.CharField(max_length=128,blank=True,default="")
    last_name = models.CharField(max_length=128,blank=True,default="")
    age = models.IntegerField(blank=True,null=True)

    class Meta:
        unique_together = (('teacher', 'last_name', 'first_name'),)
        ordering = ['teacher','last_name','first_name']

    def __unicode__(self):
        return "%s %s (%s)" % (self.first_name, self.last_name, self.teacher)


class StudentWord(models.Model):

    student = models.ForeignKey(Student,related_name='words')
    word = models.CharField(max_length=128)
    focus = models.BooleanField(default=False)
    achievements = models.ManyToManyField(Achievement)

    class Meta:
        ordering = ['student','word']
        unique_together = (('student', 'word'),)

    def __unicode__(self):
        return "%s - %s" % (self.student, self.word)


class Progress(models.Model):

    student = models.ForeignKey(Student,related_name='progress')
    achievement = models.ForeignKey(Achievement)
    word = models.CharField(max_length=128)
    held = models.BooleanField()
    at = models.DateTimeField('date/time',blank=True,default=timezone.now)

    class Meta:
        ordering = ['-id']

    def __unicode__(self):
        return "%s - %s - %s (%s) - %s" % (self.student, self.word, self.achievement, self.held, self.at)


