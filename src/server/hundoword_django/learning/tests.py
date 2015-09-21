import json
import datetime

from django.test import SimpleTestCase, Client
from django.core.urlresolvers import reverse
from django.db import connection

from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

from learning.models import *
from learning.views import *

from rest_framework import status
from rest_framework.test import APIClient, force_authenticate

from hundoword_django import settings

settings.DEBUG = False

def build_url(view,pk=None):
    """ Method for creating view urls as reverse doesn't seem to work """

    return "%s/%s/%s/" % (learning_url,view,pk) if pk is not None else "%s/%s/" % (learning_url,view)


class test_Django(SimpleTestCase):
    """ Class for all the Django """

    def setUp(self):

        self.maxDiff = None
        connection.creation.destroy_test_db("hundoword_django",verbosity=0)
        connection.creation.create_test_db(verbosity=0)
        user = User(username="vagrant",password="vagrant")
        user.save()


    def test_Achievement(self):

        self.assertEqual(str(Achievement(name="plain")),"plain")


    def test_Program(self):

        self.assertEqual(str(Program(name="plain")),"plain")


    def test_ProgramWord(self):

        program = Program(name="plain")
        program.save()
        self.assertEqual(str(ProgramWord(program=program,word="jane")),"plain - jane")


    def test_Student(self):

        user = User(username="tester")
        user.save()
        self.assertEqual(str(Student(teacher=user,first_name="plain",last_name="jane")),"plain jane (tester)")


    def test_StudentWord(self):

        user = User(username="tester")
        user.save()
        student = Student(teacher=user,first_name="plain",last_name="jane")
        student.save()
        self.assertEqual(str(StudentWord(student=student,word="one")),"plain jane (tester) - one")


    def test_Progress(self):

        user = User(username="tester")
        user.save()
        achievement = Achievement(name="Sight")
        achievement.save()
        student = Student(teacher=user,first_name="plain",last_name="jane")
        student.save()
        at = datetime.datetime(2007,7,7)
        self.assertEqual(
            str(Progress(student=student,word="here",achievement=achievement,hold=True,at=at)),
            "plain jane (tester) - here - Sight (True) - 2007-07-07 00:00:00"
        )


    def test_register(self):

        client = APIClient()

        response = client.post("/learning/register/",{
            "username": "tester",
            "password": "tester"
        }, format='json')

        self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data,{"email": ["This field is required."]})

        response = client.post("/learning/register/",{
            "username": "tester",
            "password": "tester",
            "email": "tester@tester.com"
        }, format='json')

        self.assertEqual(response.status_code,status.HTTP_201_CREATED)
        self.assertEqual(response.data,{
            "username": "tester",
            "email": "tester@tester.com"
        })

        user = User.objects.get(username="tester")
        token = Token.objects.get(user=user)


    def test_token(self):

        client = APIClient()

        response = client.post("/learning/register/",{
            "username": "tester",
            "password": "tester",
            "email": "tester@tester.com"
        }, format='json')

        self.assertEqual(response.status_code,status.HTTP_201_CREATED)

        user = User.objects.get(username="tester")
        token = Token.objects.get(user=user)

        response = client.post("/learning/token/",{
            "username": "tester",
            "password": "tester"
        }, format='json')

        self.assertEqual(response.status_code,status.HTTP_200_OK)
        self.assertEqual(response.data,{
            "token": token.key
        })


    def test_achievement(self):

        client = APIClient()
        user = User.objects.get(username="vagrant")
        client.force_authenticate(user=user)

        # Create

        response = client.post("/learning/achievement/",{}, format='json')

        self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST);
        self.assertEqual(response.data,{"name": ["This field is required."]})

        response = client.post("/learning/achievement/",{
            "name": "plain",
            "description": "Plain ol' example"
        }, format='json')

        achievement = Achievement.objects.get(name="plain")
        plain_id = achievement.pk

        self.assertEqual(response.data,{
            "id": plain_id,
            "name": "plain",
            "description": "Plain ol' example"
        })

        # Select

        response = client.get("/learning/achievement/0")

        self.assertEqual(response.status_code,status.HTTP_404_NOT_FOUND);
        self.assertEqual(response.data,{"detail": "Achievement not found"})

        self.assertEqual(client.get("/learning/achievement/%s" % plain_id).data,{
            "id": plain_id,
            "name": "plain",
            "description": "Plain ol' example"
        })

        # Update 

        response = client.post("/learning/achievement/%s" % plain_id,{
            "description": "Plain old example"
        }, format='json')

        self.assertEqual(response.data,{
            "id": plain_id,
            "name": "plain",
            "description": "Plain old example"
        })

        self.assertEqual(client.get("/learning/achievement/%s" % plain_id).data,{
            "id": plain_id,
            "name": "plain",
            "description": "Plain old example"
        })

        # List

        achievement = Achievement(name="jane")
        achievement.save()
        jane_id = achievement.pk

        self.assertEqual([dict(achievement) for achievement in client.get("/learning/achievement/").data],[
            {
                "id": jane_id,
                "name": "jane",
                "description": ""
            },
            {
                "id": plain_id,
                "name": "plain",
                "description": "Plain old example"
            }
        ])

        # Delete

        self.assertEqual(client.delete("/learning/achievement/%s" % plain_id).data,{})

        self.assertEqual([dict(achievement) for achievement in client.get("/learning/achievement/").data],[
            {
                "id": jane_id,
                "name": "jane",
                "description": ""
            }
        ])


    def test_program(self):

        client = APIClient()
        user = User.objects.get(username="vagrant")
        client.force_authenticate(user=user)

        # Words validation

        response = client.post("/learning/program/",{"words": "oops"}, format='json')

        self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST);
        self.assertEqual(response.data,{"words": ["Must be an array."]})

        response = client.post("/learning/program/",{"words": [0]}, format='json')

        self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST);
        self.assertEqual(response.data,{"words": ["All array items be be strings."]})

        # Create

        response = client.post("/learning/program/",{}, format='json')

        self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST);
        self.assertEqual(response.data,{"name": ["This field is required."]})

        response = client.post("/learning/program/",{
            "name": "plain",
            "description": "Plain ol' example",
            "words": ["he","she","it","it"]
        }, format='json')

        program = Program.objects.get(name="plain")
        plain_id = program.pk

        self.assertEqual(response.data,{
            "id": plain_id,
            "name": "plain",
            "description": "Plain ol' example",
            "words": ["he","it","she"]
        })

        # Select

        response = client.get("/learning/program/0")

        self.assertEqual(response.status_code,status.HTTP_404_NOT_FOUND);
        self.assertEqual(response.data,{"detail": "Program not found"})

        self.assertEqual(client.get("/learning/program/%s" % plain_id).data,{
            "id": plain_id,
            "name": "plain",
            "description": "Plain ol' example",
            "words": ["he","it","she"]
        })

        # Update 

        response = client.post("/learning/program/%s" % plain_id,{
            "description": "Plain old example",
            "words": ["it","there"]
        }, format='json')

        self.assertEqual(response.data,{
            "id": plain_id,
            "name": "plain",
            "description": "Plain old example",
            "words": ["it","there"]
        })

        self.assertEqual(client.get("/learning/program/%s" % plain_id).data,{
            "id": plain_id,
            "name": "plain",
            "description": "Plain old example",
            "words": ["it","there"]
        })

        # Append 

        response = client.post("/learning/program/%s/append" % plain_id,{
            "words": ["here","everywhere"]
        }, format='json')

        self.assertEqual(response.data,{
            "id": plain_id,
            "name": "plain",
            "description": "Plain old example",
            "words": ["everywhere","here","it","there"]
        })

        self.assertEqual(client.get("/learning/program/%s" % plain_id).data,{
            "id": plain_id,
            "name": "plain",
            "description": "Plain old example",
            "words": ["everywhere","here","it","there"]
        })

        # Remove 

        response = client.post("/learning/program/%s/remove" % plain_id,{
            "words": ["here","there"]
        }, format='json')

        self.assertEqual(response.data,{
            "id": plain_id,
            "name": "plain",
            "description": "Plain old example",
            "words": ["everywhere","it"]
        })

        self.assertEqual(client.get("/learning/program/%s" % plain_id).data,{
            "id": plain_id,
            "name": "plain",
            "description": "Plain old example",
            "words": ["everywhere","it"]
        })

        # List

        program = Program(name="jane")
        program.save()
        jane_id = program.pk

        self.assertEqual([dict(program) for program in client.get("/learning/program/").data],[
            {
                "id": jane_id,
                "name": "jane",
                "description": "",
                "words": []
            },
            {
                "id": plain_id,
                "name": "plain",
                "description": "Plain old example",
                "words": ["everywhere","it"]
            }
        ])

        # Delete

        self.assertEqual(client.delete("/learning/program/%s" % plain_id).data,{})

        self.assertEqual([dict(program) for program in client.get("/learning/program/").data],[
            {
                "id": jane_id,
                "name": "jane",
                "description": "",
                "words": []
            }
        ])


    def test_student(self):

        client = APIClient()
        user = User.objects.get(username="vagrant")
        client.force_authenticate(user=user)

        loser = User(username="loser")
        loser.save()

        # Words validation

        response = client.post("/learning/student/",{"words": "oops"}, format='json')

        self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST);
        self.assertEqual(response.data,{"words": ["Must be an array."]})

        response = client.post("/learning/student/",{"words": [0]}, format='json')

        self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST);
        self.assertEqual(response.data,{"words": ["All array items be be strings."]})

        # Create

        response = client.post("/learning/student/",{}, format='json')

        self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST);
        self.assertEqual(response.data,{"first_name": ["This field is required."]})

        response = client.post("/learning/student/",{"first_name": "plain"}, format='json')

        self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST);
        self.assertEqual(response.data,{"last_name": ["This field is required."]})

        response = client.post("/learning/student/",{
            "first_name": "plain",
            "last_name": "jane",
            "age": 5,
            "words": ["he","she","it","it"]
        }, format='json')

        student = Student.objects.get(teacher=user,first_name="plain",last_name="jane")
        plain_jane_id = student.pk

        self.assertEqual(response.data,{
            "id": plain_jane_id,
            "first_name": "plain",
            "last_name": "jane",
            "age": 5,
            "words": ["he","it","she"]
        })

        # Select

        client.force_authenticate(user=loser)

        response = client.get("/learning/student/%s" % plain_jane_id)

        self.assertEqual(response.status_code,status.HTTP_404_NOT_FOUND);
        self.assertEqual(response.data,{"detail": "Student not found"})

        client.force_authenticate(user=user)

        self.assertEqual(client.get("/learning/student/%s" % plain_jane_id).data,{
            "id": plain_jane_id,
            "first_name": "plain",
            "last_name": "jane",
            "age": 5,
            "words": ["he","it","she"]
        })

        # Update 

        client.force_authenticate(user=loser)

        response = client.post("/learning/student/%s" % plain_jane_id,{})

        self.assertEqual(response.status_code,status.HTTP_404_NOT_FOUND);
        self.assertEqual(response.data,{"detail": "Student not found"})

        client.force_authenticate(user=user)

        response = client.post("/learning/student/%s" % plain_jane_id,{
            "age": 6,
            "words": ["it","there"]
        }, format='json')

        self.assertEqual(response.data,{
            "id": plain_jane_id,
            "first_name": "plain",
            "last_name": "jane",
            "age": 6,
            "words": ["it","there"]
        })

        self.assertEqual(client.get("/learning/student/%s" % plain_jane_id).data,{
            "id": plain_jane_id,
            "first_name": "plain",
            "last_name": "jane",
            "age": 6,
            "words": ["it","there"]
        })

        # Append 

        client.force_authenticate(user=loser)

        response = client.post("/learning/student/%s/append" % plain_jane_id,{})

        self.assertEqual(response.status_code,status.HTTP_404_NOT_FOUND);
        self.assertEqual(response.data,{"detail": "Student not found"})

        client.force_authenticate(user=user)

        response = client.post("/learning/student/%s/append" % plain_jane_id,{
            "words": ["here","everywhere"]
        }, format='json')

        self.assertEqual(response.data,{
            "id": plain_jane_id,
            "first_name": "plain",
            "last_name": "jane",
            "age": 6,
            "words": ["everywhere","here","it","there"]
        })

        self.assertEqual(client.get("/learning/student/%s" % plain_jane_id).data,{
            "id": plain_jane_id,
            "first_name": "plain",
            "last_name": "jane",
            "age": 6,
            "words": ["everywhere","here","it","there"]
        })

        # Remove 

        client.force_authenticate(user=loser)

        response = client.post("/learning/student/%s/remove" % plain_jane_id,{})

        self.assertEqual(response.status_code,status.HTTP_404_NOT_FOUND);
        self.assertEqual(response.data,{"detail": "Student not found"})

        client.force_authenticate(user=user)

        response = client.post("/learning/student/%s/remove" % plain_jane_id,{
            "words": ["here","there"]
        }, format='json')

        self.assertEqual(response.data,{
            "id": plain_jane_id,
            "first_name": "plain",
            "last_name": "jane",
            "age": 6,
            "words": ["everywhere","it"]
        })

        self.assertEqual(client.get("/learning/student/%s" % plain_jane_id).data,{
            "id": plain_jane_id,
            "first_name": "plain",
            "last_name": "jane",
            "age": 6,
            "words": ["everywhere","it"]
        })

        # List

        student = Student(teacher=user,first_name="silly",last_name="billy",age=7)
        student.save()
        silly_billy_id = student.pk

        client.force_authenticate(user=loser)

        self.assertEqual([dict(student) for student in client.get("/learning/student/").data],[])

        client.force_authenticate(user=user)

        self.assertEqual([dict(student) for student in client.get("/learning/student/").data],[
            {
                "id": silly_billy_id,
                "first_name": "silly",
                "last_name": "billy",
                "age": 7,
                "words": []
            },
            {
                "id": plain_jane_id,
                "first_name": "plain",
                "last_name": "jane",
                "age": 6,
                "words": ["everywhere","it"]
            }
        ])

        # Delete

        client.force_authenticate(user=loser)

        response = client.delete("/learning/student/%s" % plain_jane_id)

        self.assertEqual(response.status_code,status.HTTP_404_NOT_FOUND);
        self.assertEqual(response.data,{"detail": "Student not found"})

        client.force_authenticate(user=user)

        self.assertEqual(client.delete("/learning/student/%s" % plain_jane_id).data,{})

        self.assertEqual([dict(student) for student in client.get("/learning/student/").data],[
            {
                "id": silly_billy_id,
                "first_name": "silly",
                "last_name": "billy",
                "age": 7,
                "words": []
            }
        ])

        # Attain 

        client.force_authenticate(user=loser)

        response = client.post("/learning/student/%s/attain" % silly_billy_id,{}, format='json')

        self.assertEqual(response.status_code,status.HTTP_404_NOT_FOUND);
        self.assertEqual(response.data,{"detail": "Student not found"})

        client.force_authenticate(user=user)

        response = client.post("/learning/student/%s/attain" % silly_billy_id,{}, format='json')

        self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST);
        self.assertEqual(response.data,{"word": ["This field is required."]})

        response = client.post("/learning/student/%s/attain" % silly_billy_id,{
            "word": "here"
        }, format='json')

        self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST);
        self.assertEqual(response.data,{"achievement": ["This field is required."]})

        response = client.post("/learning/student/%s/attain" % silly_billy_id,{
            "word": "here",
            "achievement": "Sight"
        }, format='json')

        self.assertEqual(response.status_code,status.HTTP_404_NOT_FOUND);
        self.assertEqual(response.data,{"detail": "Word not found"})

        response = client.post("/learning/student/%s/append" % silly_billy_id,{
            "words": ["here"]
        }, format='json')
        self.assertEqual(response.status_code,status.HTTP_202_ACCEPTED);

        response = client.post("/learning/student/%s/attain" % silly_billy_id,{
            "word": "here",
            "achievement": "Sight"
        }, format='json')

        self.assertEqual(response.status_code,status.HTTP_404_NOT_FOUND);
        self.assertEqual(response.data,{"detail": "Achievement not found"})

        Achievement(name="Sight").save()

        response = client.post("/learning/student/%s/attain" % silly_billy_id,{
            "word": "here",
            "achievement": "Sight"
        }, format='json')

        self.assertEqual(response.status_code,status.HTTP_202_ACCEPTED);
        self.assertEqual(response.data["word"],"here")
        self.assertEqual(response.data["achievement"],"Sight")
        self.assertEqual(response.data["hold"],True)

        response = client.post("/learning/student/%s/attain" % silly_billy_id,{
            "word": "here",
            "achievement": "Sight"
        }, format='json')

        self.assertEqual(response.status_code,status.HTTP_202_ACCEPTED);
        self.assertEqual(response.data["word"],"here")
        self.assertEqual(response.data["achievement"],"Sight")
        self.assertEqual(response.data["hold"],True)

        # Yield 

        client.post("/learning/student/%s/append" % silly_billy_id,{
            "words": ["there"]
        })

        client.force_authenticate(user=loser)

        response = client.post("/learning/student/%s/yield" % silly_billy_id,{}, format='json')

        self.assertEqual(response.status_code,status.HTTP_404_NOT_FOUND);
        self.assertEqual(response.data,{"detail": "Student not found"})

        client.force_authenticate(user=user)

        response = client.post("/learning/student/%s/yield" % silly_billy_id,{}, format='json')

        self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST);
        self.assertEqual(response.data,{"word": ["This field is required."]})

        response = client.post("/learning/student/%s/yield" % silly_billy_id,{
            "word": "there"
        }, format='json')

        self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST);
        self.assertEqual(response.data,{"achievement": ["This field is required."]})

        response = client.post("/learning/student/%s/yield" % silly_billy_id,{
            "word": "there",
            "achievement": "Spell"
        }, format='json')

        self.assertEqual(response.status_code,status.HTTP_404_NOT_FOUND);
        self.assertEqual(response.data,{"detail": "Word not found"})

        response = client.post("/learning/student/%s/append" % silly_billy_id,{
            "words": ["there"]
        }, format='json')
        self.assertEqual(response.status_code,status.HTTP_202_ACCEPTED);

        response = client.post("/learning/student/%s/yield" % silly_billy_id,{
            "word": "there",
            "achievement": "Spell"
        }, format='json')

        self.assertEqual(response.status_code,status.HTTP_404_NOT_FOUND);
        self.assertEqual(response.data,{"detail": "Achievement not found"})

        Achievement(name="Spell").save()

        response = client.post("/learning/student/%s/attain" % silly_billy_id,{
            "word": "there",
            "achievement": "Spell"
        }, format='json')

        response = client.post("/learning/student/%s/yield" % silly_billy_id,{
            "word": "there",
            "achievement": "Spell"
        }, format='json')

        self.assertEqual(response.status_code,status.HTTP_202_ACCEPTED);
        self.assertEqual(response.data["word"],"there")
        self.assertEqual(response.data["achievement"],"Spell")
        self.assertEqual(response.data["hold"],False)

        response = client.post("/learning/student/%s/yield" % silly_billy_id,{
            "word": "there",
            "achievement": "Spell"
        }, format='json')

        self.assertEqual(response.status_code,status.HTTP_202_ACCEPTED);
        self.assertEqual(response.data["word"],"there")
        self.assertEqual(response.data["achievement"],"Spell")
        self.assertEqual(response.data["hold"],False)

        # Position

        client.force_authenticate(user=loser)

        response = client.get("/learning/student/%s/position" % silly_billy_id)

        self.assertEqual(response.status_code,status.HTTP_404_NOT_FOUND);
        self.assertEqual(response.data,{"detail": "Student not found"})

        client.force_authenticate(user=user)

        self.assertEqual(client.get("/learning/student/%s/position" % silly_billy_id).data,[
            {
                "word": "here",
                "achievements": ["Sight"]
            },
            {
                "word": "there",
                "achievements": []
            }
        ])

        # Progress

        client.force_authenticate(user=loser)

        response = client.get("/learning/student/%s/progress" % silly_billy_id)

        self.assertEqual(response.status_code,status.HTTP_404_NOT_FOUND);
        self.assertEqual(response.data,{"detail": "Student not found"})

        client.force_authenticate(user=user)

        progress = [dict(event) for event in client.get("/learning/student/%s/progress" % silly_billy_id).data]

        for event in progress:
            del event['at']

        self.assertItemsEqual(progress,[
            {
                "word": "there",
                "achievement": "Spell",
                "hold": False
            },
            {
                "word": "there",
                "achievement": "Spell",
                "hold": False
            },
            {
                "word": "there",
                "achievement": "Spell",
                "hold": True
            },
            {
                "word": "here",
                "achievement": "Sight",
                "hold": True
            },
            {
                "word": "here",
                "achievement": "Sight",
                "hold": True
            }
        ])


