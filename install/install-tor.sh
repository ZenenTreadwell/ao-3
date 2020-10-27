if [ $(tor --version  2>/dev/null | grep -c "0\.4\.0\.5") -eq 1 ];
then
	echo tor v0.4.0.5 already installed
else
	wget https://dist.torproject.org/tor-0.4.0.5.tar.gz
	tar xf tor-0.4.0.5.tar.gz
	cd tor-0.4.0.5
	./configure
	make
	sudo make install
fi
