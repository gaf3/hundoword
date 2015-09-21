server {

	server_name 127.0.0.1 192.168.72.87;

	sendfile off;

	listen   80; ## listen for ipv4; this line is default and implied

	root /home/vagrant/src/client/www/;

	location /api/javascript/ {
		root /home/vagrant/src/;
	}

	location /test/api/javascript/ {
		root /home/vagrant/src/;
	}

	location /admin/ {
		proxy_pass http://127.0.0.1:8000/admin/;
	}

	location /static/ {
		root /home/vagrant/src/server/hundoword_django/;
	}

	location /api/ {
		proxy_pass http://127.0.0.1:8000/learning/;
	}

}
