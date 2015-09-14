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

The API is located at http://192.168.72.87/api/learning/ and all arguments are JSON. It'll be used to drive the client. 

* register - Register a new User
  * Request - `POST http://192.168.72.87/api/learning/register/`
    * username 
    * password
    * email - Must be valid format
  * Response - `201 Created`
    * username 
    * email
* token - Logs in and recieves the token for future communication.
  * Request - `POST http://192.168.72.87/api/learning/token/`
    * username 
    * password
  * Response - `200 Ok`
    * key - Use in subsequent communication in Auth header
* achievement
  * List  - Retrieves list of Achievements
    * Request - `GET http://192.168.72.87/api/learning/achievement/`
    * Response - `200 Ok`
      * Array
        * id
        * name
        * description
  * Select - Retrieves an Achievement using id
    * Request - `GET http://192.168.72.87/api/learning/achievement/<id>/`
    * Response - `200 Ok`
      * id
      * name
      * description
  * Create - Creates an Achievement
    * Request - `POST http://192.168.72.87/api/learning/achievement/`
      * name
      * description
    * Response - `201 Created`
      * id
      * name
      * description
  * Update - Updates an Achievement
    * Request - `POST http://192.168.72.87/api/learning/achievement/<id>/`
      * name (optional)
      * description (optional)
    * Response - `202 Accepted`
      * id
      * name
      * description
  * Delete - Deletes an Achievement
    * Request - `DELETE http://192.168.72.87/api/learning/achievement/<id>/`
    * Response - `200 Ok`
* program
  * List  - Retrieves list of Programs
    * Request - `GET http://192.168.72.87/api/learning/program/`
    * Response - `200 Ok`
      * Array
        * id
        * name
        * description
        * words - Array of words in the program (string)
  * Select - Retrieves Program using id
    * Request - `GET http://192.168.72.87/api/learning/program/<id>/`
    * Response - `200 Ok`
      * id
      * name
      * description
      * words - Array of words (string)
  * Create - Creates a Program
    * Request - `POST http://192.168.72.87/api/learning/program/`
      * name
      * description
      * words - Array of words (string) - Duplicates are ignored, no warning
    * Response - `201 Created`
      * id
      * name
      * description
      * words - Array of words (string)
  * Update - Updates a Program
    * Request - `POST http://192.168.72.87/api/learning/program/<id>/`
      * name (optional)
      * description (optional)
      * words - Array of words (string) - Will overwrite existing list, dupes ignored
    * Response - `202 Accepted`
      * id
      * name
      * description
      * words - Array of words (string)
  * Append - Adds words to a Program
    * Request - `POST http://192.168.72.87/api/learning/program/<id>/`
      * words - Array of words (string) - Will be added to existing list, dupes already existing ignored
    * Response- `202 Accepted`
      * id
      * name
      * description
      * words - Array of words (string)
  * Remove - Removes words to a Program
    * Request - `POST http://192.168.72.87/api/learning/program/<id>/`
      * words - Array of words (string) - Will be removed from existing list, dupes ignored
    * Response - `202 Accepted`
      * id
      * name
      * description
      * words - Array of words (string)
  * Delete - Deletes a Program
    * Request - `DELETE http://192.168.72.87/api/learning/program/<id>/`
    * Response - `200 Ok`
* student
  * List  - Retrieves list of Students
    * Request - `GET http://192.168.72.87/api/learning/student/`
    * Response - `200 Ok`
      * Array
        * id
        * first_name
        * last_name
        * age
        * words - Array of words to learn (string)
  * Select - Retrieves Student using id
    * Request - `GET http://192.168.72.87/api/learning/student/<id>/`
    * Response - `200 Ok`
      * id
      * first_name
      * last_name
      * age
      * words - Array of words (string)
  * Position - Retrieves Student Position with words and Achievements using id
    * Request - `GET http://192.168.72.87/api/learning/student/<id>/position/`
    * Response - `200 Ok`
      * Array - ordered by word
        * word 
        * achievments - Array of strings
  * Progress - Retrieves Student Progress with words and Achievements using id
    * Request - `GET http://192.168.72.87/api/learning/student/<id>/progress/`
    * Response - `200 Ok`
      * Array - ordered by at descending
        * word 
        * achievement
        * hold - Whether the Achieveent was attained or yielded
        * at - Date and time 
  * Create - Creates a Student
    * Request - `POST http://192.168.72.87/api/learning/student/`
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
  * Update - Updates a Student
    * Request - `POST http://192.168.72.87/api/learning/student/<id>/`
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
  * Append - Adds words to a Student
    * Request - `POST http://192.168.72.87/api/learning/student/<id>/`
      * words - Array of words (string) - Will be added to existing list, dupes already existing ignored
    * Response - `202 Accepted`
      * id
      * first_name
      * last_name
      * age
      * words - Array of words (string)
  * Remove - Removes words to a Student
    * Request - `POST http://192.168.72.87/api/learning/student/<id>/`
      * words - Array of words (string) - Will be removed from existing list, dupes ignored
    * Response - `202 Accepted`
      * id
      * first_name
      * last_name
      * age
      * words - Array of words (string)
  * Attain - Attains an achievement for a word for a Student and updates Position as well
    * Request - `POST http://192.168.72.87/api/learning/student/<id>/attain/`
      * word
      * achievement
    * Response - `202 Accepted`
      * word 
      * achievement
      * hold = True - The Achieveent was attained
      * at - Date and time 
  * Yield - Yields an achievement for a word for a Student
    * Request - `POST http://192.168.72.87/api/learning/student/<id>/`
      * word
      * achievement
    * Response - `202 Accepted`
      * word 
      * achievement
      * hold = False - The Achieveent was yielded
      * at - Date and time 
  * Delete - Deletes a Student
    * Request - `DELETE http://192.168.72.87/api/learning/student/<id>/`
    * Response - `200 Ok`

# Development

The default setup uses Apache and Apache WSGI uses daemons, so if you're making changes to code, you won't see those changes if you refresh the page.  

To spin up the development Django server, which automatically refresh with code changes, open a new terminal, vagrant ssh in and:

```bash
cd ~/src/server/hundoword_django/
./server.sh
```

Then go to http://192.168.72.87:8000/admin/ to use the development server for admin and http://192.168.72.87:8000/learning for the API.  Note there's no api/ on this. 