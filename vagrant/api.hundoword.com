Listen 8000

NameVirtualHost *:8000

<VirtualHost *:8000>

    WSGIPassAuthorization On
    WSGIDaemonProcess learning threads=5 python-path=/home/vagrant/src/server/hundoword_django/:/home/vagrant/src/
    WSGIScriptAlias / /home/vagrant/src/server/hundoword_django/hundoword_django/wsgi.py

    <Directory /home/vagrant/src/server/hundoword_django/hundoword_django/>
        WSGIProcessGroup learning
        WSGIApplicationGroup %{GLOBAL}
        Order deny,allow
        Allow from all
    </Directory>

</VirtualHost>