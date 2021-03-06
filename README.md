hundoword
===========

The 100 (or so) words children first need to learn for reading.

# Purpose

Young readers need to know 100 or so words to really get started and there's several lessons geared towards.  The purpose of this app is have a central location for all those lessons, words, and what achievements students have reached with them. 

With this app, someone will be able to easily create an account, enter the students they want to track (or their own child), pick a lesson, and then track their students' progress with each achievement, whether attained or not, and over time. 

I've just seen a lot of expnesive lessons out there and I'm getting a little tired of making money off kids when we should be investing in them. 

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

## Pronunciation

Right now, this requires an account at http://api.forvo.com/. I have the $1/month 500 req/day one right now.  If you see up an account, add your key to your vagrant instance like so:

```bash
sudo mkdir /etc/hundoword
echo "your key here" | sudo tee /etc/hundoword/forvo.key
```

Without this, none of the pronunciation works.  I think we're eventually just going to record our own and allow users to the do the same, but this works for now.

# Data

* Achievements - What a student can do to identify or understand a word.
  * name 
  * description
  * progression - Suggested order to attain
* Lesson - Collections of words
  * name 
  * description
  * words - List of words for the lesson
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
  * words - List of words to learn (string)
  * plan - Plan for progression of words
    * focus - How many words to focus on at a time
    * required - Achievements required to complete a word
    * forgo - Achievements to not show at all
  * focus - List of words to focus on 
  * position - Record of where the student is at
    * word - Word
    * achievements - List of achievements held for that word
* Progress - Event when a student attains or yields an achievement with a word
  * student 
  * achievement
  * word
  * held - Whether attained or yielded
  * at - The date and time of the progress

## Achievements / Games

* Introduction - Just shows the word, plays its sound, and has a speaker icon to replay.
* Sight Match - Show the word above and they have to click the word in a group below. First click either pass or fail.
* Sight Spell - Show the word above and they have to type in characters to match the spelling.
* Sight Cross - Two lists of words, click one, then click the other. If wrong, both get crossed out red.
* Sight Search - Basic word search. Student clicks letters, circling in row. When circle matches, word is crossed out. Indifferent button to give up.
* Sound Match - Play the sound (and button to replay), pick from a list.
* Sound Spell - Show the word above and they have to type in characters to match the spelling.
* Sound Cross - Line of speakers and line of words.  Play the speaker, match the words.
* Sound Search - Basic word search. List of speakers for words to search for. Student clicks letters, circling in row. When circle matches, word is green. Indifferent button to give up.

## Plans

Plans allow for self directed learning.  With a plan, you can specify 
* How man words a Student should focus on at a time
* Which achievements a Student must attain for a word for it to be considered learn
* Which achievements you want them to ignore altogether for now

Once you define a Plan on the Plan tab, you can click the Evaluate button, and the Student's focus will automatically be updated as well as the list of words considered learned.  You can update their Plan and reevaluate as many times as you want. 

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
* `#/lesson/` - Lessons: List existing lessons or create a new one
* `#/lesson/<id>/` - Lesson: Selecting existing lesson using id, edit or delete.
  * id - Lesson to select
* `#/student/` - Students: List existing students or create a new one
* `#/student/<id>/` - Student: Selecting existing student using id, edit or delete.
  * id - Student to select
* `#/student/<id>/focus/` - Focus: What words a student should be focusing on
  * id - Student to select
* `#/student/<id>/plan/` - Plan: How many words should the student focus on and what achievements are required to move on
  * id - Student to select
* `#/student/<id>/play/` - Play: Where a student can play games and attain/yield achievements with feedback and focus is automatically updated
  * id - Student to select
* `#/student/<id>/assess/` - Assess: Where a student can play games and attain/yield achievements without feedback, focus is controlled by Teacher
  * id - Student to select
* `#/student/<id>/position/?words=<word>,<word>,focus=true/false` - Position: Where a student stands on each of their words' achievements.
  * id - Student to select
  * words - Only show position for these words
  * focus - Only show position for words the Student is focusing on or not focusing on
* `#/student/<id>/chart/?by=<by>&focus=<focus>&words=<word>,<word>&achievements=<achievement_id>,<achievement_id>&from=<from>&to=<to>` - Chart: Charts where a student was at with different achievements
  * id - Student to select
  * by - What to group by (shows last status for that period, uses previous period if no change)
    * date - Group by Date
    * week - Group by week, starting on Monday
    * month - Group by month
  * focus - Only chart progress for words currently being focused on
  * words - Only chart progress for these words
  * achievements - Only chart progress for these achievements (by id)
  * from - Only chart progress from this date (YYYY-MM-DD)
  * to - Only chart progress to this date (YYYY-MM-DD - exclusive, up to but not including this date)
* `#/student/<id>/history/?words=<word>,<word>&achievements=<achievement_id>,<achievement_id>&from=<from>&to=<to>` - History: All the attains and yields a studnt has made
  * id - Student to select
  * words - Only show history for these words
  * achievements - Only show history for these achievements (by id)
  * from - Only show history from this date (YYYY-MM-DD)
  * to - Only show history to this date (YYYY-MM-DD - exclusive, up to but not including this date)

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
        * progression
    * JavaScript - `api.achievement.list(success,error,complete)`
  * Select - Retrieves an Achievement using id
    * Request - `GET http://192.168.72.87/api/v0/achievement/<id>/`
    * Response - `200 Ok`
      * id
      * name
      * description
      * progression
    * JavaScript - `api.achievement.select(id,success,error,complete)`
  * Create - Creates an Achievement
    * Request - `POST http://192.168.72.87/api/v0/achievement/`
      * name
      * description
      * progression
    * Response - `201 Created`
      * id
      * name
      * description
      * progression
    * JavaScript - `api.achievement.create(data,success,error,complete)`
      * data - object to be posted
  * Update - Updates an Achievement
    * Request - `POST http://192.168.72.87/api/v0/achievement/<id>/`
      * name (optional)
      * description (optional)
      * progression (optional)
    * Response - `202 Accepted`
      * id
      * name
      * description
      * progression
    * JavaScript - `api.achievement.update(id,data,success,error,complete)`
      * data - object to be posted
  * Delete - Deletes an Achievement
    * Request - `DELETE http://192.168.72.87/api/v0/achievement/<id>/`
    * Response - `200 Ok`
    * JavaScript - `api.achievement.delete(id,success,error,complete)`
* lesson
  * List  - Retrieves list of Lessons
    * Request - `GET http://192.168.72.87/api/v0/lesson/`
    * Response - `200 Ok`
      * Array
        * id
        * name
        * description
        * words - Array of words in the lesson (string)
    * JavaScript - `api.lesson.list(success,error,complete)`
  * Select - Retrieves Lesson using id
    * Request - `GET http://192.168.72.87/api/v0/lesson/<id>/`
    * Response - `200 Ok`
      * id
      * name
      * description
      * words - Array of words (string)
    * JavaScript - `api.lesson.select(id,success,error,complete)`
  * Create - Creates a Lesson
    * Request - `POST http://192.168.72.87/api/v0/lesson/`
      * name
      * description
      * words - Array of words (string) - Duplicates are ignored, no warning
    * Response - `201 Created`
      * id
      * name
      * description
      * words - Array of words (string)
    * JavaScript - `api.lesson.create(data,success,error,complete)`
      * data - object to be posted
  * Update - Updates a Lesson
    * Request - `POST http://192.168.72.87/api/v0/lesson/<id>/`
      * name (optional)
      * description (optional)
      * words - Array of words (string) - Will overwrite existing list, dupes ignored
    * Response - `202 Accepted`
      * id
      * name
      * description
      * words - Array of words (string)
    * JavaScript - `api.lesson.update(id,data,success,error,complete)`
      * data - object to be posted
  * Append - Adds words to a Lesson
    * Request - `POST http://192.168.72.87/api/v0/lesson/<id>/append/`
      * words - Array of words (string) - Will be added to existing list, dupes already existing ignored
    * Response- `202 Accepted`
      * id
      * name
      * description
      * words - Array of words (string)
    * JavaScript - `api.lesson.append(id,words,success,error,complete)`
      * words - array of words to append
  * Remove - Removes words to a Lesson
    * Request - `POST http://192.168.72.87/api/v0/lesson/<id>/remove/`
      * words - Array of words (string) - Will be removed from existing list, dupes ignored
    * Response - `202 Accepted`
      * id
      * name
      * description
      * words - Array of words (string)
    * JavaScript - `api.lesson.remove(id,words,success,error,complete)`
      * words - array of words to remove
  * Delete - Deletes a Lesson
    * Request - `DELETE http://192.168.72.87/api/v0/lesson/<id>/`
    * Response - `200 Ok`
    * JavaScript - `api.lesson.delete(id,success,error,complete)`
* student
  * List  - Retrieves list of Students
    * Request - `GET http://192.168.72.87/api/v0/student/`
    * Response - `200 Ok`
      * Array
        * id
        * first_name
        * last_name
        * words - Array of words to learn (string)
        * plan - Object of progression of words
          * focus - Count of words to focus on at a time
          * required - Id's of achievements required to complete a word
          * forgo - Id's of achievements to not check for at all
        * focus - Array of words to focus on 
        * position - Object of where the student is at
          * word - Key of the word
            * achievements - Id's of achievements held
    * JavaScript - `api.student.list(success,error,complete)`
  * Select - Retrieves Student using id
    * Request - `GET http://192.168.72.87/api/v0/student/<id>/`
    * Response - `200 Ok`
      * id
      * first_name
      * last_name
      * words - Array of words (string)
      * plan - Object of progression of words
        * focus - Count of words to focus on at a time
        * required - Id's of achievements required to complete a word
        * forgo - Id's of achievements to not check for at all
      * focus - Array of words to focus on 
      * position - Object of where the student is at
        * word - Key of the word
          * achievements - Id's of achievements held
    * JavaScript - `api.student.select(id,success,error,complete)`
  * Create - Creates a Student
    * Request - `POST http://192.168.72.87/api/v0/student/`
      * first_name
      * last_name
      * words - Array of words (string) - Duplicates are ignored, no warning, position maintained
      * plan - Object of progression of words
        * focus - Count of words to focus on at a time
        * required - Id's of achievements required to complete a word
        * forgo - Id's of achievements to not check for at all
      * focus - Array of words to focus on 
    * Response - `201 Created`
      * id
      * first_name
      * last_name
      * words - Array of words (string)
      * plan - Object of progression of words
        * focus - Count of words to focus on at a time
        * required - Id's of achievements required to complete a word
        * forgo - Id's of achievements to not check for at all
      * focus - Array of words to focus on 
      * position - Object of where the student is at
        * word - Key of the word
          * achievements - Id's of achievements held
    * JavaScript - `api.student.create(data,success,error,complete)`
      * data - object to be posted
  * Update - Updates a Student
    * Request - `POST http://192.168.72.87/api/v0/student/<id>/`
      * first_name - (optional)
      * last_name - (optional)
      * words - (optional) Array of words (string) - Will overwrite existing list, dupes ignored, position maintained
      * focus - Array of words to focus on 
    * Response - `202 Accepted`
      * id
      * first_name
      * last_name
      * words - Array of words (string)
      * plan - Object of progression of words
        * focus - Count of words to focus on at a time
        * required - Id's of achievements required to complete a word
        * forgo - Id's of achievements to not check for at all
      * focus - Array of words to focus on
      * position - Object of where the student is at
        * word - Key of the word
          * achievements - Id's of achievements held
    * JavaScript - `api.student.update(id,data,success,error,complete)`
      * data - object to be posted
  * Append - Adds words to a Student
    * Request - `POST http://192.168.72.87/api/v0/student/<id>/append/`
      * words - Array of words (string) - Will be added to existing list, dupes already existing ignored
    * Response - `202 Accepted`
      * id
      * first_name
      * last_name
      * words - Array of words (string)
      * plan - Object of progression of words
        * focus - Count of words to focus on at a time
        * required - Id's of achievements required to complete a word
        * forgo - Id's of achievements to not check for at all
      * focus - Array of words to focus on
      * position - Object of where the student is at
        * word - Key of the word
          * achievements - Id's of achievements held
    * JavaScript - `api.student.append(id,words,success,error,complete)`
      * words - array of words to append
  * Remove - Removes words to a Student
    * Request - `POST http://192.168.72.87/api/v0/student/<id>/remove/`
      * words - Array of words (string) - Will be removed from existing list, dupes ignored
    * Response - `202 Accepted`
      * id
      * first_name
      * last_name
      * words - Array of words (string)
      * plan - Object of progression of words
        * focus - Count of words to focus on at a time
        * required - Id's of achievements required to complete a word
        * forgo - Id's of achievements to not check for at all
      * focus - Array of words to focus on
      * position - Object of where the student is at
        * word - Key of the word
          * achievements - Id's of achievements held
    * JavaScript - `api.student.remove(id,words,success,error,complete)`
      * words - array of words to remove
  * Focus - Have Student focus on particular words or get what they're focusing on
    * Request - `POST http://192.168.72.87/api/v0/student/<id>/focus/`
      * words - Array of words (string) - Will have their focus set to true
    * Response - `202 Accepted`
      * id
      * first_name
      * last_name
      * words - Array of words (string)
      * plan - Object of progression of words
        * focus - Count of words to focus on at a time
        * required - Id's of achievements required to complete a word
        * forgo - Id's of achievements to not check for at all
      * focus - Array of words to focus on
      * position - Object of where the student is at
        * word - Key of the word
          * achievements - Id's of achievements held
    * JavaScript - `api.student.focus(id,words,success,error,complete)`
      * words - array of words to focus on
  * Blur - Have a Student stop focusing on particular words
    * Request - `POST http://192.168.72.87/api/v0/student/<id>/blur/`
      * words - Array of words (string) - Will have their focus set to true
    * Response - `202 Accepted`
      * id
      * first_name
      * last_name
      * words - Array of words (string)
      * plan - Object of progression of words
        * focus - Count of words to focus on at a time
        * required - Id's of achievements required to complete a word
        * forgo - Id's of achievements to not check for at all
      * focus - Array of words to focus on
      * position - Object of where the student is at
        * word - Key of the word
          * achievements - Id's of achievements held
    * JavaScript - `api.student.blur(id,words,success,error,complete)`
      * words - array of words to stop focusing on
  * Attain - Attains an achievement for a word for a Student and updates Position as well
    * Request - `POST http://192.168.72.87/api/v0/student/<id>/attain/`
      * word
      * achievement - Name of achievement
      * at (optional, defaults to now) - Date and time (YYYY-MM-DDTHH:MM:SSZ)
    * Response - `202 Accepted`
      * word 
      * achievement (id)
      * held = True - The Achievement was attained
      * at - Date and time (YYYY-MM-DDTHH:MM:SSZ)
    * JavaScript - `api.student.attain(id,word,achievement,at,success,error,complete)`
  * Yield - Yields an achievement for a word for a Student
    * Request - `POST http://192.168.72.87/api/v0/student/<id>/yield/`
      * word
      * achievement - Name of achievement
      * at (optional, defaults to now) - Date and time (YYYY-MM-DDTHH:MM:SSZ)
    * Response - `202 Accepted`
      * word 
      * achievement (id)
      * held = False - The Achievement was yielded
      * at - Date and time (YYYY-MM-DDTHH:MM:SSZ)
    * JavaScript - `api.student.yield(id,word,achievement,at,success,error,complete)`
  * Position - Retrieves Student Position with words and Achievements using id
    * Request - `GET http://192.168.72.87/api/v0/student/<id>/position/?words=<word>,<word>`
      * words = Only return positions for these words
      * focus = Only return position for this focus ('true'/'false')
    * Response - `200 Ok`
      * Object - keyed by word
        * word - The word with these achievments
          * achievments - Array of achievement ids
    * JavaScript - `api.student.position(id,words,focus,success,error,complete)`
      * words - Array of words to return data for
  * Learned - Indicates which words are learned according to plan
    * Request - `GET http://192.168.72.87/api/v0/student/<id>/learned/`
    * Response - `200 Ok`
      * Array - words that satisify the lesson plan
    * JavaScript - `api.student.learned(id,success,error,complete)`
  * Evaluate - Determine what a student should focus on next
    * Request - `POST http://192.168.72.87/api/v0/student/<id>/evaluate/`
    * Response - `202 Accepted`
      * blurred - The words the Student learned from this evaluation
      * focused - The words the Student is now focusing on from this evaluation
      * learned - All the words the Student has learned
      * focus - All the words the Student is focusing on 
    * JavaScript - `api.student.evaluate(id,success,error,complete)`
  * History - Retrieves Student History with words and Achievements using id
    * Request - `GET http://192.168.72.87/api/v0/student/<id>/history/?words=<word>,<word>&achievements=<achievement>,<achievement>`
      * words = Only return history for these words
      * achievements - Only show history for these achievements (by id)
      * from - Only show history from this date (YYYY-MM-DD)
      * to - Only show history to this date (YYYY-MM-DD)
    * Response - `200 Ok`
      * Array - ordered by at descending
        * word 
        * achievement (id)
        * held - Whether the Achieveent was attained or yielded
        * at - Date and time 
    * JavaScript - `api.student.history(id,words[],achievements[],held,from,to,success,error,complete)`
  * Chart - Retrieves data for making a chart
    * Request - `GET http://192.168.72.87/api/v0/student/<id>/chart/?by=<by>&focus=<focus>&words=<word>,<word>&achievements=<achievement_id>,<achievement_id>&from=<from>&to=<to>`
      * by - What to group by (shows last status for that period, uses previous period if no change)
        * date - Group by Date
        * week - Group by week, starting on Monday
        * month - Group by month
      * focus - Only chart progress for words currently being focused on ('true'/'false')
      * words - Only chart progress for these words
      * achievements - Only Only chart progress for these achievements (by id)
      * from - Only Only chart progress from this date (YYYY-MM-DD)
      * to - Only Only chart progress to this date (YYYY-MM-DD - Exclusive, up to, not including this date)
    * Response - `200 Ok`
      * Object - If date range is specified, data will the filled in. Zeroes previous, last values after.
        * words - Array - The words found matching the query
        * times - Array - Times of the data in the proper order as strings.
        * data - Array of Objects - The data to graph, index the same as times
          * achievement - The Achievement id of the data
          * totals - The totals for this achievement at the end of this time perioud
    * JavaScript - `api.student.chart(id,by,focus,words[],achievements[],held,from,to,success,error,complete)`
  * Delete - Deletes a Student
    * Request - `DELETE http://192.168.72.87/api/v0/student/<id>/`
    * Response - `200 Ok`
    * JavaScript - `api.student.delete(id,success,error,complete)`
* audio - Get the audio for a word
  * Request - `POST http://192.168.72.87/api/v0/audio/<word>/`
    * word - Word to get sound for
  * Response - `200 OK`
    * mp3 - A link for the mp3 file 
    * ogg - A link for the ogg file
  * Response - `503 SERVICE UNAVAILABLE` - If anything goes, no account, etc.
    * detail - Audio unavailable
  * JavaScript - `api.audio(word,success,error,complete)`

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

## Pronunciation

Without the a Forvo account, the audio RESTful and JavaScript tests fail in parts.  I may add something to say "not covered" or something instead. 

## RESTful API

```bash
cd ~/src/server/hundoword_django/
./coverage.sh
```

This creates a test database and executes calls again it, not the main database.  It creates/destroys the database before/after after bank of tests, not every test, because that would be slow.

It'll also generate a nice coverage report as the name implies. 

## JavaScript API

Go to `http://192.168.72.87/test/api/v0/javascript/` and wait.  You might want to get a sandwich. 

This uses the existing database, but puts prefixes of 'api-js-test-' before all Users, Achievements, and Lessons. It creates/destroys these Users, Achievements, and Lessons before/after every test and it's slow.  

The reason for this is the JavaScript API supports and even encourages asynchronous usage. It's hard to test creates, checks, updates, deletes, in a single bank of tests if things are asynchronous. 

IMPORTANT: If you've used the API through the browser and then run the JavaScript API tests, you'll get a ton of errors.  You have to compeltely close the browser and reopen it for the tests to work. I know it's stupid but that's BasicAuth for ya. 
