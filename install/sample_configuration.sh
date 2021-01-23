AUTHDEETS=$(python3 ./rpcauth.py ao)
AUTHLINE=$(echo $AUTHDEETS | grep -o rpcauth=ao:[^[:space:]]*[[:space:]])
PASSLINE=$(echo $AUTHDEETS | grep -o [^[:space:]]*\$)
echo $AUTHLINE >> $HOME/.bitcoin/bitcoin.conf

echo "module.exports = {"
echo "openAo: true,"
echo "bitcoind: { username: 'ao', password: '"$PASSLINE"'},"
echo "sqlite3: {file: '"$HOME"/.ao/database.sqlite3'},"
echo "tor: { hostname: '"`cat /var/lib/tor/ao/hostname`"'},"
echo "clightning: {dir: '"$HOME"/.lightning/bitcoin'},"
echo "bitcoinAverage: {pub: '',secret: ''},"
echo "privateKey: '"$HOME"/.ao/key'"
echo "}"
