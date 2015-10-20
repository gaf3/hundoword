#!/usr/bin/env bash

# Exit on first error

# Run coverage, looking only at lib and report

if [ -n "$1" ]; then

    MODULE="learning.tests.test_Django.test_$1"

fi

coverage run --source=learning.models,learning.urls,learning.views --omit=*__init__* manage.py test $MODULE -v 2 
coverage report -m