echo 'ao install script to be run within clean Ubuntu 20.04.2.0 64 bit OS'
echo 'Initializing package updates and upgrades'

echo ''
echo 'Execution initialization time'
date
echo ''

sudo apt update -y
sudo apt upgrade -y

echo 'Installing git'
sudo apt install -y git

echo 'Installing wget'
sudo apt install -y wget

echo 'Installing nodejs'
sudo apt install -y nodejs

echo 'Installing npm'
sudo apt install -y npm

echo 'Installing tor'
sudo apt install -y tor

echo 'Installing sqlite3'
sudo apt install -y sqlite3

echo 'Installing zlib1g-dev'
sudo apt install -y zlib1g-dev

echo 'Installing libtool-bin'
sudo apt install -y libtool-bin

echo 'Installing autoconf'
sudo apt install -y autoconf

echo 'Installing autoconf-archive'
sudo apt install -y autoconf-archive

echo 'Installing automake'
sudo apt install -y automake

echo 'Installing autotools-dev'
sudo apt install -y autotools-dev

echo 'Installing libgmp-dev'
sudo apt install -y libgmp-dev

echo 'Installing libsqlite3-dev'
sudo apt install -y libsqlite3-dev

echo 'Installing python'
sudo apt install -y python

echo 'Installing python3'
sudo apt install -y python3

echo 'Installing python3-mako'
sudo apt install -y python3-mako

echo 'Installing libsodium-dev'
sudo apt install -y libsodium-dev

echo 'Installing build-essential'
sudo apt install -y build-essential

echo 'Installing pkg-config'
sudo apt install -y pkg-config

echo 'Installing libev-dev'
sudo apt install -y libev-dev

echo 'Installing libevent-dev'
sudo apt install -y libevent-dev

echo 'Installing libcurl4-gnutls-dev'
sudo apt install -y libcurl4-gnutls-dev

echo 'Installing libssl-dev'
sudo apt install -y libssl-dev

echo 'Installing fakeroot'
sudo apt install -y fakeroot

echo 'Installing devscripts'
sudo apt install -y devscripts

echo 'Installing bitcoind'
wget https://bitcoincore.org/bin/bitcoin-core-0.21.0/bitcoin-0.21.0-x86_64-linux-gnu.tar.gz
tar xf bitcoin-0.21.0-x86_64-linux-gnu.tar.gz
sudo cp bitcoin-0.21.0/bin/* /usr/local/bin/

echo 'Installing lightningd'
git clone https://github.com/ElementsProject/lightning.git lightning
cd lightning
git checkout v0.10.0
./configure
sudo make -R
sudo make install
cd ..

echo 'Installing clboss'
git clone https://github.com/ZmnSCPxj/clboss.git clboss
cd clboss
git checkout 0.11B
mkdir m4
autoreconf -i
./configure
sudo make -R
sudo make install
cd ..

echo ' '
echo 'Installing ao-3'
git clone 'https://github.com/AutonomousOrganization/ao-3.git' ao-3

echo ' '
echo ' '
echo '*********************************************************'
echo 'Version Information'
echo '*********************************************************'

echo ' '
echo 'make Version'
echo '*********************************************************'
make --version

echo ' '
echo 'node Version'
echo '*********************************************************'
node --version

echo ' '
echo 'sqlite3 Version'
echo '*********************************************************'
sqlite3 --version

echo ' '
echo 'tor Version'
echo '*********************************************************'
tor --version

echo ' '
echo 'bitcoind Version'
echo '*********************************************************'
bitcoind --version

echo ' '
echo 'lightningd Version'
echo '*********************************************************'
lightningd --version

echo ' '
echo 'clboss Version'
echo '*********************************************************'
clboss --version

echo ''
echo 'Execution completion'
date
echo ''

echo 'Execution Times'
