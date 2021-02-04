

if [ $(lightning-cli --version 2>/dev/null | grep -c "v0") -eq 1 ];
then
	echo c-lightning already installed
else
	git clone https://github.com/ElementsProject/lightning.git
	cd lightning
	git checkout v0.9.3
	./configure
	make
	sudo make install
	cd ..
fi


if [ $(clboss --version 2>/dev/null | grep -c "0") -eq 1 ];
then
	echo clboss already installed
else
	git clone https://github.com/ZmnSCPxj/clboss.git
	cd clboss
	git checkout v0.10
	./configure
	make
	sudo make install
	cd ..
fi
