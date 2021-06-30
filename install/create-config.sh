
if  test -f $HOME/.bitcoin/bitcoin.conf; then
    echo 'bitcoin.conf exists'
else
    cp ./sample_bitcoin.conf $HOME/.bitcoin/bitcoin.conf
    echo 'created sample bitcoin config'
fi

if  test -f $HOME/.lightning/config; then
    echo 'lightning config exists'
else
    cp ./sample_lightning_config $HOME/.lightning/config
    echo 'created sample lightning config'
fi

if test -d $HOME/.ao; then
    echo 'default data dir exists'
else
    mkdir $HOME/.ao
fi

if  test -f $HOME/.ao/key; then
    echo 'ao privkey exists'
else
    node ../manage/createPrivateKey.js >> $HOME/.ao/key
    echo 'created ao privkey'
fi


TORRCPATH='/usr/local/etc/tor/torrc'
if [ ! -d "/usr/local/etc/tor" ];
then
		sudo mkdir -p /usr/local/etc/tor
fi

if [ ! -f $TORRCPATH ];
then
		wget https://raw.githubusercontent.com/torproject/tor/master/src/config/torrc.sample.in
		sudo mv torrc.sample.in $TORRCPATH
fi

if [ $(cat $TORRCPATH | grep -c "HiddenServiceDir /var/lib/tor/ao") -eq 0 ];
then
		echo "HiddenServiceDir /var/lib/tor/ao" | sudo tee -a $TORRCPATH 1>/dev/null 2>&1
fi

if [ $(cat $TORRCPATH | grep -c "HiddenServicePort 80 127\.0\.0\.1:8003") -eq 0 ];
then
		echo "HiddenServicePort 80 127.0.0.1:8003" | sudo tee -a $TORRCPATH 1>/dev/null 2>&1
fi

if [ ! -d "/var/lib/tor" ];
then
		sudo mkdir -p /var/lib/tor
fi

if [ ! -d "/var/lib/tor/ao" ];
then
		sudo mkdir -p /var/lib/tor/ao
fi

sudo chown -R $USER:$USER /var/lib/tor
sudo chmod -R 700 /var/lib/tor

echo 'external ao address'
cat /var/lib/tor/ao/hostname

AUTHDEETS=$(python3 ./rpcauth.py ao)
AUTHLINE=$(echo $AUTHDEETS | grep -o rpcauth=ao:[^[:space:]]*[[:space:]])
PASSLINE=$(echo $AUTHDEETS | grep -o [^[:space:]]*\$)
echo $AUTHLINE >> $HOME/.bitcoin/bitcoin.conf

echo "module.exports = {openAo: true, bitcoind: { username: 'ao', password: '"$PASSLINE"'}, sqlite3: {file: '"$HOME"/.ao/database.sqlite3'}, tor: { hostname: '"`cat /var/lib/tor/ao/hostname`"'}, clightning: {dir: '"$HOME"/.lightning/bitcoin'}, bitcoinAverage: {pub: '',secret: ''}, privateKey: '"$HOME"/.ao/key'}" > ../configuration.js
