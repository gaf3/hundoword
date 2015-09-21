hondoword
===========

The 100 (or so) words children first need to learn for reading.

# Purpose

Young readers need to know 100 or so words to really get started and there's several programs geared towards.  The purpose of this app is have a central location for all those programs, words, and what achievements students have reached with them. 

With this app, someone will be able to easily create an account, enter the students they want to track (or their own child), pick a program, and then track their students' progress with each achievement, whether attained or not, and over time. 

I've just seen a lot of expnesive programs out there and I'm getting a little tired of making money off kids when we should be investing in them. 

# Requirements

* Vagrant 1.6.2
* Virtual Box 4.3.4

This may work with others versions, but I haven't tried any but these. I've only done it on a Mac as well. 

# Getting Started

```bash
git clone git://github.com/gaf3/hundoword.git
cd hundoword/vagrant/
# This'll take awhile the first time
vagrant up 
vagrant ssh
```

This will create an Ubuntu server and map the vagrant user's src directory to the checked out src directory.  It'll also map 192.168.72.87 locally to the VM.

# Web Interface

## Client 

In development as in hasn't written a single line yet. 

## Admin 

Go to http://192.168.72.87/admin/ to get at the database directly.  This has accounts, words, etc. 

# Data

* Achievements - What a student can do to identify or understand a word.
  * name 
  * description
* Program - Collections of words
  * name 
  * description
* ProgramWord - A word in a collection
  * program
  * word
* User - Someone who logs in and controls the site
  * username
  * password
  * email
* Token - Used for logging in and repeated calls
  * user
  * key
* Student
  * teacher - User that managers the students progress
  * first_name
  * last_name 
  * age
* StudentWord - Word a student is working on
  * student
  * word
  * achivements - achievements student currently holds with the word (many to many)
* Progress - Event when a student attains or yields an achievement with a word
  * student 
  * achievement
  * word
  * hold - Whether attained or yielded
  * at - The date and time of the progress

# API

The RESTful API is located at http://192.168.72.87/api/ and all arguments are JSON. It'll be used to drive the client. 

There is also a JavaScript wrapper for the API in `src/api/javascript/hundoword.api.js`.  

The tests for the JavaScript API are located at `http://192.168.72.87/test/api/javascript/`. 

The examples below assume the api was created as: 

```javascript
var api = new HundoWord.API("http://192.168.72.87/api/");
```

In all JavaScript API functions, the arguments success, error, and complete are optional callback functions.  If unspecified, the JavaScript API functions will return the data structures returned by the RESTful API and any errors will throw a `HundoWord.APIException` which has a text message and the full repsonse object. 

* register - Register a new User
  * Request - `POST http://192.168.72.87/api/register/`
    * username 
    * password
    * email - Must be valid format
  * Response - `201 Created`
    * username 
    * email
  * JavaScript - `api.register(username,password,email,success,error,complete)`
* token - Logs in and recieves the token for future communication.
  * Request - `POST http://192.168.72.87/api/token/`
    * username 
    * password
  * Response - `200 Ok`
    * key - Use in subsequent communication in Auth header
  * JavaScript - `api.login(username,password,success,error,complete)`
    * Doesn't return anything if successful, but save the token for all future requests. 
* achievement
  * List  - Retrieves list of Achievements
    * Request - `GET http://192.168.72.87/api/achievement/`
    * Response - `200 Ok`
      * Array
        * id
        * name
        * description
    * JavaScript - `achievements = api.achievement.list(success,error,complete)`
  * Select - Retrieves an Achievement using id
    * Request - `GET http://192.168.72.87/api/achievement/<id>/`
    * Response - `200 Ok`
      * id
      * name
      * description
    * JavaScript - `achievement = api.achievement.select(id,success,error,complete)`
  * Create - Creates an Achievement
    * Request - `POST http://192.168.72.87/api/achievement/`
      * name
      * description
    * Response - `201 Created`
      * id
      * name
      * description
    * JavaScript - `achievement = api.achievement.create(data,success,error,complete)`
      * data - object to be posted
  * Update - Updates an Achievement
    * Request - `POST http://192.168.72.87/api/achievement/<id>/`
      * name (optional)
      * description (optional)
    * Response - `202 Accepted`
      * id
      * name
      * description
    * JavaScript - `achievement = api.achievement.update(id,data,success,error,complete)`
      * data - object to be posted
  * Delete - Deletes an Achievement
    * Request - `DELETE http://192.168.72.87/api/achievement/<id>/`
    * Response - `200 Ok`
    * JavaScript - `api.achievement.delete(id,success,error,complete)`
* program
  * List  - Retrieves list of Programs
    * Request - `GET http://192.168.72.87/api/program/`
    * Response - `200 Ok`
      * Array
        * id
        * name
        * description
        * words - Array of words in the program (string)
    * JavaScript - `programs = api.program.list(success,error,complete)`
  * Select - Retrieves Program using id
    * Request - `GET http://192.168.72.87/api/program/<id>/`
    * Response - `200 Ok`
      * id
      * name
      * description
      * words - Array of words (string)
    * JavaScript - `program = api.program.select(id,success,error,complete)`
  * Create - Creates a Program
    * Request - `POST http://192.168.72.87/api/program/`
      * name
      * description
      * words - Array of words (string) - Duplicates are ignored, no warning
    * Response - `201 Created`
      * id
      * name
      * description
      * words - Array of words (string)
    * JavaScript - `program = api.program.create(data,success,error,complete)`
      * data - object to be posted
  * Update - Updates a Program
    * Request - `POST http://192.168.72.87/api/program/<id>/`
      * name (optional)
      * description (optional)
      * words - Array of words (string) - Will overwrite existing list, dupes ignored
    * Response - `202 Accepted`
      * id
      * name
      * description
      * words - Array of words (string)
    * JavaScript - `program = api.program.update(id,data,success,error,complete)`
      * data - object to be posted
  * Append - Adds words to a Program
    * Request - `POST http://192.168.72.87/api/program/<id>/append/`
      * words - Array of words (string) - Will be added to existing list, dupes already existing ignored
    * Response- `202 Accepted`
      * id
      * name
      * description
      * words - Array of words (string)
    * JavaScript - `program = api.program.append(id,words,success,error,complete)`
      * words - array of words to append
  * Remove - Removes words to a Program
    * Request - `POST http://192.168.72.87/api/program/<id>/remove/`
      * words - Array of words (string) - Will be removed from existing list, dupes ignored
    * Response - `202 Accepted`
      * id
      * name
      * description
      * words - Array of words (string)
    * JavaScript - `program = api.program.remove(id,words,success,error,complete)`
      * words - array of words to remove
  * Delete - Deletes a Program
    * Request - `DELETE http://192.168.72.87/api/program/<id>/`
    * Response - `200 Ok`
    * JavaScript - `api.program.delete(id,success,error,complete)`
* student
  * List  - Retrieves list of Students
    * Request - `GET http://192.168.72.87/api/student/`
    * Response - `200 Ok`
      * Array
        * id
        * first_name
        * last_name
        * age
        * words - Array of words to learn (string)
    * JavaScript - `students = api.student.list(success,error,complete)`
  * Select - Retrieves Student using id
    * Request - `GET http://192.168.72.87/api/student/<id>/`
    * Response - `200 Ok`
      * id
      * first_name
      * last_name
      * age
      * words - Array of words (string)
    * JavaScript - `student = api.student.select(id,success,error,complete)`
  * Position - Retrieves Student Position with words and Achievements using id
    * Request - `GET http://192.168.72.87/api/student/<id>/position/`
    * Response - `200 Ok`
      * Array - ordered by word
        * word 
        * achievments - Array of strings
    * JavaScript - `position = api.student.position(id,success,error,complete)`
  * Progress - Retrieves Student Progress with words and Achievements using id
    * Request - `GET http://192.168.72.87/api/student/<id>/progress/`
    * Response - `200 Ok`
      * Array - ordered by at descending
        * word 
        * achievement
        * hold - Whether the Achieveent was attained or yielded
        * at - Date and time 
    * JavaScript - `progression = api.student.progress(id,success,error,complete)`
  * Create - Creates a Student
    * Request - `POST http://192.168.72.87/api/student/`
      * first_name
      * last_name
      * age
      * words - Array of words (string) - Duplicates are ignored, no warning
    * Response - `201 Created`
      * id
      * first_name
      * last_name
      * age
      * words - Array of words (string)
    * JavaScript - `student = api.student.create(data,success,error,complete)`
      * data - object to be posted
  * Update - Updates a Student
    * Request - `POST http://192.168.72.87/api/student/<id>/`
      * first_name - (optional)
      * last_name - (optional)
      * age - (optional)
      * words - (optional) Array of words (string) - Will overwrite existing list, dupes ignored
    * Response - `202 Accepted`
      * id
      * first_name
      * last_name
      * age
      * words - Array of words (string)
    * JavaScript - `student = api.student.update(id,data,success,error,complete)`
      * data - object to be posted
  * Append - Adds words to a Student
    * Request - `POST http://192.168.72.87/api/student/<id>/append/`
      * words - Array of words (string) - Will be added to existing list, dupes already existing ignored
    * Response - `202 Accepted`
      * id
      * first_name
      * last_name
      * age
      * words - Array of words (string)
    * JavaScript - `student = api.student.append(id,words,success,error,complete)`
      * words - array of words to append
  * Remove - Removes words to a Student
    * Request - `POST http://192.168.72.87/api/student/<id>/append/`
      * words - Array of words (string) - Will be removed from existing list, dupes ignored
    * Response - `202 Accepted`
      * id
      * first_name
      * last_name
      * age
      * words - Array of words (string)
    * JavaScript - `student = api.student.remove(id,words,success,error,complete)`
      * words - array of words to remove
  * Attain - Attains an achievement for a word for a Student and updates Position as well
    * Request - `POST http://192.168.72.87/api/student/<id>/attain/`
      * word
      * achievement - Name of achievement
    * Response - `202 Accepted`
      * word 
      * achievement
      * hold = True - The Achieveent was attained
      * at - Date and time 
    * JavaScript - `progress = api.student.attain(id,word,achievement,success,error,complete)`
  * Yield - Yields an achievement for a word for a Student
    * Request - `POST http://192.168.72.87/api/student/<id>/yield/`
      * word
      * achievement - Name of achievement
    * Response - `202 Accepted`
      * word 
      * achievement
      * hold = False - The Achieveent was yielded
      * at - Date and time 
    * JavaScript - `progress = api.student.yield(id,word,achievement,success,error,complete)`
  * Delete - Deletes a Student
    * Request - `DELETE http://192.168.72.87/api/student/<id>/`
    * Response - `200 Ok`
    * JavaScript - `api.student.delete(id,success,error,complete)`

# Development

The default setup uses Apache and Apache WSGI uses daemons, so if you're making changes to code, you won't see those changes if you refresh the page.  

To spin up the development Django server, which automatically refresh with code changes, open a new terminal, vagrant ssh in and:

```bash
sudo service apache2 stop
cd ~/src/server/hundoword_django/
./server.sh
```

Then go to http://192.168.72.87:8000/admin/ to use the development server for admin and http://192.168.72.87:8000/learning for the API.  Note there's no api/ on this. 

To turn off the server and have Apache take over again, just ctrl-C in teh window you started the server and then:

```bash
sudo service apache2 start
```