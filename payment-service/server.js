let express = require('express')
let app = express()
let cors = require('cors')
const MongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID

let serviceName = 'Payment-Service'
let port = 61784
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

app.put('/pay/:userid', (req, res) => {
  let userId = req.params.userid
  console.log('Pay for userid', userId)

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
          res.status(500).json({
            error: 'Could not connect database'
          })
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

          res.json({
            paied: true
          })
        }
      })
    } else {
      console.log('User not found')
      res.status(404).json({
        error: 'User not found'
      })
    }
  })
})

app.listen(port, () => console.log(`${serviceName} started on localhost:${port}`))
