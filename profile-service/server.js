let express = require('express')
let app = express()
let cors = require('cors')
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID

let serviceName = 'Profile-Service'
let port = 61785
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

app.get('/address/:userid', (req, res) => {
  let userId = req.params.userid
  console.log('Get Address of userid', userId)
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
      if (user.address) {
        res.json({
          address: user.address
        });
      } else {
        res.status(404).json({
          error: 'User has no address'
        });
      }
    } else {
      console.log('User not found')
      res.status(404).json({
        error: 'User not found'
      })
    }
  })
})

app.put('/address/:userid', (req, res) => {
  let userId = req.params.userid
  let address = req.body.address
  console.log('Save new address', address, 'for userid', userId)
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
      user.address = address
      database.collection('user').replaceOne({
        _id: user._id
      }, user)
      res.json({
        address: user.address
      })
    } else {
      console.log('User not found')
      res.status(404).json({
        error: 'User not found'
      })
    }
  })
})

app.get('/orders/:userid', (req, res) => {
  let userId = req.params.userid
  console.log('Get orders for userid', userId)
  database.collection('order').find({
    userId: ObjectID(userId)
  }).toArray((err, data) => {
    if (err) {
      console.log('Could not connect database')
      res.status(500).json({
        error: 'Could not connect database'
      })
    } else if (data.length == 0) {
      console.log('User has no orders yet')
      res.status(404).json({
        error: 'User has no orders yet'
      })
    } else {
      console.log('Order found for user', data)
      res.json(data)
    }
  })
})

app.listen(port, () => console.log(`${serviceName} started on localhost:${port}`))
