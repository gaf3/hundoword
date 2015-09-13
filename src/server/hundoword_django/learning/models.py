from django.db import models

# Create your models here.

class Word(models.Model):

    text = models.CharField(max_length=64,unique=True)

    class Meta:
        ordering = ['text']

    def __unicode__(self):
        return self.text


class Program(models.Model):

    name = models.CharField(max_length=128,unique=True)
    description = models.CharField(max_length=255,blank=True, null=True)
    word = models.ManyToManyField(Word)

    class Meta:
        ordering = ['name']

    def __unicode__(self):
        return self.name


class Teacher(models.Model):

    first_name = models.CharField(max_length=128,unique=True)
    last_name = models.CharField(max_length=128,unique=True)
    email = models.EmailField(max_length=128,blank=True, null=True)

    class Meta:
        ordering = ['last_name','first_name']

    def __unicode__(self):
        return "%s %s - %s" % (self.first_name, self.last_name, self.email)


class Student(models.Model):

    teacher = models.ForeignKey(Teacher)
    first_name = models.CharField(max_length=128,unique=True)
    last_name = models.CharField(max_length=128,unique=True)
    age = models.IntegerField(blank=True, null=True)

    class Meta:
        ordering = ['teacher','last_name','first_name']

    def __unicode__(self):
        return "%s %s (%s)" % (self.first_name, self.last_name, self.teacher)


class Achievement(models.Model):

    name = models.CharField(max_length=32,unique=True)
    description = models.CharField(max_length=255,blank=True, null=True)

    class Meta:
        ordering = ['name']

    def __unicode__(self):
        return self.name


class StudentWord(models.Model):

    student = models.ForeignKey(Student)
    word = models.ForeignKey(Word)
    achievement = models.ManyToManyField(Achievement)

    class Meta:
        ordering = ['student','word']

    def __unicode__(self):
        return "%s - %s" % (self.student, self.word)