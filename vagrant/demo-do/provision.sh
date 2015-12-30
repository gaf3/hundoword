#!/usr/bin/env bash

# Base

sudo apt-get update
sudo apt-get install -y tree git gcc make build-essential pwgen python-dev python-pip
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
    python /home/vagrant/src/server/hundoword_django/manage.py makemigrations learning --noinput
    python /home/vagrant/src/server/hundoword_django/manage.py migrate --noinput
else
    /vagrant/db.sh
fi

sudo apt-get install -y apache2 libapache2-mod-wsgi
sudo rm -f /etc/apache2/sites-enabled/000-default.conf
sudo cp -f /vagrant/ports.conf /etc/apache2/ports.conf
sudo cp /vagrant/api.conf /etc/apache2/sites-available/api.conf
sudo ln -sf /etc/apache2/sites-available/api.conf /etc/apache2/sites-enabled/api.conf
sed "s/<<<secret_key>>>/'`pwgen -N 7 -s | tr '\n' ' ' | sed -e 's/ //g'`'/" /vagrant/settings.py > /home/vagrant/src/server/hundoword_django/hundoword_django/settings.py
sudo chown -R www-data:www-data /home/vagrant/src/server/hundoword_django/
sudo service apache2 restart

# WWW

sudo apt-get install -y nginx
sudo rm -f /etc/nginx/sites-enabled/default
sudo cp /vagrant/www.conf /etc/nginx/sites-available/www.conf
sed "s/<<<ip>>>/`ifconfig eth0 | grep -oP 'inet addr:[0-9\\.]+' | grep -oP '[0-9\\.]+'`/g" /vagrant/www.conf > /etc/nginx/sites-available/www.conf
sudo ln -sf /etc/nginx/sites-available/www.conf /etc/nginx/sites-enabled/www.conf
if [ -d /etc/nginx/ssl/ ]; then 
    echo "Nginx ssl exists"
else
    sudo mkdir -p /etc/nginx/ssl/
    sudo openssl req -new -newkey rsa:4096 -days 365 -nodes -x509  -keyout /etc/nginx/ssl/nginx.key -out /etc/nginx/ssl/nginx.crt -subj "/C=US/ST=Learning/L=Present/O=Hundoword/CN=demo.hundoword.com"
fi
sudo service nginx restart
