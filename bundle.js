(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('express')) :
  typeof define === 'function' && define.amd ? define(['express'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.express));
}(this, (function (express) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var express__default = /*#__PURE__*/_interopDefaultLegacy(express);

  // import onDuty from '../src/onDuty'
  const onDuty = require('./src/onDuty');

  const app = express__default['default']();
  const port = 3000;

  app.get('/health', (req, res) => {
    res.end('onDuty is online!');
  });

  app.post('/punch', (req, res) => {
    console.log('Start Punch');
    onDuty.test().then(response => {
      res.type('json').send({
        status: response
      });
    }).catch(error => {
      res.status(500).end(error);
    });
  });

  app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`);
  });

})));
