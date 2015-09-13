from django.db import models

# Create your models here.

class Word(models.Model):
    text = models.CharField(max_length=64,unique=True)

    class Meta:
        ordering = ['text']

    def __unicode__(self):
        return self.text
