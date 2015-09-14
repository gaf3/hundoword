import sys
import traceback

from django.db import transaction
from django.db.models import Q

from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from hundoword_django import settings

from learning.models import *
from learning.serializers import *
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token


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

            with transaction.atomic():

                achievement = Achievement(name=request.DATA['name'])

                if 'description' in request.DATA:
                    achievement.description = request.DATA['description']

                achievement.save()

                serializer = AchievementSerializer(achievement)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

        # List

        elif request.method == 'GET' and not pk:

            achievements = Achievement.objects.all()
            serializer = AchievementSerializer(achievements, many=True)
            return Response(serializer.data)

        # Select

        elif request.method == 'GET' and pk:

            achievement = Achievement.objects.get(pk=pk)
            serializer = AchievementSerializer(achievement)
            return Response(serializer.data)

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
            return Response()

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
            return Response()

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

            # Position

            elif action == "position": 

                serializer = PositionSerializer(student.words.all(), many=True)
                return Response(serializer.data)

            # Progress

            elif action == "progress": 

                serializer = ProgressSerializer(student.progress.all(), many=True)
                return Response(serializer.data)

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

            elif action in ["attain","yield"]: 

                if 'word' not in request.DATA:
                    return Response({"word": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)

                if 'achievement' not in request.DATA:
                    return Response({"achievement": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)

                word = request.DATA["word"]
                student_word = StudentWord.objects.get(student=student,word=word)
                achievement = Achievement.objects.get(name=request.DATA["achievement"])

                with transaction.atomic():

                    progress = Progress(student=student,achievement=achievement,word=word,hold=(action == "attain"))
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
            return Response()

    except Student.DoesNotExist as exception:

        return exception_response(exception, "Student not found", status=status.HTTP_404_NOT_FOUND)

    except StudentWord.DoesNotExist as exception:

        return exception_response(exception, "Word not found", status=status.HTTP_404_NOT_FOUND)

    except Achievement.DoesNotExist as exception:

        return exception_response(exception, "Achievement not found", status=status.HTTP_404_NOT_FOUND)

    except Exception as exception: # pragma: no cover

        return exception_response(exception)


