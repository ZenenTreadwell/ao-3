#!/bin/bash
# Bare Metal Alchemist, 2022 git://zenen.space/Alchemy

RED="\e[0;31m"
GREEN="\e[0;32m"
BOLD="\e[1m"
ITALIC="\e[3m"
ULINE="\e[4m"
RESET="\e[0m"


say() {
    printf "%b\n" "${1}"
}

if [ "$EUID" -eq 0 ]; then
    say "${RED}Woah there!${RESET} running this script as a superuser."
    say "That might cause some issues with permissions. Run this script as your default user (without sudo) and I'll ask you when I need superuser permissions"
    exit 1
fi

ask_for() { 
    if [ ${#} -eq 0 ]; then
        say "To use this command, you need to pass the variable you want,"
        say "and then add as string of text to ask for it if you want. Example:\n"
        say "ask_for RESPONSE \"Could you give me a RESPONSE please?\""
        say ""
        say "Afterwards, you'll be able to use \$RESPONSE as a variable,"
        say "and ${ITALIC}say \$RESPONSE${RESET} will respond with your entry"
        return 0
    fi

    if [ -n "${2}" ]; then
        printf "%b" "${2}"
    fi

    read ${1}
}

check_for() {
    command -v "$1" >/dev/null
}

install_if_needed() {
    for package in "$@" # $@ means "all the arguments you passed 
    do
        case $DISTRO in
            "debian")
                if [ -z $(check_for $package) ]; then
                    say "installing $package"
                    sudo apt install -y $package
                else
                    say "$package already installed!"
                fi
                ;;
            "arch")
                if pacman -Qi $package &>/dev/null; then
                    say "$package already installed!"
                else
                    say "installing $package"
                    sudo pacman -S $package --noconfirm --needed
                fi
                ;;
            "fedora")
                if [ -z $(check_for $package) ]; then
                    say "installing $package"
                    sudo dnf install -y $package
                else
                    say "$package already installed!"
                fi
                ;;
        esac
    done
}

say ""
say "${GREEN}${ULINE}System Basics${RESET}"
if [ -n "$ISA" ]; then
	if [ -n "$DISTRO" ]; then
	       if [ -n "$UPDATED" ]; then
		       say "Nothing to do!"
	       fi
	fi
fi

if [ -z $ISA ]; then
    ISA=$(uname -m)
    if [ $ISA = 'x86_64' ]; then
        say "Ayyy you got yourself an ${GREEN}x86${RESET} processor, cool"
    elif [ $ISA = 'armv7l' ]; then
        say "I see you rockin an ${GREEN}ARM${RESET} processor, neato"
    fi
fi

if [ -z $DISTRO ]; then
    if [ -f "/etc/debian_version" ]; then
        DISTRO="debian"
        say "${GREEN}Debian${RESET}, Ubuntu, or Raspbian OS detected."
    elif [ -f "/etc/arch-release" ]; then
        DISTRO="arch"
        say "${GREEN}Arch or Manjaro-based${RESET} OS detected."
    elif [ -f "/etc/fedora-release" ]; then
        DISTRO="fedora"
        say "${GREEN}Fedora${RESET} detected as the Operating System"
    else
        say "I don't know ${RED}what OS you're running${RESET}! Cancelling this operation."
        exit 1
    fi
fi

if [ -z "$UPDATED" ]; then
    say ""
    say "Updating the repositories..."
    say "(you'll probably need to input ${GREEN}your 'sudo' password${RESET} here)"
    case $DISTRO in
        "debian")
            sudo apt update
            sudo apt autoremove
            sudo apt upgrade
            sudo apt install build-essential
            ;;
        "arch")
            sudo pacman -Syu --noconfirm
            sudo pacman -S base-devel --noconfirm
            ;;
        "fedora")
            sudo dnf update
            sudo dnf upgrade
            ;;
    esac
fi

locate_torrc() {
	sudo rm /usr/local/etc/tor/torrc 
	sudo rm /etc/tor/torrc
    mkdir -p ${HOME}/.tor 
    touch ${HOME}/.tor/torrc 
    TORRCPATH="${HOME}/.tor/torrc"
    say "Your torrc is located at ${GREEN}${TORRCPATH}${RESET}"
}

configure_tor() {
    locate_torrc
    say "${GREEN}Existing torrc:${RESET}"
    echo ""
    cat $TORRCPATH | grep '^[^#]'
    echo ""
    say "Would you like to reset it?: ${GREEN}(y/n)${RESET} "
    read torrc_reset
    case $torrc_reset in
        "Y" | "y")
            cp torrc-template tmp_torrc
            sed -i "s#USER#${USER}#g" tmp_torrc
            sed -i "s#HOME#${HOME}#g" tmp_torrc
            mv tmp_torrc $TORRCPATH
            say "${GREEN}Torrc file reset!${RESET}"
            ;;
        '*')
            echo "Okay, we'll leave it as is."
            ;;
    esac
    echo ""
    say "Tor configuration ${GREEN}complete!${RESET}"
}


set_node_to() {
    if check_for nvm; then
        nvm install $1
        nvm alias default $1
        nvm use default
    else
        echo "nvm not available, something went wrong..."
    fi
}

install_nvm() {
    say "${BOLD}Installing Node Version Manager${RESET}"
	curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
	export NVM_DIR="$HOME/.nvm"
	[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
	[[ -r $NVM_DIR/bash_completion ]] && \. $NVM_DIR/bash_completion
	nvm --version
}

# ------------------- Systemd / Services -------------------

build_service_from_template() {
    SERVICE=$1
    shift
    echo ""
    if [ -f ./services/${SERVICE}.service ]; then
        echo "Creating $SERVICE.service..."
        SERVICE_FILE=/etc/systemd/system/${SERVICE}.service
        if [ -f "$SERVICE_FILE" ]; then
            say "${GREEN} Existing ${SERVICE} autostart service filei:${RESET}"
            cat $SERVICE_FILE
            say "Would you like to recreate it? ${GREEN}(y/n)${RESET} "
            read reset
            case $reset in
                "Y" | "y")
                    sudo rm $SERVICE_FILE
                    ;;
                "N" | "n")
                    say "Okay, we'll leave it as is."
                    ;;
            esac
        fi

        if [ ! -f "$SERVICE_FILE" ]; then
            sudo cp ./services/${SERVICE}.service $SERVICE_FILE
            sudo sed -i "s#USER#${USER}#g" $SERVICE_FILE
            sudo sed -i "s#HOME#${HOME}#g" $SERVICE_FILE
            for keyval; do
                KEY=$(echo $keyval | cut -d'=' -f 1)
                VAL=$(echo $keyval | cut -d'=' -f 2)
                echo "Substituting $KEY for $VAL"
                sudo sed -i "s#$KEY#$VAL#g" $SERVICE_FILE
            done
            activate_service $SERVICE
        fi
    else
        echo "No service template available for $SERVICE"
    fi
}

activate_service() {
    SERVICE=$1
    SERVICE_FILE=/etc/systemd/system/${SERVICE}.service
    if [ -f "$SERVICE_FILE" ]; then
        say "Enabling and starting ${GREEN}${SERVICE}${RESET}"
        sudo systemctl enable ${SERVICE}
        sudo systemctl restart ${SERVICE}
    fi
}

install_bitcoin() {
    say "${BOLD}Installing Bitcoin Core${RESET}"
    if [ ! -e 🜍/bitcoin-22.0* ]; then
        wget https://bitcoincore.org/bin/bitcoin-core-22.0/bitcoin-22.0.tar.gz -P 🜍/
    fi
    install_if_needed boost
    tar -xvf 🜍/bitcoin-22.0.tar.gz
    sleep 1
    pushd bitcoin-22.0
    chmod +x autogen.sh
    ./autogen.sh
    ./configure --disable-wallet
    make 
    sudo make install
    popd
}

install_lightning() {
    say "${BOLD}Installing lightningd${RESET}"
    git clone https://github.com/ElementsProject/lightning.git ./lightning
    pushd ./lightning
    git checkout v0.10.2
    ./configure
    make
    sudo make install
    popd
}

install_clboss() {
    say "${BOLD}Installing clboss${RESET}"
    git clone https://github.com/ZmnSCPxj/clboss.git ./clboss
    pushd ./clboss
    git checkout master
    autoreconf -fi
    ./configure
    make
    sudo make install
    popd
}

configure_bitcoin() {
    mkdir -p $HOME/.bitcoin
    touch $HOME/.bitcoin/bitcoin.conf
    say "${GREEN}Existing bitcoin.conf${RESET}"
    cat $HOME/.bitcoin/bitcoin.conf
    say ""
    ask_for btc_reconf "Would you like to reset it? ${GREEN}(y/n)${RESET}: "
    case $btc_reconf in
        "y" | "Y")
            AUTHDEETS=$(python3 ./rpcauth.py ao)
            AUTHLINE=$(say "$AUTHDEETS" | sed '2q;d' )
            PASSLINE=$(say "$AUTHDEETS" | sed '4q;d' )
            cp sample_bitcoin.conf $HOME/.bitcoin/bitcoin.conf
            sed -i "s/BTC_LOGIN/${AUTHLINE}/" $HOME/.bitcoin/bitcoin.conf
            sed -Ei "s/bitcoinrpcpass=.+$//g"  $HOME/.ao/config
	        echo bitcoinrpcpass=$PASSLINE >> $HOME/.ao/config
            say 'Reset bitcoin configuration file'
            ask_for prune "Next question - would you like to operate bitcoin in pruned mode? ${GREEN}(y/n)${RESET}:"
            case $prune in
                y | Y)
                    echo prune=555 >> $HOME/.bitcoin/bitcoin.conf
                    ;;
                *)
                    say "Creating archival node, good choice."
                    ;;
            esac
            ;;
        "n" | "N")
            say "Cool, we'll leave it as is then".
            ;;
    esac
}

configure_lightning() {
    mkdir -p $HOME/.lightning
    say "${GREEN}Existing lightning config${RESET}"
    cat $HOME/.lightning/config
    say ""
    ask_for ln_reconf "Would you like to reset it? ${GREEN}(y/n)${RESET}: "
    case $ln_reconf in
        "y" | "Y")
            cp sample_lightning_config $HOME/.lightning/config
            say "${GREEN}Reset lightning configuration file${RESET}"
            say ""
            ask_for clboss_enable "Would you like to use clboss to automatically open lightning channels? ${GREEN}(y/n)${RESET}: "
            case $clboss_enable in
                "y" | "Y")
                    if ! check_for clboss; then
                        install_clboss
                    fi
                    sed -i "s/#plugin/plugin/" $HOME/.lightning/config
                    sed -i "s/#log/log/" $HOME/.lightning/config
                    echo ""
                    say "${GREEN}clboss successfully configured!${RESET}"
                    ;;
                "n" | "N")
                    say ""
                    say "Sounds good. You might want to open some channels manually to participate in the network!".
                    ;;
            esac
            ;;
    esac
}

bitcoin_is_synced() {
    if [ -f "$HOME/.bitcoin/debug.log" ]; then
        progress=$(tac ~/.bitcoin/debug.log | grep -m1 UpdateTip | awk '{print $10}')
        case $progress in
            *"=1"*)
                say "Bitcoin is synced!"
                return 0
                ;;
            *)
                say "Bitcoin is not synced yet"
                return 1
                ;;
        esac
    else
        say "Not sure where your bitcoin log is!"
        return 2
    fi
}

clear
echo ''
echo '       d8888  .d88888b.       8888888                   888             888 888                  '
echo '      d88888 d88P" "Y88b        888                     888             888 888                  '
echo '     d88P888 888     888        888                     888             888 888                  '
echo '    d88P 888 888     888        888   88888b.  .d8888b  888888  8888b.  888 888  .d88b.  888d888 '
echo '   d88P  888 888     888        888   888 "88b 88K      888        "88b 888 888 d8P  Y8b 888P"   '
echo '  d88P   888 888     888        888   888  888 "Y8888b. 888    .d888888 888 888 88888888 888     '
echo ' d8888888888 Y88b. .d88P        888   888  888      X88 Y88b.  888  888 888 888 Y8b.     888     '
echo 'd88P     888  "Y88888P"       8888888 888  888  88888P"  "Y888 "Y888888 888 888  "Y8888  888     '
echo ''

# ------------------- Step 1 - Baseline Setup -------------------
sleep 2
if [ "$EUID" -eq 0 ]; then
    say "${RED}Woah there!${RESET} Seems you're running this script as a superuser."
    echo ""
    echo "That might cause some issues with permissions and whatnot. Run this script as your default user (without sudo) and I'll ask you when I need superuser permissions"
    echo ""
    exit 1
fi

say "Making sure we've got the basics "
say "(you'll probably need to input ${GREEN}your 'sudo' password${RESET} here)"
case $DISTRO in
    "debian")
        # Note -- I'm not sure if these are all needed but I'm not in the mood to check
        install_if_needed git wget sqlite3 zlib1g-dev libtool-bin autoconf autoconf-archive automake autotools-dev \
        libgmp-dev libsqlite3-dev python python3 python3-mako libsodium-dev build-essential pkg-config libev-dev \
        libcurl4-gnutls-dev libssl-dev fakeroot devscripts libboost-all-dev curl tor make qrencode
        ;;
    "arch")
        if [[ ! $(pacman -Qg base-devel) ]]; then
            sudo pacman -S base-devel --noconfirm
        fi
        install_if_needed wget python gmp sqlite3 autoconf-archive pkgconf libev \
            python-mako python-pip net-tools zlib libsodium gettext nginx curl tor make qrencode
        ;;
    "fedora")
        install_if_needed git wget tor sqlite3 autoconf autoconf-archive automake \
        python python3 python3-mako pkg-config fakeroot devscripts curl make qrencode
        ;;
esac
echo ""
# ------------------- Step 2 - AO Environment Setup -------------------
if ! check_for nvm; then
    install_nvm
else
    say "${GREEN}Node${RESET} already installed!"
fi

say "Setting Node to ${GREEN}v16.13.0${RESET} for compatibility"
set_node_to v16.13.0

say "${BOLD}Installing Bitcoin Ecosystem${RESET}"
    echo ""

if ! check_for bitcoind; then
    say "Building bitcoind from source... might take a while!"
    install_bitcoin
fi

if ! check_for lightningd; then
    say "Building lightningd from source... here we go again"
    install_lightning
fi

configure_bitcoin
configure_lightning
configure_tor

# ------------------- Step 3 - AO Installation -------------------
say "${BOLD}Configuring AO Core${RESET}\n"
mkdir -p $HOME/.ao
touch $HOME/.ao/config
say "Installing ${GREEN}ao-3${RESET}"
git pull origin master
npm install
npm run build
cat ~/.ao/key >> ~/.ao/keybackups
node createPrivateKey.js > ~/.ao/key
# ------------------- Step 7 - Systemd Setup -------------------

say "\n${BOLD}Alright, almost there!${RESET} Now we just need to set up the system daemons for Tor, Bitcoin, Lightning, and the AO so that everything opens on startup."


# Creating the .tor directory
mkdir -p $HOME/.tor
sudo chown $USER $HOME/.tor
sudo chgrp $USER $HOME/.tor
sudo chmod 770 $HOME/.tor

build_service_from_template tor "TORRCPATH=$TORRCPATH" "TORPATH=`which tor`"
build_service_from_template bitcoin "BITCOIND=`which bitcoind`"
build_service_from_template lightning "LIGHTNINGD=`which lightningd`"
build_service_from_template ao "NODE=`which node`" "AO=`pwd`/../src/server/app.js" 

# ------------------- Step 10 - Spark Wallet -------------------
say " "
ask_for sparky "Would you like to setup spark wallet serverr? ${GREEN}(y/n)${RESET}: "
case $sparky in
    "y" | "Y")
        ask_for sparkyname "Enter your spark wallet login name: "
        ask_for sparkypass "Enter your spark wallet password."
        mkdir -p $HOME/.spark-wallet
        echo "login=$sparkyname:$sparkypass" > $HOME/.spark-wallet/config
        npm install -g spark-wallet
        say "The above onion wallet address:"
        say "On iOS: ${BOLD}https://apps.apple.com/us/app/onion-browser/id519296448${RESET}"
        say "On android: ${BOLD}$https://play.google.com/store/apps/details?id=org.torproject.torbrowser${RESET}"
        say "Other: ${BOLD}https://www.torproject.org/download/${RESET}"
        build_service_from_template spark "SPARKBIN=`which spark-wallet`"
        activate_service spark 
        sudo ln -s `which node` /usr/bin/node
        say "Oops spark wallet service doesnt work yet, you have to start manually: spark-wallet"
        say "${BOLD}Bookmark this spark wallet address:  ${RESET}"
        export PORT=9737; export ONESHOT=true; SPARKONION=`node ../src/server/torControl.js`
        ;;
esac


# ------------------- Step 9 - Health Check -------------------

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
case $sparky in
    "y" | "Y")
        echo ""
        echo Your Spark Wallet Onion: 
        qrencode -m 3 -t ANSIUTF8 $SPARKONION
    ;;
esac
echo ' '
echo Your AO Onion: 
export PORT=8003; export ONESHOT=true; qrencode -m 3 -t ANSIUTF8 `node ../src/server/torControl.js`
echo View it from same computer at http://localhost:8003
exit 0
