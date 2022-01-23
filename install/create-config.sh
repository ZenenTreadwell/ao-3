
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
		sudo echo "ControlPort 9051" >> $TORRCPATH
    sudo echo "CookieAuthentication 1" >> $TORRCPATH
    sudo chmod 666 $TORRCPATH
fi

AUTHDEETS=$(python3 ./rpcauth.py ao)
AUTHLINE=$(echo $AUTHDEETS | grep -o rpcauth=ao:[^[:space:]]*[[:space:]])
PASSLINE=$(echo $AUTHDEETS | grep -o [^[:space:]]*\$)
echo $AUTHLINE >> $HOME/.bitcoin/bitcoin.conf

echo "module.exports = {openAo: true, bitcoind: { username: 'ao', password: '"$PASSLINE"'}, sqlite3: {file: '"$HOME"/.ao/database.sqlite3'}, hostnames: [], clightning: {dir: '"$HOME"/.lightning/bitcoin'}, bitcoinAverage: {pub: '',secret: ''}, privateKey: '"$HOME"/.ao/key'}" > ../configuration.js
