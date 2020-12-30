let express = require('express')
let app = express()
let cors = require('cors')
const MongoClient = require('mongodb').MongoClient
const Kafka = require('kafka-node')

let serviceName = 'Login-Service'
let port = 61783

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
  console.log(`Ping ${serviceName}`)
  res.json({
    service: serviceName,
    status: 'alive'
  })
})


// kafka consumer
try {
  let consumer = new Kafka.Consumer(
    client,
    [{ topic: 'req.login' }],
    {
      autoCommit: true,
      fetchMaxWaitMs: 1000,
      fetchMaxBytes: 1024 * 1024,
      encoding: 'utf8',
      groupId: 'login-service-2'
    }
  )
  consumer.on('message', async function (msgstring) {
    let msg = JSON.parse(msgstring.value)
    database.collection('user').find({
      email: msg.email,
      password: msg.password
    }).toArray((err, data) => {
      if (err) {
        console.log('Could not connect database')
        pushDataToKafka({
          error: {
            status: 500,
            message: 'Could not connect database'
          }
        })
      } else if (data.length == 1) {
        console.log('Successful login')
        let amount = 0
        if (data[0].cart) {
          data[0].cart.forEach(c => amount += c.amount)
        }
        pushDataToKafka({
          userid: data[0]._id,
          name: data[0].name,
          email: data[0].email,
          cartAmount: amount
        })
      } else {
        console.log('Invalid username or password')
        pushDataToKafka({
          error: {
            status: 403,
            message: 'invalid username or password'
          }
        })
      }
    })
  })
  consumer.on('error', function (error) {
    //  handle error 
    console.log('consumer error', error)
  })
}
catch (error) {
  console.log('error while building consumer', error)
}


// produce message to res.login
function pushDataToKafka(dataToPush) {
  try {
    let payloadToKafkaTopic = [{ topic: 'res.login', messages: JSON.stringify(dataToPush) }]
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
