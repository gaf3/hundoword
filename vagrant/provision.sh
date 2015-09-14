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

# Apache

sudo pip install requests
sudo apt-get install -y apache2
sudo apt-get install -y libapache2-mod-wsgi
sudo rm -f /etc/apache2/sites-enabled/000-default

# Learning

sudo pip install Django==1.8.4
sudo pip install djangorestframework==3.1

if sudo mysql -u root -e "show databases" | grep -w hundoword_django; then
    echo "Database hundoword_django exists"
else
    sudo -u vagrant /home/vagrant/src/server/hundoword_django/db.sh
fi

sudo cp /vagrant/www.hundoword.com /etc/apache2/sites-available/www.hundoword.com
sudo ln -s /etc/apache2/sites-available/www.hundoword.com /etc/apache2/sites-enabled/www.hundoword.com
sudo service apache2 restart