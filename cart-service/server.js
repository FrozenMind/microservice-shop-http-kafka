let express = require('express')
let app = express()
let cors = require('cors')
const MongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID

let serviceName = 'Cart-Service'
let port = 61782
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
  console.log(`Ping ${serviceName}`);
  res.json({
    service: serviceName,
    status: 'alive'
  })
})

app.post('/cart/:userid', (req, res) => {
  let userId = req.params.userid
  let articleId = req.body.articleId
  let size = req.body.size
  console.log('Add articleId', articleId, 'size', size, 'to cart of userid', userId)
  database.collection('user').find({
    _id: ObjectID(userId)
  }).toArray((err, data) => {
    if (err) {
      console.log('Could not connect database')
      res.status(500).json({
        error: 'Could not connect database'
      })
      return
    }
    if (data.length != 1) {
      res.status(404).json({
        error: 'Could not find user'
      })
      return
    }
    let user = data[0]
    if (!user.cart) {
      user.cart = []
    }
    let index = user.cart.findIndex(c => c.articleId == articleId && c.size == size)
    if (index >= 0) {
      console.log('Article already exists in cart at index', index, 'so increase amount');
      user.cart[index].amount += 1
    } else {
      console.log('Article does not exists in cart yet');
      user.cart.push({
        articleId: ObjectID(articleId),
        size: size,
        amount: 1
      })
    }
    database.collection('user').replaceOne({
      _id: user._id
    }, user)
    res.status(200).json({})
  })
})

app.get('/cart/:userid', (req, res) => {
  let userId = req.params.userid
  console.log('Get cart of userid', userId)
  database.collection('user').find({
    _id: ObjectID(userId)
  }).toArray((err, data) => {
    if (err) {
      console.log('Could not connect database')
      res.status(500).json({
        error: 'Could not connect database'
      })
      return
    }
    if (data.length != 1) {
      res.status(404).json({
        error: 'Could not find user'
      })
      return
    }
    let user = data[0]
    if (!user.cart || user.cart.length == 0) {
      res.status(404).json({
        error: 'User has no items in cart'
      })
      return
    }
    res.json(user.cart)
  })
})

app.listen(port, () => console.log(`${serviceName} started on localhost:${port}`))
