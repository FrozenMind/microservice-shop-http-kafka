let express = require('express')
let app = express()
let cors = require('cors')
const MongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID
const Kafka = require('kafka-node')

let serviceName = 'Article-Service'
let port = 61781
let database

const client = new Kafka.KafkaClient({ kafkaHost: 'localhost:9092' })
const producer = new Kafka.Producer(client)

MongoClient.connect('mongodb://root:secret@localhost:27017', {
    useUnifiedTopology: true
  },
  function(err, db) {
    if (err) console.log(`${serviceName} failed to connect to MongoDB`, err)
    console.log(`${serviceName} connected to MongoDB!`)
    database = db.db("webshop")
    // uncomment following line to publish all articles to kafka. check that topic is empty, otherwise there will be duplicates
    // publishArticlesToKafka()
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

function publishArticlesToKafka() {
  database.collection('article').find({}).toArray((err, data) => {
    if (err) {
      console.log('Could not connect database')
    } else if (data.length == 0) {
      console.log('No articles found for request')
    } else {
      console.log(`Found ${data.length} articles`)
      try {
        let stringData = []
        data.forEach(d => stringData.push(JSON.stringify(d)))
        let payloadconst client = new Kafka.KafkaClient({ kafkaHost: 'localhost:9092' })
        const producer = new Kafka.Producer(client)('Try to send', payloadToKafkaTopic)
          producer.send(payloadToKafkaTopic, function (err, data) {
            if(err) {
              console.log('error on send', err)
            }
            console.log('send data', data)
          })
    
          producer.on('error', function (err) {
            console.log('error while sending', err);
          })
      }
      catch (error) {
        console.log('error while building producer', error)
      }
    }
  })
}

app.listen(port, () => console.log(`${serviceName} started on localhost:${port}`))
