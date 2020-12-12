let app = require('express')()
let cors = require('cors')

let serviceName = 'Login-Service'
let port = 61783

app.use(cors())

app.get('/ping', (req, res) => {
  console.log(`Ping ${serviceName}`);
  res.json({
    service: serviceName,
    status: 'alive'
  })
})
app.listen(port, () => console.log(`${serviceName} started on localhost:${port}`))
