#:bin/sh
node article-service/server.js &
node cart-service/server.js &
node login-service/server.js &
node payment-service/server.js &
node profile-service/server.js &
node webshop-backend/server.js &
