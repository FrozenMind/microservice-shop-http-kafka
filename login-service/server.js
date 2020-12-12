let app = require('express')()
let cors = require('cors')
const MongoClient = require('mongodb').MongoClient;

let serviceName = 'Login-Service'
let port = 61783

MongoClient.connect('mongodb://localhost:27017/webshop', {
  useUnifiedTopology: true
}, function(err, db) {
  if (err) console.log(`${serviceName} failed to connect to MongoDB`, err)
  console.log(`${serviceName} connected to MongoDB!`)
})

app.use(cors())

app.get('/ping', (req, res) => {
  console.log(`Ping ${serviceName}`);
  res.json({
    service: serviceName,
    status: 'alive'
  })
})
app.listen(port, () => console.log(`${serviceName} started on localhost:${port}`))
