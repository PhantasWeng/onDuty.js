import dotenv from 'dotenv'
import logger from './logger'

dotenv.config()

const env = {
  loginUrl: process.env.loginUrl,
  userName: process.env.userName,
  password: process.env.password
}

function isValid () {
  const notFilled = []
  for (const [key, value] of Object.entries(env)) {
    if (typeof value === 'undefined') {
      notFilled.push(key)
    }
  }
  if (notFilled.length > 0) {
    logger.error(`[Error] Please fill ${notFilled.join(', ')} in .env file.`)
  }
  return notFilled.length === 0
}

export default isValid() ? env : undefined
