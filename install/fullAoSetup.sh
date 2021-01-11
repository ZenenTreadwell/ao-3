echo 'installing all, watch out'
./prepare-install.sh
./install-node.sh
./install-tor.sh
./configure-tor.sh
./install-bitcoind.sh
./install-clightning.sh
./create-config.sh
