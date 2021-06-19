/* global __dirname */

const path = require('path')
const express = require('express')
const contributor = require('./ContributorBackend')
const contributions = require('./backend/contribution')
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

app.get('/contributions/:edition?/:search?/', function(req, res) {
  contributions.get(req.params.edition, req.params.search)
  .then(val => {
    console.log(val)
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

app.get('/contributors/:type?/:name?/?', function(req, res) {
  let username, type

  if(! ('name' in req.params))
    username = req.params.type
  else {
    type = req.params.type
    username = req.params.name
  }
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

app.post('/contributors/remove', function(req, res) {
  if(!req.body.password || !process.env.WEBAPP_PASSWORD || !TwinBcrypt.compareSync(process.env.WEBAPP_PASSWORD, req.body.password)) {
    res.status(400)
    res.end()
    return
  }

  const push = !!req.body.pushToGithub

  contributor.contributors.remove(req.body.username)
  .then(() => {
    if(push) {
      console.error('puuush it')
      res.status(500).send({error: 'Saved but you need to push it'})
      res.end()
    } else {
      res.status(200)
      res.end()
    }
  })
  .catch(err => {
    console.error(err)
    res.status(400)
    res.end()
  })
})