#!/usr/bin/env bash

# Kill any already running

pkill -u vagrant -f runserver.*8000

# Exit on first error

set -e

# Basic server run

python manage.py runserver 0.0.0.0:8000
