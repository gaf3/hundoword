#!/usr/bin/env bash

mysql -u root -e "CREATE DATABASE hundoword_django CHARACTER SET utf8;"
rm -rf /home/vagrant/src/server/hundoword_django/learning/migrations/
python /home/vagrant/src/server/hundoword_django/manage.py makemigrations learning --noinput
python /home/vagrant/src/server/hundoword_django/manage.py migrate --noinput
python /home/vagrant/src/server/hundoword_django/manage.py loaddata /home/vagrant/src/server/hundoword_django/vagrant_user.json
python /home/vagrant/src/server/hundoword_django/manage.py loaddata /home/vagrant/src/server/hundoword_django/achievements.json
