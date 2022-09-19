if [[ -z $1 ]]; 
    then DATABASE_URL=$(cat .env | grep 'TESTING' | sed 's/.*="\(.*\)"/\1/'); 
    else DATABASE_URL=$1;
fi;

echo $DATABASE_URL