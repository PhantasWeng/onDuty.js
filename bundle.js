(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('express')) :
  typeof define === 'function' && define.amd ? define(['express'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.express));
}(this, (function (express) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var express__default = /*#__PURE__*/_interopDefaultLegacy(express);

  // import bodyParser from 'body-parser'
  const bodyParser = require('body-parser');

  // import onDuty from '../src/onDuty'
  const onDuty = require('./src/onDuty');

  const app = express__default['default']();
  const port = 30678;

  app.use(bodyParser.json());

  app.get('/health', (req, res) => {
    res.end('onDuty is online!');
  });

  app.post('/test', (req, res) => {
    onDuty.test().then(response => {
      res.type('json').send({
        ...response,
        data: req.body
      });
    }).catch(error => {
      res.status(500).end(error);
    });
  });

  app.post('/punch', (req, res) => {
    console.log('Start Punch');
    onDuty.start().then(response => {
      console.log('response', response);
      res.type('json').send({
        ...response
      });
    }).catch(error => {
      console.log('error', error);
      res.status(500).end(error);
    });
  });

  app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`);
  });

})));
