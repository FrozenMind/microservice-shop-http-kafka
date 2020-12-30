let express = require('express')
let app = express()
let cors = require('cors')
const axios = require('axios')
const Kafka = require('kafka-node')
let WebSocketServer = require('websocket').server;
let http = require('http');
const MongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID
const Transform = require('stream').Transform

let serviceName = 'Webshop-Backend'
let port = 61780
let socketPort = 61779
let database

// kafka
const client = new Kafka.KafkaClient({ kafkaHost: 'localhost:9092' })
const producer = new Kafka.Producer(client)
const ConsumerGroup = Kafka.ConsumerGroup

// websocket
let server = http.createServer(function (request, response) { });
server.listen(socketPort, function () { });
wsServer = new WebSocketServer({
  httpServer: server
});
let connections = []

// mongoDB connection
MongoClient.connect('mongodb://root:secret@localhost:27017', {
  useUnifiedTopology: true
},
  function (err, db) {
    if (err) console.log(`${serviceName} failed to connect to MongoDB`, err)
    console.log(`${serviceName} connected to MongoDB!`)
    database = db.db("webshop")
    initKafkaConsumerThatNeedDbAccess()
  })


// config for ping endpoint
app.use(cors())
app.use(express.json())

app.get('/ping', (req, res) => {
  console.log(`Ping ${serviceName}`);
  res.json({
    service: serviceName,
    status: 'alive'
  })
})


// WebSocket endpoint
wsServer.on('request', function (request) {
  console.log('websocket connected')
  let connection = request.accept(null, request.origin)
  connections.push(connection)

  // This is the most important callback for us, we'll handle
  // all messages from users here.
  connection.on('message', function (message) {
    if (message.type != 'utf8') {
      console.log('Non utf8 message', message)
      return
    }
    let data = JSON.parse(message.utf8Data);
    console.log('web socket message', data)
    switch (data.command) {
      case 'login':
        pushDataToKafka('req.login', {
          email: data.body.email,
          password: data.body.password
        })
        break
      default:
        console.log('Received unknown command', data.command);
    }

    // connection.sendUTF(JSON.stringify({ key: "value" }))
  });

  connection.on('close', function (connection) {
    console.log('websocket connection closed')
  });
});
















app.get('/article', (req, res) => {
  let pricemin = parseInt(req.query.pricemin) || 0
  let pricemax = parseInt(req.query.pricemax) || 10000
  console.log('Get Articles pricemin', pricemin, 'pricemax', pricemax)

  let articleConsumer = new Kafka.ConsumerGroupStream(
    {
      kafkaHost: 'localhost:9092',
      groupId: 'webshop-backend-stream',
      sessionTimeout: 15000,
      protocol: ['roundrobin'],
      encoding: 'utf8',
      fromOffset: 'earliest',
      commitOffsetsOnFirstJoin: true,
      outOfRangeOffset: 'earliest', // default
    },
    'articles')

  let articles = []
  const messageTransform = new Transform({
    objectMode: true,
    decodeStrings: true,
    transform(message, encoding, callback) {
      let article = JSON.parse(message.value)
      if ((!pricemin || article.price >= pricemin) && (!pricemax || article.price <= pricemax)) {
        articles.push(article)
      }
      if (message.offset == message.highWaterOffset - 1) {
        console.log('Read all articles. Return', articles.length, 'articles to client');
        res.json(articles)
        articleConsumer.close()
      }
      callback(null, null)
    }
  })

  articleConsumer.pipe(messageTransform)
})

app.post('/cart/:userid', (req, res) => {
  let userId = req.params.userid
  let articleId = req.body.articleId
  console.log('Add articleid', articleId, 'to cart of userid', userId)
  pushDataToKafka('req.cart', { command: 'update', body: { userId: userId, articleId: articleId } })
  res.json({})
})

app.put('/cart/:userid/:articleid', (req, res) => {
  let userId = req.params.userid
  let articleId = req.params.articleid
  let amount = parseInt(req.body.amount)
  console.log('Change amount of articleid', articleId, 'of userid', userId, 'to', amount)
  pushDataToKafka('req.cart', { command: 'update', body: { userId: userId, articleId: articleId, amount: amount } })
  res.json({ newAmount: amount })
})

app.delete('/cart/:userid/:articleid', (req, res) => {
  let userId = req.params.userid
  let articleId = req.params.articleid
  console.log('Remove articleid', articleId, 'from cart of userid', userId)
  pushDataToKafka('req.cart', { command: 'delete', body: { userId: userId, articleId: articleId } })
  res.json({})
})

app.get('/cart/:userid', (req, res) => {
  let userId = req.params.userid
  console.log('Get cart of userid', userId)
  database.collection('backend-cart').find({
    userId: userId
  }).toArray((err, userCart) => {
    if (err) {
      console.log('Could not connect database')
      res.status(500).json({
        error: 'Could not connect database'
      })
      return
    }
    console.log('got user cart', userCart);
    let cart = userCart[0].cart
    let ids = cart.map(a => a.articleId)
    console.log('search articles for ids', ids);

    let articleConsumer = new Kafka.ConsumerGroupStream(
      {
        kafkaHost: 'localhost:9092',
        groupId: 'webshop-backend-stream',
        sessionTimeout: 15000,
        protocol: ['roundrobin'],
        encoding: 'utf8',
        fromOffset: 'earliest',
        commitOffsetsOnFirstJoin: true,
        outOfRangeOffset: 'earliest', // default
      },
      'articles')

    let articles = []
    const messageTransform = new Transform({
      objectMode: true,
      decodeStrings: true,
      transform(message, encoding, callback) {
        let article = JSON.parse(message.value)
        if (ids.indexOf(article._id) != -1) {
          articles.push(article)
        }
        if (message.offset == message.highWaterOffset - 1) {
          console.log('Read all articles. Return', articles.length, 'articles to client');
          let fullCart = []
          for (let c of cart) {
            for (let a of articles) {
              if (c.articleId == a._id) {
                fullCart.push({
                  name: a.name,
                  articleId: c.articleId,
                  amount: c.amount,
                  price: a.price
                })
                continue
              }
            }
          }
          res.json(fullCart)
          articleConsumer.close()
        }
        callback(null, null)
      }
    })

    articleConsumer.pipe(messageTransform)
  })
})


app.get('/cart/total-price/:userid', (req, res) => {
  let userId = req.params.userid
  console.log('Get total price of userid', userId)
  database.collection('backend-cart').find({
    userId: userId
  }).toArray((err, userCart) => {
    if (err) {
      console.log('Could not connect database')
      res.status(500).json({
        error: 'Could not connect database'
      })
      return
    }
    console.log('got user cart', userCart);
    let cart = userCart[0].cart
    let ids = cart.map(c => c.articleId)

    let articleConsumer = new Kafka.ConsumerGroupStream(
      {
        kafkaHost: 'localhost:9092',
        groupId: 'webshop-backend-stream',
        sessionTimeout: 15000,
        protocol: ['roundrobin'],
        encoding: 'utf8',
        fromOffset: 'earliest',
        commitOffsetsOnFirstJoin: true,
        outOfRangeOffset: 'earliest', // default
      },
      'articles')

    let articles = []
    const messageTransform = new Transform({
      objectMode: true,
      decodeStrings: true,
      transform(message, encoding, callback) {
        let article = JSON.parse(message.value)
        if (ids.indexOf(article._id) != -1) {
          articles.push(article)
        }
        if (message.offset == message.highWaterOffset - 1) {
          console.log('Read all articles. Return', articles.length, 'articles to client');
          let totalPrice = 0
          cart.forEach(c => {
            articles.forEach(a => {
              if (a._id == c.articleId) {
                totalPrice += c.amount * a.price
              }
            })
          })
          console.log('Total price is', totalPrice);
          res.json({ totalPrice: totalPrice })
          articleConsumer.close()
        }
        callback(null, null)
      }
    })

    articleConsumer.pipe(messageTransform)
  })
})

app.get('/address/:userid', (req, res) => {
  let userId = req.params.userid
  console.log('Get Address of userid', userId)
  axios.get(`http://localhost:61785/address/${userId}`)
    .then(addRes => {
      console.log('Got article')
      res.json(addRes.data)
    })
    .catch(error => {
      console.log('Error while getting address', error.response.status);
      switch (error.response.status) {
        case 404:
          res.status(404).json({
            error: 'User has no address'
          })
          break
        default:
          res.status(error.status).json({
            error: 'Unknown error'
          })
          break
      }
    })
})

app.put('/address/:userid', (req, res) => {
  let userId = req.params.userid
  let address = req.body.address
  console.log('Save new address', address, 'for userid', userId)
  axios.put(`http://localhost:61785/address/${userId}`, {
    address: address
  })
    .then(addRes => {
      console.log('Address saved')
      res.json(addRes.data)
    })
    .catch(error => {
      console.log('Error while saving address', error.response.status);
      switch (error.response.status) {
        case 404:
          res.status(404).json({
            error: 'User does not exist'
          })
          break
        default:
          res.status(error.status).json({
            error: 'Unknown error'
          })
          break
      }
    });
})


app.put('/pay/:userid', (req, res) => {
  let userId = req.params.userid
  console.log('Pay for userid', userId)
  axios.put(`http://localhost:61784/pay/${userId}`, {})
    .then(addRes => {
      console.log('Payed successful')
      res.json(addRes.data)
    })
    .catch(error => {
      console.log('Error while paying', error.response.status);
      switch (error.response.status) {
        case 404:
          res.status(404).json({
            error: 'User has no cart to pay for'
          })
          break
        default:
          res.status(error.status).json({
            error: 'Unknown error'
          })
          break
      }
    })
})

app.get('/orders/:userid', (req, res) => {
  let userId = req.params.userid
  console.log('Get orders for userid', userId)
  axios.get(`http://localhost:61785/orders/${userId}`, {})
    .then(addRes => {
      console.log('Orders received')
      res.json(addRes.data)
    })
    .catch(error => {
      console.log('Error while paying', error.response.status);
      switch (error.response.status) {
        case 404:
          res.status(404).json({
            error: 'User has no orders yet'
          })
          break
        default:
          res.status(error.status).json({
            error: 'Unknown error'
          })
          break
      }
    })
})

// kafka consumer res.login
try {
  let loginConsumer = new Kafka.ConsumerGroup(
    {
      kafkaHost: 'localhost:9092',
      groupId: 'webshop-backend',
      sessionTimeout: 15000,
      protocol: ['roundrobin'],
      encoding: 'utf8',
      fromOffset: 'latest',
      commitOffsetsOnFirstJoin: false,
      outOfRangeOffset: 'latest', // default
    },
    'res.login')

  loginConsumer.on('message', async function (msgstring) {
    let msg = JSON.parse(msgstring.value)
    console.log('login message', msg)
    if (msg.error) {
      console.log('Failed to login', msg.error)
    } else {
      console.log('login successful', msg)
    }
    connections.forEach(conn => conn.sendUTF(JSON.stringify({ command: 'login', body: msg })))
  })
  loginConsumer.on('error', function (error) {
    //  handle error 
    console.log('consumer error res.login', error)
  })
}
catch (error) {
  console.log('error while building res.login consumer', error)
}

function initKafkaConsumerThatNeedDbAccess() {
  console.log('Init Kafka consumer that need DB access');

  // kafka consumer res.cart
  try {
    let cartConsumer = new Kafka.ConsumerGroup(
      {
        kafkaHost: 'localhost:9092',
        groupId: 'webshop-backend',
        sessionTimeout: 15000,
        protocol: ['roundrobin'],
        encoding: 'utf8',
        fromOffset: 'earliest',
        commitOffsetsOnFirstJoin: false,
        outOfRangeOffset: 'earliest', // default
      },
      'res.cart')

    cartConsumer.on('message', async function (msgstring) {
      let msg = JSON.parse(msgstring.value)
      console.log('received new cart', msg)
      let query = { userId: msg.userId }
      database.collection('backend-cart').find(query).toArray((err, data) => {
        if (err) {
          console.log('Failed to connect to DB');
          return
        }
        if (data && data.length == 1) {
          console.log('Update cart');
          database.collection('backend-cart').replaceOne(query, msg)
        } else {
          console.log('Insert new cart');
          database.collection('backend-cart').insertOne(query, msg)
        }
      })
    })
    cartConsumer.on('error', function (error) {
      //  handle error
      console.log('consumer error res.cart', error)
    })
  }
  catch (error) {
    console.log('error while building res.cart consumer', error)
  }
}


// produce message to res.login
function pushDataToKafka(topic, dataToPush) {
  try {
    let payloadToKafkaTopic = [{ topic: topic, messages: JSON.stringify(dataToPush) }]
    console.log('Try to send', payloadToKafkaTopic)
    producer.send(payloadToKafkaTopic, function (err, data) {
      if (err) {
        console.log('error on send', err)
      } else {
        console.log('send data', data)
      }
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
