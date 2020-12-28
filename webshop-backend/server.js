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
  let pricemin = parseInt(req.query.pricemin)
  let pricemax = parseInt(req.query.pricemax)
  console.log('Get Articles pricemin', pricemin, 'pricemax', pricemax)
  let param = '';
  if (pricemin) {
    param += `pricemin=${pricemin}&`;
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
  console.log('Add articleid', articleId, 'to cart of userid', userId)
  axios.post(`http://localhost:61782/cart/${userId}`, {
      articleId: articleId
    })
    .then(response => {
      console.log('Added article to cart');
      res.json(response.data)
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
                  amount: c.amount,
                  price: a.price
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

app.put('/cart/:userid/:articleid', (req, res) => {
  let userId = req.params.userid
  let articleId = req.params.articleid
  let amount = parseInt(req.body.amount)
  console.log('Change amount of articleid', articleId, 'of userid', userId, 'to', amount)
  axios.put(`http://localhost:61782/cart/${userId}/${articleId}`, {
      amount: amount
    })
    .then(cartRes => {
      console.log('Got cart', cartRes.data);
      res.json(cartRes.data)
    })
    .catch(error => {
      console.log('Error while getting cart', error.response.status);
      switch (error.response.status) {
        case 404:
          res.status(404).json({
            error: 'User does not exist or has article not in cart yet'
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

app.delete('/cart/:userid/:articleid', (req, res) => {
  let userId = req.params.userid
  let articleId = req.params.articleid
  console.log('Remove articleid', articleId, 'from cart of userid', userId)
  axios.delete(`http://localhost:61782/cart/${userId}/${articleId}`)
    .then(cartRes => {
      console.log('Deleted article')
      res.json(cartRes.data)
    })
    .catch(error => {
      console.log('Error while getting cart', error.response.status);
      switch (error.response.status) {
        case 404:
          res.status(404).json({
            error: 'User does not exists'
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

app.get('/cart/total-price/:userid', (req, res) => {
  let userId = req.params.userid
  console.log('Get total price of userid', userId)
  axios.get(`http://localhost:61782/cart/total-price/${userId}`)
    .then(addRes => {
      console.log('Got total price')
      res.json(addRes.data)
    })
    .catch(error => {
      console.log('Error while getting total price', error.response.status);
      switch (error.response.status) {
        case 404:
          res.status(404).json({
            error: 'User has no cart'
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

app.listen(port, () => console.log(`${serviceName} started on localhost:${port}`))
