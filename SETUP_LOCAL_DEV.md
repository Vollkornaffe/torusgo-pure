# How to setup local development environment on Ubuntu 16.04

## MySQL Setup
- get local server https://www.digitalocean.com/community/tutorials/how-to-install-mysql-on-ubuntu-16-04#step-2-%E2%80%94-configuring-mysql
- get client (sudo apt install mysql-client)

### create a test database in local server to connect to
- connect to running mysql server (mysql -u root -p)
- once connected type "CREATE DATABASE testDB \G" and hit enter
- close mysql client and run nodejs server (it should setup the rest)
