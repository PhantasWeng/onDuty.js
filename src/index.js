import env from './env'
// import logger from './logger'

const defaultOptions = {
  env: env,
  browser: {
    headless: true,
    devtools: false,
    args: ['--window-size=400,760', '--no-sandbox'],
    slowMo: 0
  }
}

const config = {
  ...defaultOptions
}

console.log(config)