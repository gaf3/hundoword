#!/usr/bin/env bash

# Base

sudo apt-get update
sudo apt-get install -y tree
sudo apt-get install -y git
sudo apt-get install -y gcc make build-essential python-dev 
sudo apt-get install -y python-pip
sudo pip install coverage

# MySQL

sudo debconf-set-selections <<< "mysql-server-5.5 mysql-server/root_password password vagrant"
sudo debconf-set-selections <<< "mysql-server-5.5 mysql-server/root_password_again password vagrant"
sudo apt-get install -y mysql-server-5.5
sudo mysql -u root -pvagrant -e "SET PASSWORD FOR 'root'@'localhost' = PASSWORD('')" 2>/dev/null

sudo apt-get install -y libmysqlclient-dev
sudo pip install mysqlclient

# API

sudo pip install pytz
sudo pip install requests==2.5.3
sudo pip install Django==1.8.4
sudo pip install jsonfield
sudo pip install djangorestframework==3.1

if sudo mysql -u root -e "show databases" | grep -w hundoword_django; then
    echo "Database hundoword_django exists"
else
    sudo -u vagrant /vagrant/db.sh
fi

sudo apt-get install -y apache2
sudo apt-get install -y libapache2-mod-wsgi
sudo service apache2 stop
sudo rm -f /etc/apache2/sites-enabled/000-default
sudo cp -f /vagrant/ports.conf /etc/apache2/ports.conf
sudo cp /vagrant/api.hundoword.com /etc/apache2/sites-available/api.hundoword.com
sudo ln -s /etc/apache2/sites-available/api.hundoword.com /etc/apache2/sites-enabled/api.hundoword.com
sudo -u vagrant cp /vagrant/settings.py /home/vagrant/src/server/hundoword_django/hundoword_django/settings.py
sudo service apache2 restart

# WWW

sudo apt-get install -y nginx
sudo cp /vagrant/www.hundoword.com /etc/nginx/sites-available/www.hundoword.com
sudo ln -s /etc/nginx/sites-available/www.hundoword.com /etc/nginx/sites-enabled/www.hundoword.com
sudo service nginx restart