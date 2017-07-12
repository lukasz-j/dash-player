#!/bin/bash

dest=$1
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DIR="${DIR}/../"

if [ -z $dest ]; then
    echo "Pass destination as argument"
    exit 1
fi

neededdirs="app/src/jsx_transformed app/src/css app/prod build"
tocopy="app/src/jsx_transformed/PlayerViewAll.min.js app/src/css/player.css app/prod/index.html build/dash-player.min.js"

rm -rf ${dest}/*

for neededdir in $neededdirs; do
    mkdir -p "${dest}/${neededdir}"
done

for filetocopy in $tocopy; do
    cp "${DIR}/${filetocopy}" "${dest}/${filetocopy}"
done
