from django.core.exceptions import ValidationError
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from jsonfield import JSONField

def validate_words(field,words):

    if not isinstance(words,list):
        raise ValidationError({field: "Must be a list."})

    for word in words:
        if not isinstance(word,str) and not isinstance(word,unicode):
            raise ValidationError({field: "All list items be be strings."})

def unique_words(words):

    unique = []
    for word in words:
        if word not in unique:
            unique.append(word)

    return unique

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
    words = JSONField(blank=True,default=[])

    class Meta:
        ordering = ['name']

    def __unicode__(self):
        return self.name

    def clean(self, *args, **kwargs):

        validate_words("words",self.words)

        super(Program, self).clean(*args, **kwargs)


    def save(self, *args, **kwargs):

        self.full_clean()
        self.words = unique_words(self.words)

        super(Program, self).save(*args, **kwargs) 


class Student(models.Model):

    teacher = models.ForeignKey(User)
    first_name = models.CharField(max_length=128,blank=True,default="")
    last_name = models.CharField(max_length=128,blank=True,default="")
    age = models.IntegerField(blank=True,null=True)
    words = JSONField(blank=True,default=[])
    focus = JSONField(blank=True,default=[])
    position = JSONField(blank=True,default={})

    class Meta:
        unique_together = (('teacher', 'last_name', 'first_name'),)
        ordering = ['teacher','last_name','first_name']

    def __unicode__(self):
        return "%s %s (%s)" % (self.first_name, self.last_name, self.teacher)

    def clean(self, *args, **kwargs):

        validate_words("words",self.words)
        validate_words("focus",self.focus)

        if self.focus:

            # Make sure all focus words are student words
            extra = []
            for word in self.focus:
                if word not in self.words:
                    extra.append("Word '%s' not found." % word)

            if extra:
                raise ValidationError({'focus': extra})

        super(Student, self).clean(*args, **kwargs)

    def save(self, *args, **kwargs):

        self.full_clean()
        self.words = unique_words(self.words)
        self.focus = unique_words(self.focus)

        super(Student, self).save(*args, **kwargs) 


    def append_words(self,words): 

        for word in words:
            if word not in self.words:
                self.words.append(word)

    def remove_words(self,words): 

        for word in words:
            if word in self.words:
                self.words.pop(self.words.index(word))
            if word in self.focus:
                self.focus.pop(self.focus.index(word))

    def focus_words(self,words): 

        for word in words:
            if word not in self.focus:
                self.focus.append(word)

    def blur_words(self,words): 

        for word in words:
            if word in self.focus:
                self.focus.pop(self.focus.index(word))

    def progress_position(self,progress):

        self.position.setdefault(progress.word,[])

        if progress.held and progress.achievement.id not in self.position[progress.word]:
            self.position[progress.word].append(progress.achievement.id)
        elif not progress.held and progress.achievement.id in self.position[progress.word]:
            self.position[progress.word].pop(self.position[progress.word].index(progress.achievement.id))


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

    def clean(self, *args, **kwargs):

        if self.word not in self.student.words:
            raise ValidationError({'word': "Word '%s' not found." % self.word})

        super(Progress, self).clean(*args, **kwargs)

    def save(self, *args, **kwargs):

        self.full_clean()

        super(Progress, self).save(*args, **kwargs) 


