(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('dotenv'), require('chalk')) :
  typeof define === 'function' && define.amd ? define(['dotenv', 'chalk'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.dotenv, global.chalk));
}(this, (function (dotenv, chalk) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var dotenv__default = /*#__PURE__*/_interopDefaultLegacy(dotenv);
  var chalk__default = /*#__PURE__*/_interopDefaultLegacy(chalk);

  var logger = {
    log: message => console.log(message),
    success : message => console.log(chalk__default['default'].green(message)),
    error : message => console.log(chalk__default['default'].red(message))
  };

  dotenv__default['default'].config();

  const env = {
    loginUrl: process.env.loginUrl,
    userName: process.env.userName,
    password: process.env.password
  };

  function isValid () {
    const notFilled = [];
    for (const [key, value] of Object.entries(env)) {
      if (typeof value === 'undefined') {
        notFilled.push(key);
      }
    }
    if (notFilled.length > 0) {
      logger.error(`[Error] Please fill ${notFilled.join(', ')} in .env file.`);
    }
    return notFilled.length === 0
  }

  var env$1 = isValid() ? env : undefined;

  // import logger from './logger'

  const defaultOptions = {
    env: env$1,
    browser: {
      headless: true,
      devtools: false,
      args: ['--window-size=400,760', '--no-sandbox'],
      slowMo: 0
    }
  };

  const config = {
    ...defaultOptions
  };

  console.log(config);

})));
