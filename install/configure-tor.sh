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
