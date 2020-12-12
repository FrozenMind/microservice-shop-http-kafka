mongo admin -u root -p secret
use webshop
db.user.insert({name:"TestUser",email:"tu@gmail.com",password:"pass"})
db.article.insert({name:"shirt",price:24.90})
