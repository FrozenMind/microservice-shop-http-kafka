let express = require('express')
let app = express()
let cors = require('cors')

let serviceName = 'Webshop-Backend'
let port = 61780

app.use(cors())
app.use(express.json())

app.get('/ping', (req, res) => {
  console.log(`Ping ${serviceName}`);
  res.json({
    service: serviceName,
    status: 'alive'
  })
})
app.listen(port, () => console.log(`${serviceName} started on localhost:${port}`))
