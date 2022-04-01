#!/bin/sh
# Bare Metal Alchemist, 2022 git://zenen.space/Alchemy

RED="\e[0;31m"
GREEN="\e[0;32m"
BLUE="\e[0;34m"
BOLD="\e[1m"
ITALIC="\e[3m"
ULINE="\e[4m"
RESET="\e[0m"

say() {
    printf "%b\n" "${1}"
}

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
if [ "$EUID" -eq 0 ]; then
    echo -e "${RED}Woah there!${RESET} Seems you're running this script as a superuser."
    echo ""
    echo "That might cause some issues with permissions and whatnot. Run this script as your default user (without sudo) and I'll ask you when I need superuser permissions"
    echo ""
    exit 1
fi


# This one installs utilities to your OS (If you need them!)
install_if_needed() {
    for package in "$@" # $@ means "all the arguments you passed 
    do
        case $DISTRO in
            "debian")
                # TODO Better installation detection than check_for
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
                # TODO Better installation detection than "check_for"
                if [ -z $(check_for $package) ]; then
                    say "installing $package"
                    sudo dnf install -y $package
                else
                    say "$package already installed!"
                fi
                ;;
            "mac")
                # TODO Better installation detection than "check_for"
                if [ -z $(check_for $package) ]; then
                    say "installing $package"
                    brew install $package
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
    elif [ $(uname | grep -c "Darwin") -eq 1 ]; then
        DISTRO="mac"
        say "${GREEN}MacOS${RESET} detected."
    else
        say "I don't know ${RED}what OS you're running${RESET}! Cancelling this operation."
        exit 1
    fi
fi

if [ -z "$UPDATED" ]; then
    say ""
    say "Updating the repositories..."
    say "(you'll probably need to input ${BLUE}your 'sudo' password${RESET} here)"
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
        "mac")
            install
            sudo brew update
            ;;
    esac
fi

say ""
say "${GREEN}${ULINE}Core Dependencies${RESET}"
install_if_needed git wget make

say ""
say "${BOLD}You're good to go!${RESET} Go ${BLUE}make something cool${RESET} :)"
say ""

locate_torrc() {
    if [ -n $TORRCPATH ]; then
        if [ -f $HOME/.tor/torrc ]; then
            TORRCPATH="${HOME}/.tor/torrc"
        elif [ -f /usr/local/etc/tor/torrc ]; then
            TORRCPATH='/usr/local/etc/tor/torrc'
        elif [ -f /etc/tor/torrc ]; then
            TORRCPATH='/etc/tor/torrc'
        else
            echo -e "${RED}Uh oh...${RESET} I couldn't figure out where your torrc file is. That might cause some issues"
            sleep 3
            echo "Anyways..."
            sleep 2
        fi
    fi

    echo -e "Your torrc is located at ${BLUE}${TORRCPATH}${RESET}"
}

configure_tor() {
    locate_torrc

    echo -e "Your existing torrc file has the following settings: "
    echo ""
    cat $TORRCPATH | grep '^[^#]'
    echo ""
    echo -en "Would you like to reset it?: ${BLUE}(y/n)${RESET} "
    read torrc_reset
    case $torrc_reset in
        "Y" | "y")
            cp torrc-template .
            sudo sed -i "s#USER#${USER}#g" torrc-template
            sudo sed -i "s#HOME#${HOME}#g" torrc-template
            sudo mv torrc-template $TORRCPATH
            echo -e "${GREEN}Torrc file reset!${RESET}"
            ;;
        '*')
            echo "Okay, we'll leave it as is."
            ;;
    esac
    echo ""

    echo -e "Tor configuration ${GREEN}complete!${RESET}"
}


set_node_to() {
    if check_for nvm; then
        if [ ! $(node -v) = $1 ]; then
            nvm install $1
            nvm alias default $1
            nvm use default
        fi
    else
        echo "nvm not available, something went wrong..."
    fi
}

install_nvm() {
    echo -e "${BOLD}Installing Node Version Manager${RESET}"
	curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
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
            echo "Seems like you've already installed ${SERVICE} here!"
            echo -en "Would you like to recreate it? ${BLUE}(y/n)${RESET} "
            read reset
            case $reset in
                "Y" | "y")
                    sudo rm $SERVICE_FILE
                    ;;
                "N" | "n")
                    echo "Okay, we'll leave it as is."
                    ;;
            esac
        fi

        if [ ! -f "$SERVICE_FILE" ]; then
            sudo cp ./services/${SERVICE}.service $SERVICE_FILE

            # Common template values
            sudo sed -i "s#USER#${USER}#g" $SERVICE_FILE
            sudo sed -i "s#HOME#${HOME}#g" $SERVICE_FILE
            for keyval; do
                KEY=$(echo $keyval | cut -d'=' -f 1)
                VAL=$(echo $keyval | cut -d'=' -f 2)

                echo "Substituting $KEY for $VAL"
                sudo sed -i "s#$KEY#$VAL#g" $SERVICE_FILE
            done
        fi
    else
        echo "No service template available for $SERVICE"
    fi
}

activate_service() {
    SERVICE=$1
    SERVICE_FILE=/etc/systemd/system/${SERVICE}.service
    if [ -f "$SERVICE_FILE" ]; then
        echo -e "Enabling and starting ${GREEN}${SERVICE}${RESET}"
        sudo systemctl enable ${SERVICE}
        sudo systemctl start ${SERVICE}
    fi
}

install_bitcoin() {
    say "${BOLD}Installing Bitcoin Core${RESET}"

    # We're building bitcoin from source here. It might be slower than
    # downloading the pre-built binaries but this is more reliable
    if [ ! -e 🜍/bitcoin-22.0* ]; then
        wget https://bitcoincore.org/bin/bitcoin-core-22.0/bitcoin-22.0.tar.gz -P 🜍/
    fi

    # This still relies on package management though
    install_if_needed boost

    tar -xvf 🜍/bitcoin-22.0.tar.gz
    sleep 1
    cd bitcoin-22.0
    chmod +x autogen.sh
    ./autogen.sh
    ./configure --disable-wallet
    make 
    sudo make install
    #rm -rf bitcoin-22.0
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
    #rm -rf lightning 
}

install_clboss() {
    say "${BOLD}Installing clboss${RESET}"
    git clone https://github.com/ZmnSCPxj/clboss.git ./clboss
    pushd ./clboss
    git checkout master
    mkdir -p m4
    autoreconf -fi
    ./configure
    make
    sudo make install
    popd
    #rm -rf clboss 
}

configure_bitcoin() {
    mkdir -p ~/.bitcoin

    AUTHDEETS=$(python3 ./rpcauth.py ao)
    AUTHLINE=$(say "$AUTHDEETS" | sed '2q;d' )
    PASSLINE=$(say "$AUTHDEETS" | sed '4q;d' )

    if  [ -f $HOME/.bitcoin/bitcoin.conf ]; then
        say "Looks like you already have a ${BLUE}bitcoin.conf${RESET} file!"
        say ""
        cat $HOME/.bitcoin/bitcoin.conf
        say ""
        ask_for btc_reconf "Would you like to reset it? ${BLUE}(y/n)${RESET}: "
        case $btc_reconf in
            "y" | "Y")
                cp sample_bitcoin.conf $HOME/.bitcoin/bitcoin.conf
                say 'Reset bitcoin configuration file'
                ;;
            "n" | "N")
                say "Cool, we'll leave it as is then".
                ;;
        esac
    else
        cp sample_bitcoin.conf $HOME/.bitcoin/bitcoin.conf
        say 'Created default bitcoin config'
    fi

    sed -i "s/BTC_LOGIN/${AUTHLINE}/" $HOME/.bitcoin/bitcoin.conf
    say ""

    ask_for prune "Next question - would you like to operate bitcoin in pruned mode? \
This reduces its file size from ~500GB to something more portable ${BLUE}(y/n)${RESET}: "
    say ""
    case $prune in
        y | Y)
            say "Let's ${GREEN}enable pruning${RESET} to keep the file size down, then."
            prune_size=0
            while [ "$prune_size" -lt 550 ]; do
                ask_for prune_size "How many Mb are you willing to put towards btc? Min 550: "
            done

            sed -i "s/txindex=1/prune=${prune_size}/" $HOME/.bitcoin/bitcoin.conf
            ;;
        *)
            say "Okay great! We'll leave the bitcoin config it as it is."
            ;;
    esac
}

configure_lightning() {
    mkdir -p $HOME/.lightning

    if  [ -f $HOME/.lightning/config ]; then
        say "Looks like you already have a ${BLUE}lightning config${RESET} file!"
        say ""
        cat $HOME/.lightning/config
        say ""
        ask_for ln_reconf "Would you like to reset it? ${BLUE}(y/n)${RESET}: "
        case $ln_reconf in
            "y" | "Y")
                cp sample_lightning_config $HOME/.lightning/config
                say "${GREEN}Reset lightning configuration file${RESET}"
                ;;
            "n" | "N")
                say "Cool, we'll leave it as is then".
                ;;
        esac
    else
        cp sample_lightning_config $HOME/.lightning/config
        say "${GREEN}Created default lightning config${RESET}"
    fi

    say ""
    ask_for clboss_enable "Would you like to use clboss to automatically open lightning channels? ${BLUE}(y/n)${RESET}: "
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

GOLD=1
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

echo -e "${BOLD}Hiya!${RESET} We're going to get you set up with your very own Autonomous Engine."
echo ""
echo -e "This script is designed to ask you just enough questions to keep you involved in the process,"
echo -e "while making it as easy as possible for you to get it going." 
echo ""
echo -e "${BLUE}press enter to continue${RESET}"
read

if [ "$EUID" -eq 0 ]; then
    echo -e "${RED}Woah there!${RESET} Seems you're running this script as a superuser."
    echo ""
    echo "That might cause some issues with permissions and whatnot. Run this script as your default user (without sudo) and I'll ask you when I need superuser permissions"
    echo ""
    exit 1
fi

echo -e "Making sure we've got the basics "
echo -e "(you'll probably need to input ${BLUE}your 'sudo' password${RESET} here)"
case $DISTRO in
    "debian")
        # Note -- I'm not sure if these are all needed but I'm not in the mood to check
        install_if_needed git wget sqlite3 zlib1g-dev libtool-bin autoconf autoconf-archive automake autotools-dev \
        libgmp-dev libsqlite3-dev python python3 python3-mako libsodium-dev build-essential pkg-config libev-dev \
        libcurl4-gnutls-dev libssl-dev fakeroot devscripts
        ;;
    "arch")
        if [[ ! $(pacman -Qg base-devel) ]]; then
            sudo pacman -S base-devel --noconfirm
        fi

        install_if_needed wget python gmp sqlite3 autoconf-archive pkgconf libev \
            python-mako python-pip net-tools zlib libsodium gettext nginx
        ;;
    "mac")
        # install_if_needed better-computer
        ;;
    "fedora")
        install_if_needed git wget tor sqlite3 autoconf autoconf-archive automake \
        python python3 python3-mako pkg-config fakeroot devscripts
        ;;
esac
echo ""
# ------------------- Step 2 - AO Environment Setup -------------------

if [ -z $NVM_DIR ]; then
    install_nvm
	source ./iron
else
    echo -e "${BLUE}Node${RESET} already installed!"
fi

echo -e "Setting Node to ${BLUE}v16.13.0${RESET} for compatibility"
set_node_to v16.13.0
echo ""
echo -e "${GREEN}Done!${RESET}"
echo ""

echo -e "${BOLD}Installing Bitcoin Ecosystem${RESET}"
    echo ""

if ! check_for bitcoind; then
    echo -e "Building bitcoind from source... might take a while!"
    install_bitcoin
fi

if ! check_for lightningd; then
    echo -e "Building lightningd from source... here we go again"
    install_lightning
fi

configure_bitcoin
configure_lightning
echo ''

install_if_needed tor
configure_tor

# ------------------- Step 3 - AO Installation -------------------

echo -e "${BOLD}Configuring AO Core${RESET}\n"
mkdir -p $HOME/.ao
echo -e "Installing ${BLUE}ao-3${RESET}"
npm install
npm run build
cat ~/.ao/key >> ~/.ao/keybackups
node createPrivateKey.js > ~/.ao/key
# ------------------- Step 7 - Systemd Setup -------------------

echo -e "\n${BOLD}Alright, almost there!${RESET} Now we just need to set up the system daemons for Tor, Bitcoin, Lightning, and the AO so that everything opens on startup."

build_service_from_template tor "TORRCPATH=$TORRCPATH" "TORPATH=`which tor`"

# Creating the .tor directory
sudo mkdir -p $HOME/.tor
sudo chown tor $HOME/.tor
sudo chgrp $USER $HOME/.tor
sudo chmod 770 $HOME/.tor

activate_service tor

echo ""
build_service_from_template bitcoin "BITCOIND=`which bitcoind`"
activate_service bitcoin

echo ""
build_service_from_template lightning "LIGHTNINGD=`which lightningd`"
activate_service lightning

echo ""
build_service_from_template ao "NODE=`which node`" "AO=$AO" 
activate_service ao

# ------------------- Step 9 - Health Check -------------------

 echo '*********************************************************'
 echo -e "*                  ${BOLD}Version Information${RESET}                  *"
 echo '*********************************************************'

 echo ' '
 echo 'make Version'
 echo '*********************************************************'
 make --version

 echo ' '
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
echo ""
echo -e "$BOLD\nOkay, well that's everything!${RESET}\n\nAs long as everything worked properly, \
you should be ready to continue your journey\ntowards autonomy by opening ${BLUE}$ACCESS_POINT${RESET} in your browser."

exit 0
