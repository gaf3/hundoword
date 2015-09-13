hondoword
===========

The 100 (or so) words children first need to learn for reading.

# Requirements

* Vagrant 1.6.2
* Virtual Box 4.3.4

This may work with others versions, but I haven't tried any but these. 

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

## Admin 

Go to http://192.168.72.87/admin/ to get at the database directly.  This has accounts, words, etc. 

# Development

The default setup uses Apache and Apache WSGI uses daemons, so if you're making changes to code, you won't see those changes if you refresh the page.  

To spin up the development Django server, which automatically refresh with code changes, open a new terminal, vagrant ssh in and:

```bash
cd ~/src/server/hundoword_django/
./server.sh
```

Then go to http://192.168.72.87:8000/admin/ to use the development server.