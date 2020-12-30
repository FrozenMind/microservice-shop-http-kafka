let express = require('express')
let app = express()
let cors = require('cors')
const MongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID
const Kafka = require('kafka-node')

let serviceName = 'Cart-Service'
let port = 61782
let database

const client = new Kafka.KafkaClient({ kafkaHost: 'localhost:9092' })
const producer = new Kafka.Producer(client)

MongoClient.connect('mongodb://root:secret@localhost:27017', {
  useUnifiedTopology: true
},
  function (err, db) {
    if (err) console.log(`${serviceName} failed to connect to MongoDB`, err)
    console.log(`${serviceName} connected to MongoDB!`)
    database = db.db("webshop")
  })

app.use(cors())
app.use(express.json())

app.get('/ping', (req, res) => {
  console.log(`Ping ${serviceName}`);
  res.json({
    service: serviceName,
    status: 'alive'
  })
})

// kafka consumer req.cart
try {
  let loginConsumer = new Kafka.Consumer(
    client,
    [{ topic: 'req.cart' }],
    {
      autoCommit: true,
      fetchMaxWaitMs: 1000,
      fetchMaxBytes: 1024 * 1024,
      encoding: 'utf8',
      groupId: 'cart-service'
    }
  )
  loginConsumer.on('message', async function (msgstring) {
    let msg = JSON.parse(msgstring.value)
    console.log('request for cart', msg)
    let userId = msg.body.userId
    let articleId = msg.body.articleId
    let amount = msg.body.amount
    console.log('Change amount of articleid', articleId, 'of userid', userId, 'to', amount)
    database.collection('user').find({
      _id: ObjectID(userId)
    }).toArray((err, data) => {
      if (err) {
        console.log('Could not connect database')
        return
      }
      if (data.length != 1) {
        console.log('Could not find user')
        return
      }
      let user = data[0]
      if (!user.cart) {
        user.cart = []
      }
      let articleIndex = user.cart.findIndex(c => c.articleId == articleId)
      switch (msg.command) {
        case 'update':
          if (articleIndex == -1) {
            console.log('Add new article');
            user.cart.push({
              articleId: ObjectID(articleId),
              amount: amount || 1
            })
          } else {
            console.log('Update amount at index', articleIndex);
            user.cart[articleIndex].amount = user.cart[articleIndex].amount + (amount || 1)
          }
          break
        case 'delete':
          console.log('Remove article at index', articleIndex);
          if (articleIndex != -1) {
            user.cart.splice(articleIndex, 1)
          }
          break
      }
      database.collection('user').replaceOne({
        _id: user._id
      }, user)
      pushDataToKafka('res.cart', {userId: user._id, cart: user.cart})
    })
  })
  loginConsumer.on('error', function (error) {
    //  handle error 
    console.log('consumer error', error)
  })
}
catch (error) {
  console.log('error while building consumer', error)
}

function pushDataToKafka(topic, dataToPush) {
  try {
    let payloadToKafkaTopic = [{ topic: topic, messages: JSON.stringify(dataToPush) }]
    console.log('Try to send', payloadToKafkaTopic)
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

app.listen(port, () => console.log(`${serviceName} started on localhost:${port}`))
