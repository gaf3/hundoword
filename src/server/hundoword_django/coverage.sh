#!/usr/bin/env bash

# Exit on first error

# Run coverage, looking only at lib and report

coverage run --source=learning.models,learning.urls,learning.views --omit=*__init__* manage.py test $1 -v 2 
coverage report -m