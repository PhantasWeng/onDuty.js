import express from 'express'

// import onDuty from '../src/onDuty'
const onDuty = require('./src/onDuty')

const app = express()
const port = 3000

app.get('/health', (req, res) => {
  res.end('onDuty is online!')
})

app.post('/punch', (req, res) => {
  console.log('Start Punch')
  onDuty.test().then(response => {
    res.type('json').send({
      status: response
    })
  }).catch(error => {
    res.status(500).end(error)
  })
})

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`)
})
