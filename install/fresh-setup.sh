echo 'ao install script to be run within clean Ubuntu 20.04.2.0 64 bit OS'
echo 'Initializing package updates and upgrades'

echo ''
echo 'Execution initialization time'
date
echo ''

sudo apt update -y
sudo apt upgrade -y

echo 'Installing apt build stuff'
sudo apt install -y git wget tor sqlite3 zlib1g-dev libtool-bin autoconf autoconf-archive automake autotools-dev \
libgmp-dev libsqlite3-dev python python3 python3-mako libsodium-dev build-essential pkg-config libev-dev \
libcurl4-gnutls-dev libssl-dev fakeroot devscripts

echo 'Installing node'
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
source ~/.bashrc
nvm install stable
source ~/.bashrc

echo 'Installing bitcoind'
wget https://bitcoincore.org/bin/bitcoin-core-22.0/bitcoin-22.0-x86_64-linux-gnu.tar.gz
tar xf bitcoin-22.0-x86_64-linux-gnu.tar.gz
sudo cp bitcoin-22.0/bin/* /usr/local/bin/

echo 'Installing lightningd'
git clone https://github.com/ElementsProject/lightning.git lightning
cd lightning
git checkout v0.10.2
./configure
sudo make
sudo make install
cd ..

echo 'Installing clboss'
git clone https://github.com/ZmnSCPxj/clboss.git clboss
cd clboss
git checkout 0.11B
mkdir m4
autoreconf -i
./configure
make
sudo make install
cd ..

# echo ' '
# echo 'Installing ao-3'
# git clone 'https://github.com/AutonomousOrganization/ao-3.git' ao-3
# cd ao-3
# npm install
# npm run build
# npm run checkconfig

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

echo 'Lightning Node Installed Start via two terminals: '
echo '  bitcoind'
echo '  lightningd'
echo 'Can Proceed to AO-3 setup: '
echo '  git clone https://github.com/AutonomousOrganization/ao-3'
echo '  cd ao-3'
echo '  npm install'
echo '  npm run checkconfig'
echo '  npm build'
echo '  npm start'
