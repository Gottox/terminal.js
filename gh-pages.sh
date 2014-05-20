#! /bin/sh
#
# gh-pages.sh
# Copyright (C) 2014 Enno Boland <eb@s01.de>
#
# Distributed under terms of the MIT license.
#

cd "`which $0 | xargs dirname`" || exit $?
rev=`git rev-parse HEAD`

grunt clean || exit $?
git clone -b gh-pages . doc || exit $?
grunt clean doc || exit $?
git --work-tree doc commit -m "rebuild docs based on $rev"
#git pull doc
#grunt clean
