# microservice-shop-http-kafka
## Install
* Run `sh install.sh` to install all nodejs dependencies
## Run
* Run services with `sh run_services.sh`
* Run frontend with `cd webshop-frontend && ng serve`
* Run MongoDB and Kafka in Docker `docker-compose up -d`
* Init MongoDB data
  * Run `cd init-db` to go into init folder
  * Run `node init_db.js` to insert data
* Now you can login by using credentials username: __tu@gmail.com__, password: __pass__
## Stop Services
* Kill services by port with `sh kill_services.sh`
* Kill frontend in bash with __CTRL + C__
* Stop Docker container `docker-compose down`
## Port usage
| Name | Port |
| - | - |
| Webshop-Frontend | 4200 |
| Webshop-Backend | 61780 |
| Article-Service | 61781 |
| Cart-Service | 61782 |
| Login-Service | 61783 |
| Payment-Service | 61784 |
| Profile-Service | 61785 |
| - | - |
| MongoDB | 27017 |
| MongoDB Express | 8081 |
## Monitoring
* You can monitor the database by browsing http://localhost:8081/
