
if [ $(bitcoind --version 2>/dev/null | grep -c "v0.21.0") -eq 1 ]
then
	 	echo bitcoind v0.21.0 already installed
else
		echo "installing bitcoind v0.21.0"
    wget https://bitcoincore.org/bin/bitcoin-core-0.21.0/bitcoin-0.21.0-x86_64-linux-gnu.tar.gz
    tar xf bitcoin-0.21.0-x86_64-linux-gnu.tar.gz
    sudo cp bitcoin-0.21.0/bin/* /usr/local/bin/
fi
