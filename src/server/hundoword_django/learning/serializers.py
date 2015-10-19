from django.forms import widgets
from rest_framework import serializers

from learning.models import *
from django.contrib.auth.models import User


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


class ProgramWordSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProgramWord
        readonly_fields = ('id','program')

    def to_representation(self, obj):
        return obj.word


class ProgramSerializer(serializers.ModelSerializer):

    words = ProgramWordSerializer(required=False,many=True)

    class Meta:
        model = Program
        readonly_fields = ('id','words')

    def get_display(self, obj):
        return str(obj)


class StudentWordSerializer(serializers.ModelSerializer):

    class Meta:
        model = StudentWord

    def to_representation(self, obj):
        return obj.word


class StudentSerializer(serializers.ModelSerializer):

    words = StudentWordSerializer(required=False,many=True)

    class Meta:
        model = Student
        fields = ('id','first_name', 'last_name', 'age', 'words')
        readonly_fields = ('id','teacher','words')

    def get_display(self, obj):
        return str(obj)


class PositionSerializer(serializers.ModelSerializer):

    class Meta:
        model = StudentWord
        fields = ('word','focus','achievements')


class ProgressSerializer(serializers.ModelSerializer):

    class Meta:
        model = Progress
        fields = ('word','achievement','held','at')






