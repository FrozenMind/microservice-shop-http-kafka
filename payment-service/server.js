let express = require('express')
let app = express()
let cors = require('cors')
const MongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID
const Kafka = require('kafka-node')

let serviceName = 'Payment-Service'
let port = 61784
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
  let cartConsumer = new Kafka.ConsumerGroup(
    {
      kafkaHost: 'localhost:9092',
      groupId: 'payment-service',
      sessionTimeout: 15000,
      protocol: ['roundrobin'],
      encoding: 'utf8',
      fromOffset: 'latest',
      commitOffsetsOnFirstJoin: false,
      outOfRangeOffset: 'latest', // default
    },
    'pay')

  cartConsumer.on('message', async function (msgstring) {
    let msg = JSON.parse(msgstring.value)
    let userId = msg.userId
    console.log('request to pay for userid', userId)

    database.collection('user').find({
      _id: ObjectID(userId)
    }).toArray((err, data) => {
      if (err) {
        console.log('Could not connect database')
        res.status(500).json({
          error: 'Could not connect database'
        })
      } else if (data.length == 1) {
        console.log('User found')
        let user = data[0]
        let articleIds = []
        user.cart.forEach(c => articleIds.push(ObjectID(c.articleId)))
        database.collection('article').find({
          _id: {
            $in: articleIds
          }
        }).toArray((err, data) => {
          if (err) {
            console.log('Could not connect database')
            return
          } else {
            // save order
            let items = []
            data.forEach(article => {
              let index = user.cart.findIndex(c => c.articleId == article._id.toString())
              if (index == -1) {
                console.log('Did not find cart item for article')
              } else {
                items.push({
                  articleId: article._id,
                  name: article.name,
                  amount: user.cart[index].amount,
                  price: article.price
                })
              }
            })
            let totalPrice = 0
            items.forEach(it => totalPrice += it.price * it.amount)
            let order = {
              userId: user._id,
              name: user.name,
              timestamp: new Date(),
              items: items,
              address: user.address,
              totalPrice: totalPrice
            }
            console.log('Save order', order);
            database.collection('order').insertOne(order)

            // clear cart, after order saved
            database.collection('user').updateOne({
              _id: user._id
            }, {
              $set: {
                cart: []
              },
            }, user)

            pushDataToKafka('res.cart', {userId: userId, cart: []})
          }
        })
      } else {
        console.log('User not found')
      }
    })
  })

  cartConsumer.on('error', function (error) {
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
