const mongoose = require('mongoose')

const purchaseSchema = new mongoose.Schema({
  client: {
    name: String,
    email: String,
    address: String,
  },
  products: [{
    name: String,
    price: Number,
    quantity: Number,
  }],
  total: Number,
  date: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Purchase', purchaseSchema)