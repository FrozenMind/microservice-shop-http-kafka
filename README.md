# microservice-shop-http-kafka
## Install
* Run `sh install.sh` to install all nodejs dependencies
## Run
* Run services with `sh run_services.sh`
* Run frontend with `cd webshop-frontend && ng serve`
* Run MongoDB and Kafka in Docker `docker-compose up -d`
* Init MongoDB data
  * Run `docker ps` to get container id
  * Login to docker `sudo docker exec -it <container-id> bash`
  * Run `sh init_db.sh` to insert data
  * Exit Docker by pressing __CTRL + D__
* Now you can login by using credentials `tu@gmail.com` `pass`
## Stop Services
* Kill services by port with `sh kill_services.sh`
* Kill frontend in bash with __CTRL + C__
## Services
| Name | Port |
| - | - |
| Webshop-Frontend | 4200 |
| Webshop-Backend | 61780 |
| Article-Service | 61781 |
| Cart-Service | 61782 |
| Login-Service | 61783 |
| Payment-Service | 61784 |
| Profile-Service | 61785 |
