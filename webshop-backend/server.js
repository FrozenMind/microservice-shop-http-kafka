let express = require('express')
let app = express()
let cors = require('cors')
const axios = require('axios')

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

app.put('/login', (req, res) => {
  console.log('Login user', req.body);
  axios.put('http://localhost:61783/login', {
      email: req.body.email,
      password: req.body.password
    })
    .then(response => {
      console.log('Login successful for user', response.data);
      res.json(response.data)
    })
    .catch(error => {
      console.log('Error while accessing login service', error.response.status);
      switch (error.response.status) {
        case 403:
          res.status(403).json({
            error: 'Username or Password is wrong'
          })
          break
        case 404:
          res.status(404).json({
            error: 'User not found'
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

app.get('/article', (req, res) => {
  let pricemin = req.params.pricemin
  let pricemax = req.params.pricemax
  console.log('Get Articles pricemin', pricemin, 'pricemax', pricemax)
  let param = '';
  if (pricemin) {
    param += `pricemin=${pricemin}`;
  }
  if (pricemax) {
    param += `pricemax=${pricemax}`;
  }
  axios.get(`http://localhost:61781/article?${param}`)
    .then(response => {
      console.log('Got', response.data.length, 'articles');
      res.json(response.data)
    })
    .catch(error => {
      console.log('Error while accessing articles', error.response.status);
      switch (error.response.status) {
        case 404:
          res.status(404).json({
            error: 'No articles found for request'
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

app.post('/cart/:userid', (req, res) => {
  let userId = req.params.userid
  let articleId = req.body.articleId
  let size = req.body.size
  console.log('Add articleid, ', articleId, 'size', size, 'to cart of userid', userId)
  axios.post(`http://localhost:61782/cart/${userId}`, {
      articleId: articleId,
      size: size
    })
    .then(response => {
      console.log('Added article to cart');
      res.json({})
    })
    .catch(error => {
      console.log('Error while adding article to cart', error.response.status);
      switch (error.response.status) {
        case 404:
          res.status(404).json({
            error: 'Could not find user or article'
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

app.get('/cart/:userid', (req, res) => {
  let userId = req.params.userid
  console.log('Get cart of userid', userId)
  axios.get(`http://localhost:61782/cart/${userId}`)
    .then(cartRes => {
      console.log('Got cart', cartRes.data);
      axios.post(`http://localhost:61781/article-by-id`, {
          articleIds: cartRes.data.map(a => a.articleId)
        })
        .then(articleRes => {
          console.log('Got articles', articleRes.data);
          let cart = []
          for (let c of cartRes.data) {
            for (let a of articleRes.data) {
              if (c.articleId == a._id) {
                cart.push({
                  name: a.name,
                  image: a.image,
                  articleId: c.articleId,
                  size: c.size,
                  amount: c.amount,
                  price: a.price,
                  totalPrice: a.price * c.amount
                })
                continue
              }
            }
          }
          res.json(cart)
        })
        .catch(error => {
          console.log('Error while getting articles', error.response.status);
          switch (error.response.status) {
            case 404:
              res.status(404).json({
                error: 'User has no items in cart yet'
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
    .catch(error => {
      console.log('Error while getting cart', error.response.status);
      switch (error.response.status) {
        case 404:
          res.status(404).json({
            error: 'User has no items in cart yet'
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

app.listen(port, () => console.log(`${serviceName} started on localhost:${port}`))
