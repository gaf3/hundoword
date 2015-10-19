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

                program.save()

                if "words" in request.DATA:
                    program.words.bulk_create([ProgramWord(program=program,word=word) for word in set(request.DATA["words"])])

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

                with transaction.atomic():

                    data = dict(request.DATA)

                    if "words" in request.DATA:
                        program.words.exclude(word__in=data["words"]).delete()
                        creates = set(data["words"]) - set(program.words.values_list('word', flat=True))
                        program.words.bulk_create([ProgramWord(program=program,word=word) for word in creates])
                        del data["words"]

                    serializer = ProgramSerializer(program,data=data, partial=True)

                    if serializer.is_valid():

                        serializer.save()
                        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

                    else: # pragma: no cover

                        transaction.rollback()
                        return errors_response(serializer)

            elif action == "append": 

                creates = set(request.DATA["words"]) - set(program.words.values_list('word', flat=True))
                program.words.bulk_create([ProgramWord(program=program,word=word) for word in creates])

                serializer = ProgramSerializer(program)
                return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

            elif action == "remove": 

                program.words.filter(word__in=request.DATA["words"]).delete()

                serializer = ProgramSerializer(program)
                return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

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

        # Create

        if request.method == 'POST' and not pk:

            if 'first_name' not in request.DATA:
                return Response({"first_name": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)

            if 'last_name' not in request.DATA:
                return Response({"last_name": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)

            with transaction.atomic():

                student = Student(
                    teacher=request.user,
                    first_name=request.DATA['first_name'],
                    last_name=request.DATA['last_name']
                )

                if 'age' in request.DATA:
                    student.age = request.DATA['age']

                student.save()

                if "words" in request.DATA:
                    student.words.bulk_create([StudentWord(student=student,word=word) for word in set(request.DATA["words"])])

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

            # Focus

            elif action == "focus": 

                serializer = StudentWordSerializer(StudentWord.objects.filter(student=student,focus=True), many=True)
                return Response(serializer.data)

            # Position

            elif action == "position": 

                filter = {
                    "student": student
                }

                if "words" in request.GET:
                    filter["word__in"] = request.GET["words"].split(",")

                if "focus" in request.GET:
                    filter["focus"] = request.GET["focus"].lower() == "true"

                serializer = PositionSerializer(StudentWord.objects.filter(**filter), many=True)
                return Response(serializer.data)

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

                # First select all the words we're using

                filter = {
                    "student": student
                }

                if "words" in request.GET:
                    filter["word__in"] = request.GET["words"].split(",")

                if "focus" in request.GET:
                    filter["focus"] = request.GET["focus"].lower() == "true"

                words = [student_word.word for student_word in StudentWord.objects.filter(**filter)]

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

                with transaction.atomic():

                    data = dict(request.DATA)

                    if "words" in request.DATA:
                        student.words.exclude(word__in=data["words"]).delete()
                        creates = set(data["words"]) - set(student.words.values_list('word', flat=True))
                        student.words.bulk_create([StudentWord(student=student,word=word) for word in creates])
                        del data["words"]

                    serializer = StudentSerializer(student,data=data, partial=True)

                    if serializer.is_valid():

                        serializer.save()
                        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

                    else: # pragma: no cover

                        transaction.rollback()
                        return errors_response(serializer)

            elif action == "append": 

                creates = set(request.DATA["words"]) - set(student.words.values_list('word', flat=True))
                student.words.bulk_create([StudentWord(student=student,word=word) for word in creates])

                serializer = StudentSerializer(student)
                return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

            elif action == "remove": 

                student.words.filter(word__in=request.DATA["words"]).delete()

                serializer = StudentSerializer(student)
                return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

            elif action in ["focus","blur"]: 

                if 'words' not in request.DATA:
                    return Response({"words": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)

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

                    progress = Progress(student=student,achievement=achievement,word=word,hold=(action == "attain"))
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




