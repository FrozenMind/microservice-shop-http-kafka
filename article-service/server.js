let express = require('express')
let app = express()
let cors = require('cors')
const MongoClient = require('mongodb').MongoClient;

let serviceName = 'Article-Service'
let port = 61781
let database

MongoClient.connect('mongodb://root:secret@localhost:27017', {
    useUnifiedTopology: true
  },
  function(err, db) {
    if (err) console.log(`${serviceName} failed to connect to MongoDB`, err)
    console.log(`${serviceName} connected to MongoDB!`)
    database = db.db("webshop")
  })

app.use(cors())
app.use(express.json())

app.get('/ping', (req, res) => {
  console.log('Ping article-service')
  res.json({
    service: serviceName,
    status: 'alive'
  })
})

app.get('/article', (req, res) => {
  let pricemin = parseInt(req.query.pricemin) || 0
  let pricemax = parseInt(req.query.pricemax) || 10000

  let query = {
    price: {
      "$gte": pricemin,
      "$lte": pricemax
    },
  }
  console.log('Search article with query', query)
  database.collection('article').find(query).toArray((err, data) => {
    if (err) {
      console.log('Could not connect database')
      res.status(500).json({
        error: 'Could not connect database'
      })
    } else if (data.length == 0) {
      console.log('No articles found for request')
      res.status(404).json({
        error: 'No articles found for request'
      })
    } else {
      console.log(`Found ${data.length} articles`)
      res.json(data)
    }
  })
})

app.listen(port, () => console.log(`${serviceName} started on localhost:${port}`))
