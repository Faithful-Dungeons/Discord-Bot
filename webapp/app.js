/* global __dirname */

const path = require('path')
const express = require('express')
const contributions = require('./backend/contribution')
const contributions_backend = require('./backend/contributions')
const contributors_backend = require('./backend/contributor')
const TwinBcrypt = require('twin-bcrypt')
require('dotenv').config()

const port = 3000;
const app  = express()

app.use(express.urlencoded({
  extended: true
}))
app.use(express.json());

const webapp_url = '/webapp';

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`)
  console.log(`Web app at http://localhost:${port}${webapp_url}`)
})

app.get('/', (req, res) => {
	res.redirect(302, 'https://compliancepack.net/')
})

app.get(webapp_url, function(req, res) {
  res.sendFile(path.join(__dirname, './index.html'))
})

app.use(express.static('webapp'))

app.post('/contributor', function(req, res) {
  console.log(req.body)
  res.status(200)
  res.end()
})

app.get('/contributions/res/?', function(req, res) {
  contributions_backend.resolutions()
  .then(val => {
    res.setHeader('Content-Type', 'application/json')
    res.send(val)
  })
  .catch(err => {
    console.trace(err)
    res.status(400)
    res.send(err)
  })
  .finally(() => {
    res.end()
  })
})

app.get('/contributions/authors/?', function(req, res) {
  contributions_backend.authors()
  .then(val => {
    res.setHeader('Content-Type', 'application/json')
    res.send(val)
  })
  .catch(err => {
    console.trace(err)
    res.status(400)
    res.send(err)
  })
  .finally(() => {
    res.end()
  })
})

app.get('/contributions/get/', function(req, res) {
  contributions_backend.search(req.params.resolutions, req.params.authors)
  .then(val => {
    res.setHeader('Content-Type', 'application/json')
    res.send(val)
  })
  .catch(err => {
    console.trace(err)
    res.status(400)
    res.send(err)
  })
  .finally(() => {
    res.end()
  })
})

app.get('/contributors/types', function(req, res) {
  contributors_backend.userTypes()
  .then(val => {
    res.setHeader('Content-Type', 'application/json')
    res.send(val)
  })
  .catch(err => {
    console.error(err)
    res.status(400)
    res.send(err)
  })
  .finally(() => {
    res.end()
  })
})

app.get('/contributors/:type/:name?/?', function(req, res) {
  let username, type

  if('type' in req.params && req.params.type && req.params.type != 'all')
    type = req.params.type
  if('name' in req.params && req.params.name) // check if field and value not undefined
    username = req.params.name
  
  contributors_backend.search(username, type)
  .then(val => {
    res.setHeader('Content-Type', 'application/json')
    res.send(val)
  })
  .catch(err => {
    console.error(err)
    res.status(400)
    res.send(err)
  })
  .finally(() => {
    res.end()
  })
})

app.post('/contributors/change', function(req, res) {
  if(!req.body.password || !process.env.WEBAPP_PASSWORD || !TwinBcrypt.compareSync(process.env.WEBAPP_PASSWORD, req.body.password)) {
    res.status(400)
    res.end()
    return
  }
  
  contributors_backend.change(req.body)
  .then(() => {
    res.status(200)
    res.end()
  })
  .catch(err => {
    console.error(err)
    res.status(400)
    res.end()
  })
})

app.post('/contributors/add', function(req, res) {
  if(!req.body.password || !process.env.WEBAPP_PASSWORD || !TwinBcrypt.compareSync(process.env.WEBAPP_PASSWORD, req.body.password)) {
    res.status(400)
    res.end()
    return
  }
  
  contributors_backend.add(req.body)
  .then(() => {
    res.status(200)
    res.end()
  })
  .catch(err => {
    console.error(err)
    res.status(400)
    res.end()
  })
})

app.post('/contributors/remove', function(req, res) {
  if(!req.body.password || !process.env.WEBAPP_PASSWORD || !TwinBcrypt.compareSync(process.env.WEBAPP_PASSWORD, req.body.password) || !req.body.id) {
    res.status(400)
    res.end()
    return
  }

  contributors_backend.remove(req.body.id)
  .then(() => {
    res.status(200)
    res.end()
  })
  .catch(err => {
    console.error(err)
    res.status(400)
    res.end()
  })
})