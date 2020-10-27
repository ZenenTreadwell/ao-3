

if [ $(lightning-cli --version 2>/dev/null | grep -c "v0") -eq 1 ];
then
	echo c-lightning already installed
else
	git clone https://github.com/ElementsProject/lightning.git
	cd lightning
	./configure
	make
	sudo make install
fi
