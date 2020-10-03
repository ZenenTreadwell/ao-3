# update
sudo apt update -yqqq 2>/dev/null
sudo apt autoremove -yqqq
echo apt update complete

# upgrade
sudo apt upgrade -yqqq
echo apt upgrade complete

sudo apt install -y git wget sqlite3 zlib1g-dev libtool autoconf automake autotools-dev libgmp-dev libsqlite3-dev python python3 python3-mako libsodium-dev build-essential fakeroot devscripts libevent-dev libssl-dev
