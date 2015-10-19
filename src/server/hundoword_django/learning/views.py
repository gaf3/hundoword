import os
import sys
import copy
import traceback
import datetime
import pytz

from django.db import transaction
from django.db.models import Q
from django.utils.timezone import get_current_timezone

from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from hundoword_django import settings

from learning.models import *
from learning.serializers import *
from learning import chart
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

import requests

forvo_key_file = "/etc/hundoword/forvo.key"

def exception_response(exception,detail=None,status=status.HTTP_500_INTERNAL_SERVER_ERROR):

    if settings.DEBUG: # pragma: no cover
        print exception
        exc_type, exc_value, exc_traceback = sys.exc_info()
        print traceback.print_tb(exc_traceback)

    if detail is None: # pragma: no cover
        detail = str(exception)

    return Response({"detail": detail}, status=status)


def errors_response(serializer,status=status.HTTP_400_BAD_REQUEST):

    if settings.DEBUG: # pragma: no cover
        print serializer.errors

    return Response(serializer.errors, status=status)


@api_view(['POST'])
@permission_classes((permissions.AllowAny,))
def register(request):
    """ Registers a new user """

    try:

        serializer = CreateUserSerializer(data=request.DATA)

        if serializer.is_valid():

            user = serializer.save()
            Token.objects.create(user=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        else:

            return errors_response(serializer)

    except Exception as exception: # pragma: no cover

        return exception_response(exception)


@api_view(['GET', 'POST', 'DELETE'])
def achievement(request,pk='',action=''):
    """ Handles achievements """

    try:

        # Create

        if request.method == 'POST' and not pk:

            if 'name' not in request.DATA:
                return Response({"name": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)

            if 'slug' not in request.DATA:
                return Response({"slug": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)

            if 'progression' not in request.DATA:
                return Response({"progression": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)

            with transaction.atomic():

                achievement = Achievement(name=request.DATA['name'])

                if 'slug' in request.DATA:
                    achievement.slug = request.DATA['slug']

                if 'description' in request.DATA:
                    achievement.description = request.DATA['description']

                if 'progression' in request.DATA:
                    achievement.progression = request.DATA['progression']

                if 'color' in request.DATA:
                    achievement.color = request.DATA['color']

                achievement.save()

                serializer = AchievementSerializer(achievement)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

        # List

        elif request.method == 'GET' and not pk:

            achievements = Achievement.objects.all()
            serializer = AchievementSerializer(achievements, many=True)
            return Response(serializer.data)

        # Select

        elif request.method == 'GET' and pk and not action:

            achievement = Achievement.objects.get(pk=pk)
            serializer = AchievementSerializer(achievement)
            return Response(serializer.data)

        # Slug

        elif request.method == 'GET' and pk and action == "slug":

            achievement = Achievement.objects.get(slug=pk)
            serializer = AchievementSerializer(achievement)
            return Response(serializer.data)

        # Update

        elif request.method == 'POST' and pk:

            achievement = Achievement.objects.get(pk=pk)

            serializer = AchievementSerializer(achievement,data=request.DATA, partial=True)

            if serializer.is_valid():

                serializer.save()
                return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

            else: # pragma: no cover

                return errors_response(serializer)

        # Delete

        elif request.method == 'DELETE' and pk:

            achievement = Achievement.objects.get(pk=pk)
            achievement.delete()
            return Response({})

    except Achievement.DoesNotExist as exception:

        return exception_response(exception, "Achievement not found", status=status.HTTP_404_NOT_FOUND)

    except Exception as exception: # pragma: no cover

        return exception_response(exception)


@api_view(['GET', 'POST', 'DELETE'])
def program(request,pk='',action=''):
    """ Handles programs """

    try:

        # Words is universal to usage

        if 'words' in request.DATA:

            if not isinstance(request.DATA["words"],list):
                return Response({"words": ["Must be an array."]}, status=status.HTTP_400_BAD_REQUEST)

            for word in request.DATA["words"]:
                if not isinstance(word,str) and not isinstance(word,unicode):
                    return Response({"words": ["All array items be be strings."]}, status=status.HTTP_400_BAD_REQUEST)

        # Create

        if request.method == 'POST' and not pk:

            if 'name' not in request.DATA:
                return Response({"name": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)

            with transaction.atomic():

                program = Program(name=request.DATA['name'])

                if 'description' in request.DATA:
                    program.description = request.DATA['description']

                if 'words' in request.DATA:
                    program.words = request.DATA['words']

                program.save()

                serializer = ProgramSerializer(program)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

        # List

        elif request.method == 'GET' and not pk:

            programs = Program.objects.all()
            serializer = ProgramSerializer(programs, many=True)
            return Response(serializer.data)

        # Select

        elif request.method == 'GET' and pk:

            program = Program.objects.get(pk=pk)
            serializer = ProgramSerializer(program)
            return Response(serializer.data)

        elif request.method == 'POST' and pk:

            program = Program.objects.get(pk=pk)

            # Update 

            if not action:

                serializer = ProgramSerializer(program,data=request.DATA, partial=True)

                if serializer.is_valid():

                    serializer.save()
                    return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

                else: # pragma: no cover

                    return errors_response(serializer)

        # Delete

        elif request.method == 'DELETE' and pk:

            program = Program.objects.get(pk=pk)
            program.delete()
            return Response({})

    except Program.DoesNotExist as exception:

        return exception_response(exception, "Program not found", status=status.HTTP_404_NOT_FOUND)

    except Exception as exception: # pragma: no cover

        return exception_response(exception)


@api_view(['GET', 'POST', 'DELETE'])
def student(request,pk='',action=''):
    """ Handles students """

    try:

        # Words is universal to usage

        if 'words' in request.DATA:

            if not isinstance(request.DATA["words"],list):
                return Response({"words": ["Must be an array."]}, status=status.HTTP_400_BAD_REQUEST)

            for word in request.DATA["words"]:
                if not isinstance(word,str) and not isinstance(word,unicode):
                    return Response({"words": ["All array items be be strings."]}, status=status.HTTP_400_BAD_REQUEST)

        if 'focus' in request.DATA:

            if not isinstance(request.DATA["focus"],list):
                return Response({"focus": ["Must be an array."]}, status=status.HTTP_400_BAD_REQUEST)

            for word in request.DATA["focus"]:
                if not isinstance(word,str) and not isinstance(word,unicode):
                    return Response({"focus": ["All array items be be strings."]}, status=status.HTTP_400_BAD_REQUEST)

        # Create

        if request.method == 'POST' and not pk:

            if 'first_name' not in request.DATA:
                return Response({"first_name": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)

            if 'last_name' not in request.DATA:
                return Response({"last_name": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)

            student = Student(
                teacher=request.user,
                first_name=request.DATA['first_name'],
                last_name=request.DATA['last_name'],
                words=[],
                focus=[],
                position={}
            )

            if 'age' in request.DATA:
                student.age = request.DATA['age']

            if 'words' in request.DATA:
                for word in request.DATA['words']:
                    if word not in student.words:
                        student.words.append(word)

            if 'focus' in request.DATA:

                extra = []
                for word in request.DATA['focus']:
                    if word not in student.words:
                        extra.append("Word %s not found." % word)
                    elif word not in student.focus:
                        student.focus.append(word)

                if extra:
                    return Response({"focus": extra}, status=status.HTTP_400_BAD_REQUEST)

            student.save()

            serializer = StudentSerializer(student)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        # List

        elif request.method == 'GET' and not pk:

            students = Student.objects.filter(teacher=request.user)
            serializer = StudentSerializer(students, many=True)
            return Response(serializer.data)

        elif request.method == 'GET' and pk:

            student = Student.objects.get(teacher=request.user,pk=pk)

            # Select

            if not action:

                serializer = StudentSerializer(student)
                return Response(serializer.data)

            # Position

            elif action == "position": 

                position = {}

                if "words" in request.GET:
                    words = request.GET["words"].split(",")
                elif "focus" in request.GET and request.GET["focus"].lower() == "true":
                    words = student.focus
                else:
                    words = student.words

                for word in words:
                    position[word] = student.position[word] if word in student.position else {}

                return Response(position)

            # History

            elif action == "history": 

                filter = {
                    "student": student
                }

                if "words" in request.GET:
                    filter["word__in"] = request.GET["words"].split(",")

                if "achievements" in request.GET:
                    filter["achievement__in"] = request.GET["achievements"].split(",")

                if "from" in request.GET:
                    filter["at__gte"] = pytz.utc.localize(datetime.datetime.strptime(request.GET["from"], '%Y-%m-%d'))

                if "to" in request.GET:
                    filter["at__lt"] = pytz.utc.localize(datetime.datetime.strptime(request.GET["to"], '%Y-%m-%d'))

                serializer = ProgressSerializer(Progress.objects.filter(**filter), many=True)
                return Response(serializer.data)

            # Chart

            elif action == "chart": 

                if "words" in request.GET:
                    words = request.GET["words"].split(",")
                elif "focus" in request.GET and request.GET["focus"].lower() == "true":
                    words = student.focus
                else:
                    words = student.words

                if "achievements" in request.GET:
                    achievements = Achievement.objects.filter(id__in=request.GET["achievements"].split(","))
                else:
                    achievements = Achievement.objects.all()

                achievement_ids = [achievement.pk for achievement in achievements]
                by = request.GET["by"] if "by" in request.GET else "day"

                from_date = None
                to_date = None

                if "from" in request.GET:
                    from_date = pytz.utc.localize(datetime.datetime.strptime(request.GET["from"], '%Y-%m-%d'))

                if "to" in request.GET:
                    to_date = pytz.utc.localize(datetime.datetime.strptime(request.GET["to"], '%Y-%m-%d'))

                (data,times) = chart.build(student.pk,by,words,achievement_ids,from_date,to_date)

                return Response({
                    "words": words, 
                    "times": times,
                    "data": data
                })

        elif request.method == 'POST' and pk:

            student = Student.objects.get(teacher=request.user,pk=pk)

            # Update 

            if not action:

                if 'words' in request.DATA:
                    words = request.DATA['words']
                else:
                    words = student.words

                if 'focus' in request.DATA:

                    extra = []
                    for word in request.DATA['focus']:
                        if word not in words:
                            extra.append("Word %s not found." % word)

                    if extra:
                        return Response({"focus": extra}, status=status.HTTP_400_BAD_REQUEST)

                if serializer.is_valid():

                    serializer.save()
                    return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

                else: # pragma: no cover

                    return errors_response(serializer)

            elif action == "focus": 

                if 'words' not in request.DATA:
                    return Response({"words": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)

                for word in request.DATA['words']:
                    if word in student.words:


                student_words = StudentWord.objects.filter(student=student,word__in=request.DATA["words"])

                missing = set(request.DATA["words"]) - set([student_word.word for student_word in student_words])

                if missing:
                    return Response({"detail": "Words not found","words": list(missing)}, status=status.HTTP_404_NOT_FOUND)

                student_words.update(focus=action == "focus")
                serializer = PositionSerializer(student_words, many=True)
                return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

            elif action == "blur": 

                if 'words' not in request.DATA:
                    return Response({"words": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)

                for word in request.DATA

                student_words = StudentWord.objects.filter(student=student,word__in=request.DATA["words"])

                missing = set(request.DATA["words"]) - set([student_word.word for student_word in student_words])

                if missing:
                    return Response({"detail": "Words not found","words": list(missing)}, status=status.HTTP_404_NOT_FOUND)

                student_words.update(focus=action == "focus")
                serializer = PositionSerializer(student_words, many=True)
                return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

            elif action in ["attain","yield"]: 

                if 'word' not in request.DATA:
                    return Response({"word": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)

                if 'achievement' not in request.DATA:
                    return Response({"achievement": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)

                word = request.DATA["word"]
                student_word = StudentWord.objects.get(student=student,word=word)
                achievement = Achievement.objects.get(pk=request.DATA["achievement"])
                at = None
                if "at" in request.DATA:
                    at = pytz.utc.localize(datetime.datetime.strptime(request.DATA["at"], '%Y-%m-%dT%H:%M:%SZ'))

                with transaction.atomic():

                    progress = Progress(student=student,achievement=achievement,word=word,held=(action == "attain"))
                    if at is not None:
                        progress.at = at
                    progress.save()

                    if action == "attain" and achievement not in student_word.achievements.all():

                        student_word.achievements.add(achievement)
                        student_word.save();

                    elif action == "yield" and achievement in student_word.achievements.all():

                        student_word.achievements.remove(achievement)
                        student_word.save();

                serializer = ProgressSerializer(progress)
                return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

        # Delete

        elif request.method == 'DELETE' and pk:

            student = Student.objects.get(teacher=request.user,pk=pk)
            student.delete()
            return Response({})

    except Student.DoesNotExist as exception:

        return exception_response(exception, "Student not found", status=status.HTTP_404_NOT_FOUND)

    except StudentWord.DoesNotExist as exception:

        return exception_response(exception, "Word not found", status=status.HTTP_404_NOT_FOUND)

    except Achievement.DoesNotExist as exception:

        return exception_response(exception, "Achievement not found", status=status.HTTP_404_NOT_FOUND)

    except Exception as exception: # pragma: no cover

        return exception_response(exception)


@api_view(['GET'])
def audio(request,word):
    """ Handles audio """

    try:

        handle = open(forvo_key_file,'rb')
        forvo_key = handle.readline().strip()
        handle.close()

        url = "https://apifree.forvo.com/key/%s/format/json/action/word-pronunciations/language/en/country/usa/word/%s/limit/1" % (forvo_key,word)
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        return Response({"mp3": data["items"][0]["pathmp3"],"ogg": data["items"][0]["pathogg"]})

    except Exception as exception: # pragma: no cover

        return exception_response(exception, "Audio unavailable", status=status.HTTP_503_SERVICE_UNAVAILABLE)




