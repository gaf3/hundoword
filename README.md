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
  * teacher - User that managers the students progress (defaults to user)
  * first_name
  * last_name 
  * age
* StudentWord - Word a student is working on
  * student
  * word
  * achievements - achievements student currently holds with the word (many to many)
* Progress - Event when a student attains or yields an achievement with a word
  * student 
  * achievement
  * word
  * hold - Whether attained or yielded
  * at - The date and time of the progress

# Web

## Client 

Go to http://192.168.72.87/ for the web site.  It's JavaScript interactive site so there's #'s before all the links.

There's already an existing user/pass: vagrant/vagrant or you can create a new one. 

* `#/` - Home: Just a basic splash screen
* `#/regsiter/` - Register: Register a new user
* `#/login/` - Login: Log in as an existing user
* `#/achievement/` - Achievements: List existing achievements or create a new one
* `#/achievement/<id>/` - Achievement: Selecting existing achievement using id, edit or delete.
  * id - Achievement to select
* `#/program/` - Programs: List existing programs or create a new one
* `#/program/<id>/` - Program: Selecting existing program using id, edit or delete.
  * id - Program to select
* `#/student/` - Students: List existing students or create a new one
* `#/student/<id>/` - Student: Selecting existing student using id, edit or delete.
  * id - Student to select
* `#/student/<id>/position/words=<word>,<word>` - Position: Where a student stands on each of their words' achievements.
  * id - Student to select
  * words - Only show position for these words
* `#/student/<id>/history/words=<word>,<word>&achievements=<achievement_id>,<achievement_id>&from=<from>&to=<to>` - Position: Where a student stands on each of their words' achievements.
  * id - Student to select
  * words - Only show history for these words
  * achievements - Only show history for these achievements (by id)
  * from - Only show history from this date (YYYY-MM-DD)
  * to - Only show history to this date (YYYY-MM-DD)

## Admin 

Go to http://192.168.72.87/admin/ to get at the database directly.  This has accounts, words, etc. Use user/pass: vagrant/vagrant to log in.

# API

## RESTful

The RESTful API is located at http://192.168.72.87/api/v0/ and all arguments are JSON. It's used to drive the client. 

There's already an existing user/pass: vagrant/vagrant or you can use a new one if you created one through the web site. 

## JavaScript

There is also a JavaScript wrapper for the RESTful API in `src/api/v0/javascript/hundoword.api.js`.  

The examples below assume the api was created as: 

```javascript
var api = new HundoWord.API("http://192.168.72.87/api/v0/");
```

In all JavaScript API functions, the arguments success, error, and complete are optional callback functions.  If unspecified, the JavaScript API functions will return the data structures returned by the RESTful API and any errors will throw a `HundoWord.APIException` which has a text message and the full repsonse object. 

### Endpoints / Functions

* register - Register a new User
  * Request - `POST http://192.168.72.87/api/v0/register/`
    * username 
    * password
    * email - Must be valid format
  * Response - `201 Created`
    * username 
    * email
  * JavaScript - `api.register(username,password,email,success,error,complete)`
* token - Logs in and recieves the token for future communication.
  * Request - `POST http://192.168.72.87/api/v0/token/`
    * username 
    * password
  * Response - `200 Ok`
    * key - Use in subsequent communication in Auth header
  * JavaScript - `api.login(username,password,success,error,complete)`
    * Doesn't return anything if successful, but save the token for all future requests. 
* achievement
  * List  - Retrieves list of Achievements
    * Request - `GET http://192.168.72.87/api/v0/achievement/`
    * Response - `200 Ok`
      * Array
        * id
        * name
        * description
    * JavaScript - `api.achievement.list(success,error,complete)`
  * Select - Retrieves an Achievement using id
    * Request - `GET http://192.168.72.87/api/v0/achievement/<id>/`
    * Response - `200 Ok`
      * id
      * name
      * description
    * JavaScript - `api.achievement.select(id,success,error,complete)`
  * Create - Creates an Achievement
    * Request - `POST http://192.168.72.87/api/v0/achievement/`
      * name
      * description
    * Response - `201 Created`
      * id
      * name
      * description
    * JavaScript - `api.achievement.create(data,success,error,complete)`
      * data - object to be posted
  * Update - Updates an Achievement
    * Request - `POST http://192.168.72.87/api/v0/achievement/<id>/`
      * name (optional)
      * description (optional)
    * Response - `202 Accepted`
      * id
      * name
      * description
    * JavaScript - `api.achievement.update(id,data,success,error,complete)`
      * data - object to be posted
  * Delete - Deletes an Achievement
    * Request - `DELETE http://192.168.72.87/api/v0/achievement/<id>/`
    * Response - `200 Ok`
    * JavaScript - `api.achievement.delete(id,success,error,complete)`
* program
  * List  - Retrieves list of Programs
    * Request - `GET http://192.168.72.87/api/v0/program/`
    * Response - `200 Ok`
      * Array
        * id
        * name
        * description
        * words - Array of words in the program (string)
    * JavaScript - `api.program.list(success,error,complete)`
  * Select - Retrieves Program using id
    * Request - `GET http://192.168.72.87/api/v0/program/<id>/`
    * Response - `200 Ok`
      * id
      * name
      * description
      * words - Array of words (string)
    * JavaScript - `api.program.select(id,success,error,complete)`
  * Create - Creates a Program
    * Request - `POST http://192.168.72.87/api/v0/program/`
      * name
      * description
      * words - Array of words (string) - Duplicates are ignored, no warning
    * Response - `201 Created`
      * id
      * name
      * description
      * words - Array of words (string)
    * JavaScript - `api.program.create(data,success,error,complete)`
      * data - object to be posted
  * Update - Updates a Program
    * Request - `POST http://192.168.72.87/api/v0/program/<id>/`
      * name (optional)
      * description (optional)
      * words - Array of words (string) - Will overwrite existing list, dupes ignored
    * Response - `202 Accepted`
      * id
      * name
      * description
      * words - Array of words (string)
    * JavaScript - `api.program.update(id,data,success,error,complete)`
      * data - object to be posted
  * Append - Adds words to a Program
    * Request - `POST http://192.168.72.87/api/v0/program/<id>/append/`
      * words - Array of words (string) - Will be added to existing list, dupes already existing ignored
    * Response- `202 Accepted`
      * id
      * name
      * description
      * words - Array of words (string)
    * JavaScript - `api.program.append(id,words,success,error,complete)`
      * words - array of words to append
  * Remove - Removes words to a Program
    * Request - `POST http://192.168.72.87/api/v0/program/<id>/remove/`
      * words - Array of words (string) - Will be removed from existing list, dupes ignored
    * Response - `202 Accepted`
      * id
      * name
      * description
      * words - Array of words (string)
    * JavaScript - `api.program.remove(id,words,success,error,complete)`
      * words - array of words to remove
  * Delete - Deletes a Program
    * Request - `DELETE http://192.168.72.87/api/v0/program/<id>/`
    * Response - `200 Ok`
    * JavaScript - `api.program.delete(id,success,error,complete)`
* student
  * List  - Retrieves list of Students
    * Request - `GET http://192.168.72.87/api/v0/student/`
    * Response - `200 Ok`
      * Array
        * id
        * first_name
        * last_name
        * age
        * words - Array of words to learn (string)
    * JavaScript - `api.student.list(success,error,complete)`
  * Select - Retrieves Student using id
    * Request - `GET http://192.168.72.87/api/v0/student/<id>/`
    * Response - `200 Ok`
      * id
      * first_name
      * last_name
      * age
      * words - Array of words (string)
    * JavaScript - `api.student.select(id,success,error,complete)`
  * Create - Creates a Student
    * Request - `POST http://192.168.72.87/api/v0/student/`
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
    * JavaScript - `api.student.create(data,success,error,complete)`
      * data - object to be posted
  * Update - Updates a Student
    * Request - `POST http://192.168.72.87/api/v0/student/<id>/`
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
    * JavaScript - `api.student.update(id,data,success,error,complete)`
      * data - object to be posted
  * Append - Adds words to a Student
    * Request - `POST http://192.168.72.87/api/v0/student/<id>/append/`
      * words - Array of words (string) - Will be added to existing list, dupes already existing ignored
    * Response - `202 Accepted`
      * id
      * first_name
      * last_name
      * age
      * words - Array of words (string)
    * JavaScript - `api.student.append(id,words,success,error,complete)`
      * words - array of words to append
  * Remove - Removes words to a Student
    * Request - `POST http://192.168.72.87/api/v0/student/<id>/append/`
      * words - Array of words (string) - Will be removed from existing list, dupes ignored
    * Response - `202 Accepted`
      * id
      * first_name
      * last_name
      * age
      * words - Array of words (string)
    * JavaScript - `api.student.remove(id,words,success,error,complete)`
      * words - array of words to remove
  * Attain - Attains an achievement for a word for a Student and updates Position as well
    * Request - `POST http://192.168.72.87/api/v0/student/<id>/attain/`
      * word
      * achievement - Name of achievement
    * Response - `202 Accepted`
      * word 
      * achievement (id)
      * hold = True - The Achievement was attained
      * at - Date and time (YYYY-MM-DDTHH:MM:SSZ)
    * JavaScript - `api.student.attain(id,word,achievement,at,success,error,complete)`
  * Yield - Yields an achievement for a word for a Student
    * Request - `POST http://192.168.72.87/api/v0/student/<id>/yield/`
      * word
      * achievement - Name of achievement
    * Response - `202 Accepted`
      * word 
      * achievement (id)
      * hold = False - The Achievement was yielded
      * at - Date and time (YYYY-MM-DDTHH:MM:SSZ)
    * JavaScript - `api.student.yield(id,word,achievement,at,success,error,complete)`
  * Position - Retrieves Student Position with words and Achievements using id
    * Request - `GET http://192.168.72.87/api/v0/student/<id>/position/?words=<word>,<word>`
      * words = Only return position for these words
    * Response - `200 Ok`
      * Array - ordered by word
        * word 
        * achievments - Array of strings
    * JavaScript - `api.student.position(id,words,success,error,complete)`
      * words - Array of words to return data for
  * History - Retrieves Student History with words and Achievements using id
    * Request - `GET http://192.168.72.87/api/v0/student/<id>/history/?words=<word>,<word>&achievements=<achievement>,<achievement>`
      * words = Only return history for these words
      * achievements - Only show history for these achievements (by id)
      * from - Only show history from this date (YYYY-MM-DD)
      * to - Only show history to this date (YYYY-MM-DD)
    * Response - `200 Ok`
      * Array - ordered by at descending
        * word 
        * achievement
        * hold - Whether the Achieveent was attained or yielded
        * at - Date and time 
    * JavaScript - `api.student.history(id,words[],achievements[],hold,from,to,success,error,complete)`
  * Delete - Deletes a Student
    * Request - `DELETE http://192.168.72.87/api/v0/student/<id>/`
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

All the same URL's will work because there's an Nginx reverse proxy. 

To turn off the server and have Apache take over again, just ctrl-C in the window you started the server and then:

```bash
sudo service apache2 start
```

# Testing

Make sure you're using Django in Development mode above.  Trust me, it'll save you a lot of headaches. 

## RESTful API

```bash
cd ~/src/server/hundoword_django/
./coverage.sh
```

This creates a test database and executes calls again it, not the main database.  It creates/destroys the database before/after after bank of tests, not every test, because that would be slow.

It'll also generate a nice coverage report as the name implies. 

## JavaScript API

Go to `http://192.168.72.87/test/api/v0/javascript/` and wait.  You might want to get a sandwich. 

This uses the existing database, but puts prefixes of 'api-js-test-' before all Users, Achievements, and Programs. It creates/destroys these Users, Achievements, and Programs before/after every test and it's slow.  

The reason for this is the JavaScript API supports and even encourages asynchronous usage. It's hard to test creates, checks, updates, deletes, in a single bank of tests if things are asynchronous. 

IMPORTANT: If you've used the API through the browser and then run the JavaScript API tests, you'll get a ton of errors.  You have to compeltely close the browser and reopen it for the tests to work. I know it's stupid but that's BasicAuth for ya. 
