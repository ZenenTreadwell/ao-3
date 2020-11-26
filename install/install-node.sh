# install node with nvm
source ~/.bashrc
source ~/.profile
if [ $(nvm --version 2>/dev/null | grep -c "0.") -eq 1 ];
then
		echo node version manager (nvm) already installed
else
		wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
		source ~/.bashrc
		source ~/.profile
fi

if [ $(node --version 2>/dev/null | grep -c "v1") -eq 1 ];
then
		echo node already installed
else
		nvm install stable
		nvm use stable
fi
