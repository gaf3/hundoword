<VirtualHost *:80>

    WSGIPassAuthorization On
    WSGIDaemonProcess learning threads=5 python-path=/home/vagrant/src/server/hundoword_django/:/home/vagrant/src/
    WSGIScriptAlias / /home/vagrant/src/server/hundoword_django/hundoword_django/wsgi.py

    <Directory /home/vagrant/src/server/hundoword_django/hundoword_django/>
        WSGIProcessGroup learning
        WSGIApplicationGroup %{GLOBAL}
        Order deny,allow
        Allow from all
    </Directory>

    Alias /static /home/vagrant/src/server/hundoword_django/static

    <Directory /home/vagrant/src/server/hundoword_django/static>
        # directives to effect the static directory
        Options +Indexes
    </Directory>

</VirtualHost>