const express = require('express')
const mongoose = require('mongoose');
const routes = require('./src/routes')

const app = express()

app.use(routes)

const connection = mongoose.connection;

connection.on('connected', () => {
  console.log('Mongoose connection open')
});

connection.on('disconnected', () => {
  console.log('Mongoose connection disconnected');
  mongoose.connect('mongodb+srv://ecommerce_api:ecommerce_api@cluster0.mv3e7ew.mongodb.net/?retryWrites=true&w=majority',
   { useNewUrlParser: true, useUnifiedTopology: true })
})


app.listen(3000, () => {
  console.log('API listen on port 3000')
})