#!/usr/bin/env bash

rsync -azvh -P *.html *.js *.json *.css *.ico *.php chars /var/www/self/
