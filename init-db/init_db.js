const MongoClient = require('mongodb').MongoClient

MongoClient.connect('mongodb://root:secret@localhost:27017', {
    useUnifiedTopology: true
  },
  function(err, db) {
    if (err) console.log('Connect to MongoDB failed', err)
    console.log('connected to MongoDB!')
    database = db.db('webshop')
    database.dropCollection('user', function(err, delOK) {
      console.log('Collection user deleted')
      console.log('Insert user')
      database.collection('user').insertOne({
        name: 'TestUser',
        email: 'tu@gmail.com',
        password: 'pass'
      })
    })
    database.dropCollection('article', function(err, delOK) {
      console.log('Collection article deleted')
      console.log('Insert articles')
      database.collection('article').insertMany([{
        name: 'Headset',
        price: 99.90
      }, {
        name: 'Camera',
        price: 45.95
      }, {
        name: 'Monitor',
        price: 129
      }, {
        name: 'Keyboard',
        price: 85.80
      }, {
        name: 'Mouse',
        price: 67.25
      }, {
        name: 'Laptop',
        price: 850
      }, {
        name: 'Speaker',
        price: 51.45
      }, {
        name: 'TV',
        price: 625.68
      }, {
        name: 'Mousepad',
        price: 12.99
      }, {
        name: 'Chair',
        price: 130.24
      }])
    })
    database.dropCollection('order', function(err, delOK) {
      console.log('Collection order deleted')
    })
  })
