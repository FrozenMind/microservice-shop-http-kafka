let app = require('express')()
let cors = require('cors')

let serviceName = 'Article-Service'
let port = 61781

app.use(cors())

app.get('/ping', (req, res) => {
  console.log('Ping article-service');
  res.json({
    service: serviceName,
    status: 'alive'
  })
})
app.listen(port, () => console.log(`${serviceName} started on localhost:${port}`))
