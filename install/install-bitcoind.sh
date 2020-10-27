
if [ $(bitcoin-cli --version 2>/dev/null | grep -c "v0") -eq 1 ]
then
	 echo bitcoin already installed
else
    wget https://bitcoincore.org/bin/bitcoin-core-0.20.1/bitcoin-0.20.1-x86_64-linux-gnu.tar.gz
    tar xf bitcoin-0.20.1-x86_64-linux-gnu.tar.gz
    sudo cp bitcoin-0.20.1/bin/* /usr/local/bin/
