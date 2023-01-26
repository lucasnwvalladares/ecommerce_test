const { Router } = require('express')
const session = require('express-session')
const axios = require('axios')
const Stripe = require('stripe');

const Purchase = require('../models/Purchase')

const routes = Router()
const stripe = Stripe('sk_test_4eC39HqLyjWDarjtT1zdp7dc');

routes.use(session({
  secret: 'secretKey',
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
  }
}))

routes.get('/', (req, res) => {
  res.send('Hello World')
})

/* Endpoint For All Products */
routes.get('/api/products', async (req, res) => {
  try {
    /* Getting data from provider 1 */
    const response1 = await axios.get('http://616d6bdb6dacbb001794ca17.mockapi.io/devnology/brazilian_provider')
    /* Getting data from provider 2 */
    const response2 = await axios.get('http://616d6bdb6dacbb001794ca17.mockapi.io/devnology/european_provider')

    let products = []

    response1.data.forEach((product, i) => {
      let newProduct = {
        id: `br_${i}`,
        name: product.nome,
        description: product.descricao,
        department: product.departamento,
        material: product.material,
        category: product.categoria,
        pictures: [product.imagem],
        price: product.preco,
        discount: 0,
        hasDiscount: false
      }

      products.push(newProduct)
    });

    response2.data.forEach((product, i) => {
      let newProduct = {
        id: `eu_${i}`,
        name: product.name,
        description: product.description,
        department: null,
        material: product.details.material,
        category: product.details.adjective,
        pictures: product.gallery,
        price: product.price,
        discount: product.discountValue,
        hasDiscount: product.hasDiscount
      }

      products.push(newProduct)
    });

    res.send(products)
  } catch (error) {
    res.send(error)
  }
})

/* Get Product By ID */
routes.get('/api/products/:id', async (req, res) => {
  const id = req.params.id

  let products = []

  await axios.get('http://localhost:3000/api/products')
    .then(response => {
      products = response.data
    })
    .catch(error => {
      console.log(error);
    })

  const product = products.find(p => p.id === id)

  if (product) {
    res.send(product)
  } else {
    res.status(404).send({ message: 'Product not found.' })
  }
})

/* Send Product to Cart */
routes.post('/api/cart', (req, res) => {
  const product = req.body

  req.session.cart = req.session.cart || []
  req.session.cart.push(product)

  res.send({ message: 'Product added at the cart with success' })
})

/* Retrieve Cart Products */
routes.get('/api/cart', (req, res) => {
  res.send(req.session.cart)
})

/* Checkout Endpoint */
routes.post('/checkout', async (req, res) => {
  // GET items from the cart on session storage
  const cart = req.session.cart
  const client = req.body

  // Validate data
  if (!cart || !client) {
    return res.status(400).json({ error: 'Invalid data.' })
  }

  try {
    // Process payment
    const charge = await stripe.charges.retrieve(
      'ch_3MUC1E2eZvKYlo2C11JjEidP',
      {
        apiKey: 'sk_test_4eC39HqLyjWDarjtT1zdp7dc'
      }
    )

    console.log(charge)

    // Store data at database
    const purchase = new Purchase({
      client: client,
      products: cart.products,
      total: cart.total
    })

    await purchase.save()

    // Send corfirmation email
    // ...

    res.status(200).json({ message: 'Shopping ended with success' })
  } catch (error) {
    res.status(500).json({ message: 'Error while proccessing payment.' })
  }
})

module.exports = routes