f [ $(tor --version  2>/dev/null | grep -c "0\.4\.0\.5") -eq 1 ];
then
	echo tor v0.4.0.5 already installed
else
	if [ $(dpkg-query -W -f='${Status}' build-essential 2>/dev/null | grep -c "ok installed") -eq 0 ];
	then
		sudo apt install -y build-essential
	fi

	if [ $(dpkg-query -W -f='${Status}' fakeroot 2>/dev/null | grep -c "ok installed") -eq 0 ];
	then
		sudo apt install -y fakeroot
	fi

	if [ $(dpkg-query -W -f='${Status}' devscripts 2>/dev/null | grep -c "ok installed") -eq 0 ];
	then
		sudo apt install -y devscripts
	fi

	if [ $(dpkg-query -W -f='${Status}' libevent-dev 2>/dev/null | grep -c "ok installed") -eq 0 ];
	then
		sudo apt install -y libevent-dev
	fi

	if [ $(dpkg-query -W -f='${Status}' libssl-dev 2>/dev/null | grep -c "ok installed") -eq 0 ];
	then
		sudo apt install -y libssl-dev
	fi

	cd ~
	wget https://dist.torproject.org/tor-0.4.0.5.tar.gz
	tor=true
	tar xf tor-0.4.0.5.tar.gz
	cd tor-0.4.0.5
	./configure
	make
	sudo make install
fi
