from django.forms import widgets
from rest_framework import serializers

from learning.models import *
from django.contrib.auth.models import User


class JSONField(serializers.Field):

    def to_internal_value(self, data):
        return data

    def to_representation(self, value):
        return value


class CreateUserSerializer(serializers.ModelSerializer):

    email = serializers.EmailField(required=True,allow_blank=False)

    class Meta:
        model = User
        fields = ('email', 'username', 'password')
        write_only_fields = ('password',) 

    def create(self, validated_data):
        user = User(email=validated_data['email'], username=validated_data['username'])
        user.set_password(validated_data['password'])
        user.save()
        return user

    def update(self, instance, validated_data):
        assert instance is None, 'Cannot update users with CreateUserSerializer'


class AchievementSerializer(serializers.ModelSerializer):

    class Meta:
        model = Achievement
        readonly_fields = ('id',)

    def get_display(self, obj):
        return str(obj)


class ProgramSerializer(serializers.ModelSerializer):

    words = JSONField()

    class Meta:
        model = Program
        readonly_fields = ('id')

    def get_display(self, obj):
        return str(obj)


class StudentSerializer(serializers.ModelSerializer):

    words = JSONField()
    plan = JSONField()
    focus = JSONField()
    position = JSONField()

    class Meta:
        model = Student
        fields = ('id','first_name', 'last_name', 'words', 'plan', 'focus', 'position')
        readonly_fields = ('id','teacher','position')

    def get_display(self, obj):
        return str(obj)


class ProgressSerializer(serializers.ModelSerializer):

    class Meta:
        model = Progress
        fields = ('word','achievement','held','at')






