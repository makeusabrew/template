# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box = "ubuntu/trusty64"

  config.vm.network "private_network", ip: "192.168.50.5"

  config.vm.synced_folder ".", "/vagrant", type: "nfs"

  config.vm.provision :shell, inline: $script, privileged: false, keep_color: true
end

$script = <<SCRIPT
sudo apt-get update -q

export DEBIAN_FRONTEND="noninteractive"
wget http://dev.mysql.com/get/mysql-apt-config_0.7.3-1_all.deb
sudo -E bash -c 'dpkg -i mysql-apt-config_0.7.3-1_all.deb'
sudo apt-get update

sudo debconf-set-selections <<< 'mysql-community-server mysql-community-server/root-pass password template'
sudo debconf-set-selections <<< 'mysql-community-server mysql-community-server/re-root-pass password template'
sudo debconf-set-selections <<< 'mysql-community-server mysql-community-server/data-dir boolean false'

sudo apt-get -y install mysql-server

sudo add-apt-repository ppa:nginx/stable
sudo apt-get update

sudo apt-get install -y software-properties-common python build-essential git ruby gcc-4.8 g++-4.8 language-pack-en

sudo apt-get -y install redis-server nginx

wget https://nodejs.org/download/release/v6.5.0/node-v6.5.0-linux-x64.tar.xz
tar xf node-v6.5.0-linux-x64.tar.xz
cd node-v6.5.0-linux-x64
sudo cp bin/* /usr/bin
sudo ln -sf /home/vagrant/node-v6.5.0-linux-x64/lib/node_modules/npm/bin/npm-cli.js /usr/bin/npm

sudo npm install -g node-inspector pm2
sudo chown -R vagrant:vagrant /home/vagrant/.npm

cd /vagrant
npm install
cd -

sudo rm -rf /etc/nginx/sites-enabled
sudo ln -s /vagrant/env/nginx/build/sites-enabled /etc/nginx/sites-enabled
sudo service nginx restart

mysql -uroot -ptemplate -e 'CREATE DATABASE template;'
mysql -uroot -ptemplate template < /vagrant/test/fixture/schema.sql

pm2 start /vagrant/env/pm2/build/vagrant.json
sudo pm2 startup ubuntu -u vagrant

SCRIPT
