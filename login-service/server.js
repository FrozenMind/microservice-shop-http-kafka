let express = require('express')
let app = express()
let cors = require('cors')
const MongoClient = require('mongodb').MongoClient;

let serviceName = 'Login-Service'
let port = 61783
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

app.put('/login', (req, res) => {
  let email = req.body.email
  let pass = req.body.password
  console.log('Login email:', email, 'password:', pass)
  database.collection('user').find({
    email: email,
    password: pass
  }).toArray((err, data) => {
    if (err) {
      console.log('Could not connect database')
      res.status(500).json({
        error: 'Could not connect database'
      })
    } else if (data.length == 1) {
      console.log('Successful login')
      res.json({
        userid: data[0]._id,
        name: data[0].name
      })
    } else {
      console.log('Invalid username or password')
      res.status(403).json({
        error: 'invalid username or password'
      })
    }
  })
})

app.listen(port, () => console.log(`${serviceName} started on localhost:${port}`))
