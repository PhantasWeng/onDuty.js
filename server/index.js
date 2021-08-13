import express from 'express'

// import bodyParser from 'body-parser'
const bodyParser = require('body-parser')

// import onDuty from '../src/onDuty'
const onDuty = require('./src/onDuty')

const app = express()
const port = 30678

app.use(bodyParser.json())

app.get('/health', (req, res) => {
  res.end('onDuty is online!')
})

app.post('/test', (req, res) => {
  onDuty.test().then(response => {
    res.type('json').send({
      ...response,
      data: req.body
    })
  }).catch(error => {
    res.status(500).end(error)
  })
})

app.post('/punch', (req, res) => {
  console.log('Start Punch')
  onDuty.start().then(response => {
    console.log('response', response)
    res.type('json').send({
      ...response
    })
  }).catch(error => {
    res.status(500).end(error)
  })
})

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`)
})
