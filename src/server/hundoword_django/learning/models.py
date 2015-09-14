from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Achievement(models.Model):

    name = models.CharField(max_length=32,unique=True)
    description = models.CharField(max_length=255,default="")

    class Meta:
        ordering = ['name']

    def __unicode__(self):
        return self.name


class Program(models.Model):

    name = models.CharField(max_length=128,unique=True)
    description = models.CharField(max_length=255,default="")

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
    first_name = models.CharField(max_length=128)
    last_name = models.CharField(max_length=128)
    age = models.IntegerField(blank=True, null=True)

    class Meta:
        ordering = ['teacher','last_name','first_name']

    def __unicode__(self):
        return "%s %s (%s)" % (self.first_name, self.last_name, self.teacher)


class StudentWord(models.Model):

    student = models.ForeignKey(Student,related_name='words')
    word = models.CharField(max_length=128)
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
    hold = models.BooleanField()
    at = models.DateTimeField('date/time',auto_now_add=True)

    class Meta:
        ordering = ['-at']

    def __unicode__(self):
        return "%s - %s - %s (%s) - %s" % (self.student, self.word, self.achievement, self.hold, self.at)


