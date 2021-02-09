# install node with nvm
source ~/.bashrc
source ~/.profile
if [ $(nvm --version 2>/dev/null | grep -c "0.") -eq 1 ];
then
		echo node version manager already installed
else
		wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
		source ~/.bashrc
		source ~/.profile
fi

nvm install stable
nvm use stable
