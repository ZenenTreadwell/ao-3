echo 'installing all, may take some time'
./prepare-install.sh
./install-node.sh
./install-tor.sh
./configure-tor.sh
./install-bitcoind.sh
./install-clightning.sh
./create-config.sh
