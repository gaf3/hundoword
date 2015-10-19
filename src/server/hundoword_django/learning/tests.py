import os
import json
import datetime
import pytz

from django.test import SimpleTestCase, Client
from django.core.urlresolvers import reverse
from django.db import connection

from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

from learning.models import *
from learning.views import *
import learning.chart
import learning.views

from rest_framework import status
from rest_framework.test import APIClient, force_authenticate

from hundoword_django import settings

settings.DEBUG = False


def build_url(view,pk=None):
    """ Method for creating view urls as reverse doesn't seem to work """

    return "%s/%s/%s/" % (learning_url,view,pk) if pk is not None else "%s/%s/" % (learning_url,view)


def when(year,month,day,hour=0):
    return pytz.utc.localize(datetime.datetime(year,month,day,hour))


class test_Django(SimpleTestCase):
    """ Class for all the Django """

    def setUp(self):

        self.maxDiff = None
        connection.creation.destroy_test_db("hundoword_django",verbosity=0)
        connection.creation.create_test_db(verbosity=0)
        user = User(username="vagrant",password="vagrant")
        user.save()
        self.original_forvo_key_file = learning.views.forvo_key_file



    def tearDown(self):

        learning.views.forvo_key_file = self.original_forvo_key_file 


    def test_Achievement(self):

        self.assertEqual(str(Achievement(name="plain",progression=1)),"plain")


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
        achievement = Achievement(name="Sight",slug="sight",progression=1)
        achievement.save()
        student = Student(teacher=user,first_name="plain",last_name="jane")
        student.save()
        at = when(2007,7,7)
        progress = Progress(student=student,word="here",achievement=achievement,hold=True,at=at)
        progress.save()
        self.assertEqual(
            str(Progress.objects.get(pk=progress.pk)),
            "plain jane (tester) - here - Sight (True) - 2007-07-07 00:00:00+00:00"
        )

    def test_chart(self):

        ### start

        user = User(username="tester")
        user.save()
        sight = Achievement(name="Sight",slug="sight",progression=1)
        sight.save()
        sound = Achievement(name="Sound",slug="sound",progression=2)
        sound.save()
        student = Student(teacher=user,first_name="plain",last_name="jane")
        student.save()

        Progress(student=student,word="here",achievement=sight,hold=True,at=when(2007,6,30,9)).save()
        Progress(student=student,word="here",achievement=sight,hold=False,at=when(2007,7,1,10)).save()
        Progress(student=student,word="here",achievement=sight,hold=True,at=when(2007,7,1,11)).save()
        Progress(student=student,word="there",achievement=sight,hold=True,at=when(2007,7,1,9)).save()
        Progress(student=student,word="there",achievement=sight,hold=False,at=when(2007,7,1,10)).save()
        Progress(student=student,word="here",achievement=sound,hold=True,at=when(2007,7,2,9)).save()
        Progress(student=student,word="here",achievement=sight,hold=True,at=when(2007,7,2,9)).save()
        Progress(student=student,word="there",achievement=sight,hold=True,at=when(2007,7,2,9)).save()
        Progress(student=student,word="everywhere",achievement=sound,hold=True,at=when(2007,7,2)).save()

        # from

        self.assertEqual(learning.chart.start(student.id,["here","there","everywhere"],[sight.id,sound.id],when(2007,7,2)),{
            sight.id: {"here": 1,"there": 0}
        })
        self.assertEqual(learning.chart.start(student.id,["here","there","everywhere"],[sight.id,sound.id],when(2007,7,3)),{
            sight.id: {"here": 1,"there": 1},
            sound.id: {"here": 1, "everywhere": 1}
        })

        # words

        self.assertEqual(learning.chart.start(student.id,["here","there"],[sight.id,sound.id],when(2007,7,3)),{
            sight.id: {"here": 1,"there": 1},
            sound.id: {"here": 1}
        })

        # achievement_ids

        self.assertEqual(learning.chart.start(student.id,["here","there"],[sight.id],when(2007,7,3)),{
            sight.id: {"here": 1,"there": 1}
        })

        ### finish

        # by

        self.assertEqual(learning.chart.finish(student.id,"day",["here","there","everywhere"],[sight.id,sound.id]),(
            {
                "2007-06-30": {
                    sight.id: {"here": 1}
                },
                "2007-07-01": {
                    sight.id: {"here": 1,"there": 0}
                },
                "2007-07-02": {
                    sight.id: {"here": 1,"there": 1},
                    sound.id: {"here": 1, "everywhere": 1}
                }
            },
            when(2007,6,30,9),
            when(2007,7,2,9)
        ))
        self.assertEqual(learning.chart.finish(student.id,"week",["here","there","everywhere"],[sight.id,sound.id]),(
            {
                "2007-06-25": {
                    sight.id: {"here": 1,"there": 0}
                },
                "2007-07-02": {
                    sight.id: {"here": 1,"there": 1},
                    sound.id: {"here": 1, "everywhere": 1}
                }
            },
            when(2007,7,1,10),
            when(2007,7,2,9)
        ))
        self.assertEqual(learning.chart.finish(student.id,"month",["here","there","everywhere"],[sight.id,sound.id]),(
            {
                "2007-06": {
                    sight.id: {"here": 1}
                },
                "2007-07": {
                    sight.id: {"here": 1,"there": 1},
                    sound.id: {"here": 1, "everywhere": 1}
                }
            },
            when(2007,6,30,9),
            when(2007,7,2,9)
        ))

        # from/to

        self.assertEqual(learning.chart.finish(student.id,"day",["here","there","everywhere"],[sight.id,sound.id],when(2007,7,1),when(2007,7,2)),(
            {
                "2007-07-01": {
                    sight.id: {"here": 1,"there": 0}
                }
            },
            when(2007,7,1,10),
            when(2007,7,1,11)
        ))

        # words

        self.assertEqual(learning.chart.finish(student.id,"day",["here","there"],[sight.id,sound.id],),(
            {
                "2007-06-30": {
                    sight.id: {"here": 1}
                },
                "2007-07-01": {
                    sight.id: {"here": 1,"there": 0}
                },
                "2007-07-02": {
                    sight.id: {"here": 1,"there": 1},
                    sound.id: {"here": 1}
                }
            },
            when(2007,6,30,9),
            when(2007,7,2,9)
        ))

        # achievement_ids

        self.assertEqual(learning.chart.finish(student.id,"day",["here","there"],[sight.id]),(
            {
                "2007-06-30": {
                    sight.id: {"here": 1}
                },
                "2007-07-01": {
                    sight.id: {"here": 1,"there": 0}
                },
                "2007-07-02": {
                    sight.id: {"here": 1,"there": 1}
                }
            },
            when(2007,6,30,9),
            when(2007,7,2,9)
        ))

        ### build

        # by

        self.assertEqual(learning.chart.build(student.id,"day",["here","there","everywhere"],[sight.id,sound.id]),(
            {
                "2007-06-30": {
                    sight.id: 1,
                    sound.id: 0
                },
                "2007-07-01": {
                    sight.id: 1,
                    sound.id: 0
                },
                "2007-07-02": {
                    sight.id: 2,
                    sound.id: 2
                }
            },
            [
                "2007-06-30",
                "2007-07-01",
                "2007-07-02"
            ]
        ))
        self.assertEqual(learning.chart.build(student.id,"week",["here","there","everywhere"],[sight.id,sound.id]),(
            {
                "2007-06-25": {
                    sight.id: 1,
                    sound.id: 0
                },
                "2007-07-02": {
                    sight.id: 2,
                    sound.id: 2
                }
            },
            [
                "2007-06-25",
                "2007-07-02"
            ]
        ))
        self.assertEqual(learning.chart.build(student.id,"month",["here","there","everywhere"],[sight.id,sound.id]),(
            {
                "2007-06": {
                    sight.id: 1,
                    sound.id: 0
                },
                "2007-07": {
                    sight.id: 2,
                    sound.id: 2
                }
            },
            [
                "2007-06",
                "2007-07"
            ]
        ))

        # from/to

        self.assertEqual(learning.chart.build(student.id,"day",["here","there","everywhere"],[sight.id,sound.id],when(2007,7,1),when(2007,7,2)),(
            {
                "2007-07-01": {
                    sight.id: 1,
                    sound.id: 0
                }
            },
            [
                "2007-07-01"
            ]
        ))

        # words

        self.assertEqual(learning.chart.build(student.id,"day",["here","there"],[sight.id,sound.id],),(
            {
                "2007-06-30": {
                    sight.id: 1,
                    sound.id: 0
                },
                "2007-07-01": {
                    sight.id: 1,
                    sound.id: 0
                },
                "2007-07-02": {
                    sight.id: 2,
                    sound.id: 1
                }
            },
            [
                "2007-06-30",
                "2007-07-01",
                "2007-07-02"
            ]
        ))

        # achievement_ids

        self.assertEqual(learning.chart.build(student.id,"day",["here","there"],[sight.id]),(
            {
                "2007-06-30": {
                    sight.id: 1
                },
                "2007-07-01": {
                    sight.id: 1
                },
                "2007-07-02": {
                    sight.id: 2
                }
            },
            [
                "2007-06-30",
                "2007-07-01",
                "2007-07-02"
            ]
        ))


    def test_register(self):

        client = APIClient()

        response = client.post("/api/v0/register/",{
            "username": "tester",
            "password": "tester"
        }, format='json')

        self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data,{"email": ["This field is required."]})

        response = client.post("/api/v0/register/",{
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

        response = client.post("/api/v0/register/",{
            "username": "tester",
            "password": "tester",
            "email": "tester@tester.com"
        }, format='json')

        self.assertEqual(response.status_code,status.HTTP_201_CREATED)

        user = User.objects.get(username="tester")
        token = Token.objects.get(user=user)

        response = client.post("/api/v0/token/",{
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

        response = client.post("/api/v0/achievement/",{}, format='json')

        self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST);
        self.assertEqual(response.data,{"name": ["This field is required."]})

        response = client.post("/api/v0/achievement/",{
            "name": "Plain",
            "description": "Plain ol' example"
        }, format='json')

        self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST);
        self.assertEqual(response.data,{"slug": ["This field is required."]})

        response = client.post("/api/v0/achievement/",{
            "name": "Plain",
            "slug": "plain",
            "description": "Plain ol' example"
        }, format='json')

        self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST);
        self.assertEqual(response.data,{"progression": ["This field is required."]})

        response = client.post("/api/v0/achievement/",{
            "name": "Plain",
            "slug": "plain",
            "description": "Plain ol' example",
            "progression": 100,
            "color": "blue"
        }, format='json')

        achievement = Achievement.objects.get(name="plain")
        plain_id = achievement.pk

        self.assertEqual(response.data,{
            "id": plain_id,
            "name": "Plain",
            "slug": "plain",
            "description": "Plain ol' example",
            "progression": 100,
            "color": "blue"
        })

        # Select

        response = client.get("/api/v0/achievement/0")

        self.assertEqual(response.status_code,status.HTTP_404_NOT_FOUND);
        self.assertEqual(response.data,{"detail": "Achievement not found"})

        self.assertEqual(client.get("/api/v0/achievement/%s" % plain_id).data,{
            "id": plain_id,
            "name": "Plain",
            "slug": "plain",
            "description": "Plain ol' example",
            "progression": 100,
            "color": "blue"
        })

        # Slug

        response = client.get("/api/v0/achievement/%s/slug" % plain_id)

        self.assertEqual(response.status_code,status.HTTP_404_NOT_FOUND);
        self.assertEqual(response.data,{"detail": "Achievement not found"})

        self.assertEqual(client.get("/api/v0/achievement/plain/slug").data,{
            "id": plain_id,
            "name": "Plain",
            "slug": "plain",
            "description": "Plain ol' example",
            "progression": 100,
            "color": "blue"
        })

        # Update 

        response = client.post("/api/v0/achievement/%s" % plain_id,{
            "description": "Plain old example"
        }, format='json')

        self.assertEqual(response.data,{
            "id": plain_id,
            "name": "Plain",
            "slug": "plain",
            "description": "Plain old example",
            "progression": 100,
            "color": "blue"
        })

        self.assertEqual(client.get("/api/v0/achievement/%s" % plain_id).data,{
            "id": plain_id,
            "name": "Plain",
            "slug": "plain",
            "description": "Plain old example",
            "progression": 100,
            "color": "blue"
        })

        # List

        achievement = Achievement(name="Jane",slug="jane",color="red",progression=99)
        achievement.save()
        jane_id = achievement.pk

        self.assertEqual([dict(achievement) for achievement in client.get("/api/v0/achievement/").data],[
            {
                "id": jane_id,
                "name": "Jane",
                "slug": "jane",
                "description": "",
                "progression": 99,
                "color": "red"
            },
            {
                "id": plain_id,
                "name": "Plain",
                "slug": "plain",
                "description": "Plain old example",
                "progression": 100,
                "color": "blue"
            }
        ])

        # Delete

        self.assertEqual(client.delete("/api/v0/achievement/%s" % plain_id).data,{})

        self.assertEqual([dict(achievement) for achievement in client.get("/api/v0/achievement/").data],[
            {
                "id": jane_id,
                "name": "Jane",
                "slug": "jane",
                "description": "",
                "progression": 99,
                "color": "red"
            }
        ])


    def test_program(self):

        client = APIClient()
        user = User.objects.get(username="vagrant")
        client.force_authenticate(user=user)

        # Words validation

        response = client.post("/api/v0/program/",{"words": "oops"}, format='json')

        self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST);
        self.assertEqual(response.data,{"words": ["Must be an array."]})

        response = client.post("/api/v0/program/",{"words": [0]}, format='json')

        self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST);
        self.assertEqual(response.data,{"words": ["All array items be be strings."]})

        # Create

        response = client.post("/api/v0/program/",{}, format='json')

        self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST);
        self.assertEqual(response.data,{"name": ["This field is required."]})

        response = client.post("/api/v0/program/",{
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

        response = client.get("/api/v0/program/0")

        self.assertEqual(response.status_code,status.HTTP_404_NOT_FOUND);
        self.assertEqual(response.data,{"detail": "Program not found"})

        self.assertEqual(client.get("/api/v0/program/%s" % plain_id).data,{
            "id": plain_id,
            "name": "plain",
            "description": "Plain ol' example",
            "words": ["he","it","she"]
        })

        # Update 

        response = client.post("/api/v0/program/%s" % plain_id,{
            "description": "Plain old example",
            "words": ["it","there"]
        }, format='json')

        self.assertEqual(response.data,{
            "id": plain_id,
            "name": "plain",
            "description": "Plain old example",
            "words": ["it","there"]
        })

        self.assertEqual(client.get("/api/v0/program/%s" % plain_id).data,{
            "id": plain_id,
            "name": "plain",
            "description": "Plain old example",
            "words": ["it","there"]
        })

        # Append 

        response = client.post("/api/v0/program/%s/append" % plain_id,{
            "words": ["here","everywhere"]
        }, format='json')

        self.assertEqual(response.data,{
            "id": plain_id,
            "name": "plain",
            "description": "Plain old example",
            "words": ["everywhere","here","it","there"]
        })

        self.assertEqual(client.get("/api/v0/program/%s" % plain_id).data,{
            "id": plain_id,
            "name": "plain",
            "description": "Plain old example",
            "words": ["everywhere","here","it","there"]
        })

        # Remove 

        response = client.post("/api/v0/program/%s/remove" % plain_id,{
            "words": ["here","there"]
        }, format='json')

        self.assertEqual(response.data,{
            "id": plain_id,
            "name": "plain",
            "description": "Plain old example",
            "words": ["everywhere","it"]
        })

        self.assertEqual(client.get("/api/v0/program/%s" % plain_id).data,{
            "id": plain_id,
            "name": "plain",
            "description": "Plain old example",
            "words": ["everywhere","it"]
        })

        # List

        program = Program(name="jane")
        program.save()
        jane_id = program.pk

        self.assertEqual([dict(program) for program in client.get("/api/v0/program/").data],[
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

        self.assertEqual(client.delete("/api/v0/program/%s" % plain_id).data,{})

        self.assertEqual([dict(program) for program in client.get("/api/v0/program/").data],[
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

        response = client.post("/api/v0/student/",{"words": "oops"}, format='json')

        self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST);
        self.assertEqual(response.data,{"words": ["Must be an array."]})

        response = client.post("/api/v0/student/",{"words": [0]}, format='json')

        self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST);
        self.assertEqual(response.data,{"words": ["All array items be be strings."]})

        # Create

        response = client.post("/api/v0/student/",{}, format='json')

        self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST);
        self.assertEqual(response.data,{"first_name": ["This field is required."]})

        response = client.post("/api/v0/student/",{"first_name": "sane"}, format='json')

        self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST);
        self.assertEqual(response.data,{"last_name": ["This field is required."]})

        response = client.post("/api/v0/student/",{
            "first_name": "sane",
            "last_name": "jane",
            "age": 5,
            "words": ["he","she","it","it"]
        }, format='json')

        student = Student.objects.get(teacher=user,first_name="sane",last_name="jane")
        sane_jane_id = student.pk

        self.assertEqual(response.data,{
            "id": sane_jane_id,
            "first_name": "sane",
            "last_name": "jane",
            "age": 5,
            "words": ["he","it","she"]
        })

        # Select

        client.force_authenticate(user=loser)

        response = client.get("/api/v0/student/%s" % sane_jane_id)

        self.assertEqual(response.status_code,status.HTTP_404_NOT_FOUND);
        self.assertEqual(response.data,{"detail": "Student not found"})

        client.force_authenticate(user=user)

        self.assertEqual(client.get("/api/v0/student/%s" % sane_jane_id).data,{
            "id": sane_jane_id,
            "first_name": "sane",
            "last_name": "jane",
            "age": 5,
            "words": ["he","it","she"]
        })

        # Update 

        client.force_authenticate(user=loser)

        response = client.post("/api/v0/student/%s" % sane_jane_id,{})

        self.assertEqual(response.status_code,status.HTTP_404_NOT_FOUND);
        self.assertEqual(response.data,{"detail": "Student not found"})

        client.force_authenticate(user=user)

        response = client.post("/api/v0/student/%s" % sane_jane_id,{
            "age": 6,
            "words": ["it","there"]
        }, format='json')

        self.assertEqual(response.data,{
            "id": sane_jane_id,
            "first_name": "sane",
            "last_name": "jane",
            "age": 6,
            "words": ["it","there"]
        })

        self.assertEqual(client.get("/api/v0/student/%s" % sane_jane_id).data,{
            "id": sane_jane_id,
            "first_name": "sane",
            "last_name": "jane",
            "age": 6,
            "words": ["it","there"]
        })

        # Append 

        client.force_authenticate(user=loser)

        response = client.post("/api/v0/student/%s/append" % sane_jane_id,{})

        self.assertEqual(response.status_code,status.HTTP_404_NOT_FOUND);
        self.assertEqual(response.data,{"detail": "Student not found"})

        client.force_authenticate(user=user)

        response = client.post("/api/v0/student/%s/append" % sane_jane_id,{
            "words": ["here","everywhere"]
        }, format='json')

        self.assertEqual(response.data,{
            "id": sane_jane_id,
            "first_name": "sane",
            "last_name": "jane",
            "age": 6,
            "words": ["everywhere","here","it","there"]
        })

        self.assertEqual(client.get("/api/v0/student/%s" % sane_jane_id).data,{
            "id": sane_jane_id,
            "first_name": "sane",
            "last_name": "jane",
            "age": 6,
            "words": ["everywhere","here","it","there"]
        })

        # Remove 

        client.force_authenticate(user=loser)

        response = client.post("/api/v0/student/%s/remove" % sane_jane_id,{})

        self.assertEqual(response.status_code,status.HTTP_404_NOT_FOUND);
        self.assertEqual(response.data,{"detail": "Student not found"})

        client.force_authenticate(user=user)

        response = client.post("/api/v0/student/%s/remove" % sane_jane_id,{
            "words": ["here","there"]
        }, format='json')

        self.assertEqual(response.data,{
            "id": sane_jane_id,
            "first_name": "sane",
            "last_name": "jane",
            "age": 6,
            "words": ["everywhere","it"]
        })

        self.assertEqual(client.get("/api/v0/student/%s" % sane_jane_id).data,{
            "id": sane_jane_id,
            "first_name": "sane",
            "last_name": "jane",
            "age": 6,
            "words": ["everywhere","it"]
        })

        # List

        student = Student(teacher=user,first_name="silly",last_name="billy",age=7)
        student.save()
        silly_billy_id = student.pk

        client.force_authenticate(user=loser)

        self.assertEqual([dict(student) for student in client.get("/api/v0/student/").data],[])

        client.force_authenticate(user=user)

        self.assertEqual([dict(student) for student in client.get("/api/v0/student/").data],[
            {
                "id": silly_billy_id,
                "first_name": "silly",
                "last_name": "billy",
                "age": 7,
                "words": []
            },
            {
                "id": sane_jane_id,
                "first_name": "sane",
                "last_name": "jane",
                "age": 6,
                "words": ["everywhere","it"]
            }
        ])

        # Delete

        client.force_authenticate(user=loser)

        response = client.delete("/api/v0/student/%s" % sane_jane_id)

        self.assertEqual(response.status_code,status.HTTP_404_NOT_FOUND);
        self.assertEqual(response.data,{"detail": "Student not found"})

        client.force_authenticate(user=user)

        self.assertEqual(client.delete("/api/v0/student/%s" % sane_jane_id).data,{})

        self.assertEqual([dict(student) for student in client.get("/api/v0/student/").data],[
            {
                "id": silly_billy_id,
                "first_name": "silly",
                "last_name": "billy",
                "age": 7,
                "words": []
            }
        ])

        # Focus

        client.force_authenticate(user=loser)

        response = client.post("/api/v0/student/%s/focus" % silly_billy_id,{}, format='json')

        self.assertEqual(response.status_code,status.HTTP_404_NOT_FOUND);
        self.assertEqual(response.data,{"detail": "Student not found"})

        client.force_authenticate(user=user)

        response = client.post("/api/v0/student/%s/focus" % silly_billy_id,{}, format='json')

        self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST);
        self.assertEqual(response.data,{"words": ["This field is required."]})

        response = client.post("/api/v0/student/%s/append" % silly_billy_id,{
            "words": ["here"]
        }, format='json')
        self.assertEqual(response.status_code,status.HTTP_202_ACCEPTED);

        response = client.post("/api/v0/student/%s/focus" % silly_billy_id,{
            "words": ["here","there"]
        }, format='json')

        self.assertEqual(response.status_code,status.HTTP_404_NOT_FOUND);
        self.assertEqual(response.data,{"detail": "Words not found","words": ["there"]})

        response = client.post("/api/v0/student/%s/append" % silly_billy_id,{
            "words": ["there","everywhere"]
        }, format='json')
        self.assertEqual(response.status_code,status.HTTP_202_ACCEPTED);

        response = client.post("/api/v0/student/%s/focus" % silly_billy_id,{
            "words": ["here","there"]
        }, format='json')

        self.assertEqual(response.status_code,status.HTTP_202_ACCEPTED);
        self.assertEqual(response.data,[
            {
                "word": "here",
                "focus": True,
                "achievements": []
            },
            {
                "word": "there",
                "focus": True,
                "achievements": []
            }
        ])

        response = client.get("/api/v0/student/%s/focus" % silly_billy_id,format='json')

        self.assertEqual(response.status_code,status.HTTP_200_OK);
        self.assertEqual(response.data,["here","there"]);

        response = client.post("/api/v0/student/%s/remove" % silly_billy_id,{
            "words": ["here","there","everywhere"]
        }, format='json')
        self.assertEqual(response.status_code,status.HTTP_202_ACCEPTED);

        # Blur 

        client.force_authenticate(user=loser)

        response = client.post("/api/v0/student/%s/blur" % silly_billy_id,{}, format='json')

        self.assertEqual(response.status_code,status.HTTP_404_NOT_FOUND);
        self.assertEqual(response.data,{"detail": "Student not found"})

        client.force_authenticate(user=user)

        response = client.post("/api/v0/student/%s/blur" % silly_billy_id,{}, format='json')

        self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST);
        self.assertEqual(response.data,{"words": ["This field is required."]})

        response = client.post("/api/v0/student/%s/append" % silly_billy_id,{
            "words": ["here"]
        }, format='json')
        self.assertEqual(response.status_code,status.HTTP_202_ACCEPTED);

        response = client.post("/api/v0/student/%s/blur" % silly_billy_id,{
            "words": ["here","there"]
        }, format='json')

        self.assertEqual(response.status_code,status.HTTP_404_NOT_FOUND);
        self.assertEqual(response.data,{"detail": "Words not found","words": ["there"]})

        response = client.post("/api/v0/student/%s/append" % silly_billy_id,{
            "words": ["there","everywhere"]
        }, format='json')
        self.assertEqual(response.status_code,status.HTTP_202_ACCEPTED);

        response = client.post("/api/v0/student/%s/focus" % silly_billy_id,{
            "words": ["here","there"]
        }, format='json')
        self.assertEqual(response.status_code,status.HTTP_202_ACCEPTED);

        response = client.post("/api/v0/student/%s/blur" % silly_billy_id,{
            "words": ["here","there"]
        }, format='json')

        self.assertEqual(response.status_code,status.HTTP_202_ACCEPTED);
        self.assertEqual(response.data,[
            {
                "word": "here",
                "focus": False,
                "achievements": []
            },
            {
                "word": "there",
                "focus": False,
                "achievements": []
            }
        ])

        response = client.post("/api/v0/student/%s/remove" % silly_billy_id,{
            "words": ["here","there","everywhere"]
        }, format='json')
        self.assertEqual(response.status_code,status.HTTP_202_ACCEPTED);

        # Attain 

        client.force_authenticate(user=loser)

        response = client.post("/api/v0/student/%s/attain" % silly_billy_id,{}, format='json')

        self.assertEqual(response.status_code,status.HTTP_404_NOT_FOUND);
        self.assertEqual(response.data,{"detail": "Student not found"})

        client.force_authenticate(user=user)

        response = client.post("/api/v0/student/%s/attain" % silly_billy_id,{}, format='json')

        self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST);
        self.assertEqual(response.data,{"word": ["This field is required."]})

        response = client.post("/api/v0/student/%s/attain" % silly_billy_id,{
            "word": "here"
        }, format='json')

        self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST);
        self.assertEqual(response.data,{"achievement": ["This field is required."]})

        response = client.post("/api/v0/student/%s/attain" % silly_billy_id,{
            "word": "here",
            "achievement": 0
        }, format='json')

        self.assertEqual(response.status_code,status.HTTP_404_NOT_FOUND);
        self.assertEqual(response.data,{"detail": "Word not found"})

        response = client.post("/api/v0/student/%s/append" % silly_billy_id,{
            "words": ["here"]
        }, format='json')
        self.assertEqual(response.status_code,status.HTTP_202_ACCEPTED);

        response = client.post("/api/v0/student/%s/attain" % silly_billy_id,{
            "word": "here",
            "achievement": 0
        }, format='json')

        self.assertEqual(response.status_code,status.HTTP_404_NOT_FOUND);
        self.assertEqual(response.data,{"detail": "Achievement not found"})

        achievement = Achievement(name="Sight",slug="sight",progression=100)
        achievement.save()
        sight_id = achievement.id

        response = client.post("/api/v0/student/%s/attain" % silly_billy_id,{
            "word": "here",
            "achievement": sight_id,
            "at": "2015-09-20T00:00:00Z"
        }, format='json')

        self.assertEqual(response.status_code,status.HTTP_202_ACCEPTED);
        self.assertEqual(response.data["word"],"here")
        self.assertEqual(response.data["achievement"],sight_id)
        self.assertEqual(response.data["hold"],True)
        self.assertEqual(response.data["at"],"2015-09-20T00:00:00Z")

        response = client.post("/api/v0/student/%s/attain" % silly_billy_id,{
            "word": "here",
            "achievement": sight_id,
            "at": "2015-09-21T00:00:00Z"
        }, format='json')

        self.assertEqual(response.status_code,status.HTTP_202_ACCEPTED);
        self.assertEqual(response.data["word"],"here")
        self.assertEqual(response.data["achievement"],sight_id)
        self.assertEqual(response.data["hold"],True)

        # Yield 

        client.post("/api/v0/student/%s/append" % silly_billy_id,{
            "words": ["there"]
        })

        client.force_authenticate(user=loser)

        response = client.post("/api/v0/student/%s/yield" % silly_billy_id,{}, format='json')

        self.assertEqual(response.status_code,status.HTTP_404_NOT_FOUND);
        self.assertEqual(response.data,{"detail": "Student not found"})

        client.force_authenticate(user=user)

        response = client.post("/api/v0/student/%s/yield" % silly_billy_id,{}, format='json')

        self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST);
        self.assertEqual(response.data,{"word": ["This field is required."]})

        response = client.post("/api/v0/student/%s/yield" % silly_billy_id,{
            "word": "there"
        }, format='json')

        self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST);
        self.assertEqual(response.data,{"achievement": ["This field is required."]})

        response = client.post("/api/v0/student/%s/yield" % silly_billy_id,{
            "word": "there",
            "achievement": 0
        }, format='json')

        self.assertEqual(response.status_code,status.HTTP_404_NOT_FOUND);
        self.assertEqual(response.data,{"detail": "Word not found"})

        response = client.post("/api/v0/student/%s/append" % silly_billy_id,{
            "words": ["there"]
        }, format='json')
        self.assertEqual(response.status_code,status.HTTP_202_ACCEPTED);

        response = client.post("/api/v0/student/%s/yield" % silly_billy_id,{
            "word": "there",
            "achievement": 0
        }, format='json')

        self.assertEqual(response.status_code,status.HTTP_404_NOT_FOUND);
        self.assertEqual(response.data,{"detail": "Achievement not found"})

        achievement = Achievement(name="Spell",slug="spell",progression=101)
        achievement.save()
        spell_id = achievement.id

        response = client.post("/api/v0/student/%s/attain" % silly_billy_id,{
            "word": "there",
            "achievement": spell_id,
            "at": "2015-09-22T00:00:00Z"
        }, format='json')

        response = client.post("/api/v0/student/%s/yield" % silly_billy_id,{
            "word": "there",
            "achievement": spell_id,
            "at": "2015-09-23T00:00:00Z"
        }, format='json')

        self.assertEqual(response.status_code,status.HTTP_202_ACCEPTED);
        self.assertEqual(response.data["word"],"there")
        self.assertEqual(response.data["achievement"],spell_id)
        self.assertEqual(response.data["hold"],False)

        response = client.post("/api/v0/student/%s/yield" % silly_billy_id,{
            "word": "there",
            "achievement": spell_id,
            "at": "2015-09-24T00:00:00Z"
        }, format='json')

        self.assertEqual(response.status_code,status.HTTP_202_ACCEPTED);
        self.assertEqual(response.data["word"],"there")
        self.assertEqual(response.data["achievement"],spell_id)
        self.assertEqual(response.data["hold"],False)

        # Position

        client.force_authenticate(user=loser)

        response = client.get("/api/v0/student/%s/position" % silly_billy_id)

        self.assertEqual(response.status_code,status.HTTP_404_NOT_FOUND);
        self.assertEqual(response.data,{"detail": "Student not found"})

        client.force_authenticate(user=user)

        response = client.post("/api/v0/student/%s/focus" % silly_billy_id,{
            "words": ["here"]
        }, format='json')
        self.assertEqual(response.status_code,status.HTTP_202_ACCEPTED);

        self.assertEqual(client.get("/api/v0/student/%s/position" % silly_billy_id).data,[
            {
                "word": "here",
                "focus": True,
                "achievements": [sight_id]
            },
            {
                "word": "there",
                "focus": False,
                "achievements": []
            }
        ])

        self.assertEqual(client.get("/api/v0/student/%s/position?words=here,there" % silly_billy_id).data,[
            {
                "word": "here",
                "focus": True,
                "achievements": [sight_id]
            },
            {
                "word": "there",
                "focus": False,
                "achievements": []
            }
        ])

        self.assertEqual(client.get("/api/v0/student/%s/position?words=here" % silly_billy_id).data,[
            {
                "word": "here",
                "focus": True,
                "achievements": [sight_id]
            }
        ])

        self.assertEqual(client.get("/api/v0/student/%s/position?focus=true" % silly_billy_id).data,[
            {
                "word": "here",
                "focus": True,
                "achievements": [sight_id]
            }
        ])

        self.assertEqual(client.get("/api/v0/student/%s/position?focus=false" % silly_billy_id).data,[
            {
                "word": "there",
                "focus": False,
                "achievements": []
            }
        ])

        # History

        client.force_authenticate(user=loser)

        response = client.get("/api/v0/student/%s/history" % silly_billy_id)

        self.assertEqual(response.status_code,status.HTTP_404_NOT_FOUND);
        self.assertEqual(response.data,{"detail": "Student not found"})

        client.force_authenticate(user=user)

        history = [dict(progress) for progress in client.get("/api/v0/student/%s/history" % silly_billy_id).data]

        self.assertEqual(history,[
            {
                "word": "there",
                "achievement": spell_id,
                "hold": False,
                "at": "2015-09-24T00:00:00Z"
            },
            {
                "word": "there",
                "achievement": spell_id,
                "hold": False,
                "at": "2015-09-23T00:00:00Z"
            },
            {
                "word": "there",
                "achievement": spell_id,
                "hold": True,
                "at": "2015-09-22T00:00:00Z"
            },
            {
                "word": "here",
                "achievement": sight_id,
                "hold": True,
                "at": "2015-09-21T00:00:00Z"
            },
            {
                "word": "here",
                "achievement": sight_id,
                "hold": True,
                "at": "2015-09-20T00:00:00Z"
            }
        ])

        history = [dict(progress) for progress in client.get("/api/v0/student/%s/history/?words=here,there" % silly_billy_id).data]

        self.assertEqual(history,[
            {
                "word": "there",
                "achievement": spell_id,
                "hold": False,
                "at": "2015-09-24T00:00:00Z"
            },
            {
                "word": "there",
                "achievement": spell_id,
                "hold": False,
                "at": "2015-09-23T00:00:00Z"
            },
            {
                "word": "there",
                "achievement": spell_id,
                "hold": True,
                "at": "2015-09-22T00:00:00Z"
            },
            {
                "word": "here",
                "achievement": sight_id,
                "hold": True,
                "at": "2015-09-21T00:00:00Z"
            },
            {
                "word": "here",
                "achievement": sight_id,
                "hold": True,
                "at": "2015-09-20T00:00:00Z"
            }
        ])

        history = [dict(progress) for progress in client.get("/api/v0/student/%s/history/?words=here" % silly_billy_id).data]

        self.assertEqual(history,[
            {
                "word": "here",
                "achievement": sight_id,
                "hold": True,
                "at": "2015-09-21T00:00:00Z"
            },
            {
                "word": "here",
                "achievement": sight_id,
                "hold": True,
                "at": "2015-09-20T00:00:00Z"
            }
        ])

        response = client.post("/api/v0/student/%s/attain" % silly_billy_id,{
            "word": "here",
            "achievement": spell_id,
            "at": "2015-09-25T00:00:00Z"
        }, format='json')

        history = [dict(progress) for progress in client.get("/api/v0/student/%s/history/?achievements=%s,%s" % (silly_billy_id,sight_id,spell_id)).data]

        self.assertEqual(history,[
            {
                "word": "here",
                "achievement": spell_id,
                "hold": True,
                "at": "2015-09-25T00:00:00Z"
            },
            {
                "word": "there",
                "achievement": spell_id,
                "hold": False,
                "at": "2015-09-24T00:00:00Z"
            },
            {
                "word": "there",
                "achievement": spell_id,
                "hold": False,
                "at": "2015-09-23T00:00:00Z"
            },
            {
                "word": "there",
                "achievement": spell_id,
                "hold": True,
                "at": "2015-09-22T00:00:00Z"
            },
            {
                "word": "here",
                "achievement": sight_id,
                "hold": True,
                "at": "2015-09-21T00:00:00Z"
            },
            {
                "word": "here",
                "achievement": sight_id,
                "hold": True,
                "at": "2015-09-20T00:00:00Z"
            }
        ])

        history = [dict(progress) for progress in client.get("/api/v0/student/%s/history/?achievements=%s" % (silly_billy_id,spell_id)).data]

        self.assertEqual(history,[
            {
                "word": "here",
                "achievement": spell_id,
                "hold": True,
                "at": "2015-09-25T00:00:00Z"
            },
            {
                "word": "there",
                "achievement": spell_id,
                "hold": False,
                "at": "2015-09-24T00:00:00Z"
            },
            {
                "word": "there",
                "achievement": spell_id,
                "hold": False,
                "at": "2015-09-23T00:00:00Z"
            },
            {
                "word": "there",
                "achievement": spell_id,
                "hold": True,
                "at": "2015-09-22T00:00:00Z"
            }
        ])

        history = [dict(progress) for progress in client.get("/api/v0/student/%s/history/?achievements=%s" % (silly_billy_id,spell_id)).data]

        self.assertEqual(history,[
            {
                "word": "here",
                "achievement": spell_id,
                "hold": True,
                "at": "2015-09-25T00:00:00Z"
            },
            {
                "word": "there",
                "achievement": spell_id,
                "hold": False,
                "at": "2015-09-24T00:00:00Z"
            },
            {
                "word": "there",
                "achievement": spell_id,
                "hold": False,
                "at": "2015-09-23T00:00:00Z"
            },
            {
                "word": "there",
                "achievement": spell_id,
                "hold": True,
                "at": "2015-09-22T00:00:00Z"
            }
        ])

        history = [dict(progress) for progress in client.get("/api/v0/student/%s/history/?words=here&achievements=%s" % (silly_billy_id,spell_id)).data]

        for progress in history:
            del progress['at']

        self.assertEqual(history,[
            {
                "word": "here",
                "achievement": spell_id,
                "hold": True
            }
        ])

        history = [dict(progress) for progress in client.get("/api/v0/student/%s/history/?from=2015-09-21&to=2015-09-24" % (silly_billy_id)).data]

        self.assertEqual(history,[
            {
                "word": "there",
                "achievement": spell_id,
                "hold": False,
                "at": "2015-09-23T00:00:00Z"
            },
            {
                "word": "there",
                "achievement": spell_id,
                "hold": True,
                "at": "2015-09-22T00:00:00Z"
            },
            {
                "word": "here",
                "achievement": sight_id,
                "hold": True,
                "at": "2015-09-21T00:00:00Z"
            }
        ])

        # Chart

        chart = dict(client.get("/api/v0/student/%s/chart/" % (silly_billy_id)).data)

        self.assertEqual(chart,{
            "words": ["here","there"],
            "times": [
                "2015-09-20",
                "2015-09-21",
                "2015-09-22",
                "2015-09-23",
                "2015-09-24",
                "2015-09-25"
            ],
            "data": {
                "2015-09-20": {sight_id: 1, spell_id: 0},
                "2015-09-21": {sight_id: 1, spell_id: 0},
                "2015-09-22": {sight_id: 1, spell_id: 1},
                "2015-09-23": {sight_id: 1, spell_id: 0},
                "2015-09-24": {sight_id: 1, spell_id: 0},
                "2015-09-25": {sight_id: 1, spell_id: 1}
            }
        })

        chart = dict(client.get("/api/v0/student/%s/chart/?by=week" % (silly_billy_id)).data)

        self.assertEqual(chart,{
            "words": ["here","there"],
            "times": [
                "2015-09-14",
                "2015-09-21"
            ],
            "data": {
                "2015-09-14": {sight_id: 1, spell_id: 0},
                "2015-09-21": {sight_id: 1, spell_id: 1}
            }
        })

        chart = dict(client.get("/api/v0/student/%s/chart/?by=month" % (silly_billy_id)).data)

        self.assertEqual(chart,{
            "words": ["here","there"],
            "times": [
                "2015-09"
            ],
            "data": {
                "2015-09": {sight_id: 1, spell_id: 1}
            }
        })

        response = client.post("/api/v0/student/%s/focus" % silly_billy_id,{
            "words": ["there"]
        }, format='json')
        self.assertEqual(response.status_code,status.HTTP_202_ACCEPTED);

        response = client.post("/api/v0/student/%s/blur" % silly_billy_id,{
            "words": ["here"]
        }, format='json')
        self.assertEqual(response.status_code,status.HTTP_202_ACCEPTED);

        chart = dict(client.get("/api/v0/student/%s/chart/?words=here,there" % (silly_billy_id)).data)

        self.assertEqual(chart,{
            "words": ["here","there"],
            "times": [
                "2015-09-20",
                "2015-09-21",
                "2015-09-22",
                "2015-09-23",
                "2015-09-24",
                "2015-09-25"
            ],
            "data": {
                "2015-09-20": {sight_id: 1, spell_id: 0},
                "2015-09-21": {sight_id: 1, spell_id: 0},
                "2015-09-22": {sight_id: 1, spell_id: 1},
                "2015-09-23": {sight_id: 1, spell_id: 0},
                "2015-09-24": {sight_id: 1, spell_id: 0},
                "2015-09-25": {sight_id: 1, spell_id: 1}
            }
        })

        chart = dict(client.get("/api/v0/student/%s/chart/?words=here" % (silly_billy_id)).data)

        self.assertEqual(chart,{
            "words": ["here"],
            "times": [
                "2015-09-20",
                "2015-09-21",
                "2015-09-22",
                "2015-09-23",
                "2015-09-24",
                "2015-09-25"
            ],
            "data": {
                "2015-09-20": {sight_id: 1, spell_id: 0},
                "2015-09-21": {sight_id: 1, spell_id: 0},
                "2015-09-22": {sight_id: 1, spell_id: 0},
                "2015-09-23": {sight_id: 1, spell_id: 0},
                "2015-09-24": {sight_id: 1, spell_id: 0},
                "2015-09-25": {sight_id: 1, spell_id: 1}
            }
        })

        chart = dict(client.get("/api/v0/student/%s/chart/?focus=true" % (silly_billy_id)).data)

        self.assertEqual(chart,{
            "words": ["there"],
            "times": [
                "2015-09-22",
                "2015-09-23",
                "2015-09-24"
            ],
            "data": {
                "2015-09-22": {sight_id: 0, spell_id: 1},
                "2015-09-23": {sight_id: 0, spell_id: 0},
                "2015-09-24": {sight_id: 0, spell_id: 0}
            }
        })

        chart = dict(client.get("/api/v0/student/%s/chart/?achievements=%s" % (silly_billy_id,spell_id)).data)

        self.assertEqual(chart,{
            "words": ["here","there"],
            "times": [
                "2015-09-22",
                "2015-09-23",
                "2015-09-24",
                "2015-09-25"
            ],
            "data": {
                "2015-09-22": {spell_id: 1},
                "2015-09-23": {spell_id: 0},
                "2015-09-24": {spell_id: 0},
                "2015-09-25": {spell_id: 1}
            }
        })

        chart = dict(client.get("/api/v0/student/%s/chart/?from=2015-09-22&to=2015-09-25" % (silly_billy_id)).data)

        self.assertEqual(chart,{
            "words": ["here","there"],
            "times": [
                "2015-09-22",
                "2015-09-23",
                "2015-09-24"
            ],
            "data": {
                "2015-09-22": {sight_id: 1, spell_id: 1},
                "2015-09-23": {sight_id: 1, spell_id: 0},
                "2015-09-24": {sight_id: 1, spell_id: 0}
            }
        })


    def test_audio(self):

        client = APIClient()
        user = User.objects.get(username="vagrant")
        client.force_authenticate(user=user)

        # Unavailable

        original_forvo_key_file = learning.views.forvo_key_file
        learning.views.forvo_key_file = "/tmp/forvo.key"

        response = client.get("/api/v0/audio/cat/", format='json')
        self.assertEqual(response.status_code,status.HTTP_503_SERVICE_UNAVAILABLE);
        self.assertEqual(response.data,{"detail": "Audio unavailable"})

        # Available

        learning.views.forvo_key_file = original_forvo_key_file 

        response = client.get("/api/v0/audio/cat/", format='json')
        self.assertEqual(response.status_code,status.HTTP_200_OK);
        self.assertIn("mp3",response.data)
        self.assertIn("ogg",response.data)


