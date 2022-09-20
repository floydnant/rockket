if [[ -z $TESTING_DATABASE_URL ]];
    then db=$(cat .env | grep 'TESTING' | sed 's/.*="\(.*\)"/\1/');
       if [[ -z $db ]]; then echo 'TESTING_DATABASE_URL not specified' && exit 0
       fi
    else db=$TESTING_DATABASE_URL;
fi;

DATABASE_URL=$db npm run db:reset
echo '> Now running e2e tests' && echo "> jest $1" && echo ''
DATABASE_URL=$db jest $1