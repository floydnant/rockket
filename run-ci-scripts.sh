#!/bin/bash

dir=$1
cd $dir

npm run lint:fix
npm run build
npm run unit:ci
npm run e2e:ci

if [[ $dir == "client-v2" ]];
    then npm run comp:ci
fi;