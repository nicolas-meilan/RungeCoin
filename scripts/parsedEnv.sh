# export all .env variables. Allow strings with space.
echo $(sed -e 's/=/=\"/' './.env' | sed -e 's/$/\"/' | sed -e 's/^/export /')