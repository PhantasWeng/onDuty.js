require('dotenv').config();
const program = require('commander')
const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors')
const dateFns = require('date-fns');
const colors = require('colors');

let userName = process.env.userName
let password = process.env.password
let loginUrl = process.env.loginUrl

program
  .version('onDuty.js: Version 0.1.0')
  .option('-p, --punch [type]', '[開發中] 指定特定的動作: 打卡, 休息, 請假')
  .option('-d, --devtools', '開啟 devtool')
  .option('-w, --watch', '察看 UI 介面')

  // program.on('--help', function(){
  // console.log('')
  // console.log(`${colors.yellow('env 目前設定:')}
  // userName = ${colors.green(userName)}
  // password = ${colors.green(password)}
  // loginUrl = ${colors.green(loginUrl)}
  // `)
  // });
  if(!process.argv.slice(2).length) {
    program.outputHelp(text => colors.grey(text));
  }
  program.parse(process.argv)

  if(process.argv.slice(2).length) {
    console.log('')
    if (program.punch) {
      if (program.punch === true) {
        console.log(colors.grey('--punch'), colors.red('[無參數設置] 預設為: 打卡'))
      } else {
        console.log(colors.grey('--punch'), colors.green(program.punch))
      }
    }
    if (program.devtools) console.log(colors.grey('--devtools:'), colors.green(program.devtools))
    if (program.watch) console.log(colors.grey('--watch:'), colors.green(program.watch))
    console.log('')
  }

program.devtools = true
program.watch = true

function setConfig (data) {
  userName = data.userName
  password = data.password
  loginUrl = data.loginUrl
}

let isPunching = 0
const punchDuty = async () => {
  if (isPunching === 1) {
    return {
      status: 'failed',
      msg: '[錯誤] 上一個API尚未完成，請勿連續發送',
      time: dateFns.format(Date.now(),  'YYYY-MM-DD HH:mm:ss')
    }
  }
  isPunching = 1
  var punchResult = {
    status: null,
    msg: '',
    time: ''
  }
  console.log(`${colors.yellow('env 目前設定:')}
  userName = ${colors.green(userName)}
  password = ${colors.green('*'.repeat(password.length))}
  loginUrl = ${colors.green(loginUrl)}
  `)
  const launchOptions = {
    headless: program.watch ? false : true,
    devtools: program.devtools ? true : false,
    args: program.devtools ? ['--window-size=1920,1080'] : ['--window-size=400,760', '--no-sandbox'],
    slowMo: program.watch ? 30 : 0,
  }

  console.log('[1/7] ⚡️  開始自動打卡')
  const browser = await puppeteer.launch(launchOptions);
  const page = await browser.newPage();
  if (!program.devtools) {
    await page.setViewport({width: 400, height: 720});
  } else {
    await page.setViewport({width: 1336, height: 900});
  }

  const navigationPromise = page.waitForNavigation({ waitUntil: 'networkidle0' });
  const menuBtn = 'a.link-item__link[href$="ta?id=webpunch"]';
  const dutyBtn = '.new-window-body > div > div > div:nth-child(1) > button';

  await page.goto(loginUrl, { waitUntil: 'networkidle0' })

  console.log('[2/7] ⚡️  輸入帳密')
  console.log(' └─ userName: ' + userName)
  console.log(' └─ password: ' + '*'.repeat(password.length))

  await page.type('input[name="userName"]', userName);
  await page.type('input[name="password"]', password);
  await page.click('.loginform > button');
  await page.on('response', response => {
    if (response.url().endsWith('Token') === true) {
      if (response._status === 200) {
        console.log('[3/7] ✨  登入成功')
      }
    }
  });
  await navigationPromise;

  await page.waitForSelector(menuBtn, {timeout: 0});
  await page.click(menuBtn);
  console.log('[4/7] ⚡️  開啟: 我要打卡')

  // Duty
  console.log('[5/7] ✨  點擊: 上/下班 按鈕')
  await page.waitForSelector(dutyBtn, {timeout: 0});
  await page.click(dutyBtn);

  const waitResult = async (result) => {
    try {
      const finalResponse = await page.waitForResponse((response) => {
        return response.url().endsWith('web') && response.request().method() === 'POST'
      }, {timeout: 10000})

      console.log('finalResponse', finalResponse, finalResponse.ok())
      const jsonBody = await finalResponse.json()
      const textBody = await finalResponse.text()
      if (finalResponse.ok()) {
        console.log('ok')
        console.log('jsonBody', jsonBody)
        // console.log('textBody', textBody)
        punchResult.status = 'success'
        punchResult.msg = `[成功] ${jsonBody.Data.punchType === 1 ? '上班' : '下班'}@${jsonBody.Data.LocationName}`
        punchResult.time = dateFns.format(Date.now(),  'YYYY-MM-DD HH:mm:ss')
        return finalResponse.ok()
      } else {
        console.log('error')
        console.log('jsonBody', jsonBody)
        console.log('textBody', textBody)
        punchResult.status = 'failed'
        punchResult.msg = '[錯誤] ' + jsonBody.Error.Title
        punchResult.time = dateFns.format(Date.now(),  'YYYY-MM-DD HH:mm:ss')
      }
    } catch (e) {
      if (e instanceof TimeoutError) {
        // Do something if this is a timeout.
        console.log('[6/7] 🚧  ' + 'API Timeout: ' + dateFns.format(Date.now(),  'YYYY-MM-DD HH:mm:ss'))
        punchResult.status = 'failed'
        punchResult.msg = '打卡失敗 [API Timeout]'
        punchResult.time = dateFns.format(Date.now(),  'YYYY-MM-DD HH:mm:ss')
        return e.message
      }
    }
  }

  return await waitResult().then( async res => {
    if (res === true) {
      // await page.screenshot({path: './screenshots/' + dateFns.format(new Date, 'YYYY-MM-DD HH:mm:ss') + '.jpg'});
      if (!program.devtools) {
        await browser.close()
      }
      console.log('')
      console.log(colors.green('[7/7] 🍻  打卡完成!!!' + `${punchResult.msg} ${punchResult.time}`))
      console.log('')
      console.log('punchResult', punchResult)
    } else {
      if (!program.devtools) {
        await browser.close()
      }
      console.log('')
      console.log(colors.red('[7/7] 🚨  ' + `${punchResult.msg} ${punchResult.time}`))
      console.log('')
      console.log('punchResult', punchResult)
    }
    isPunching = 0
    return punchResult
  })
}


if ('require', require.main === module) {
  punchDuty()
}

async function test () {
  return new Promise((resolve, reject) => {
    const testCase = Math.round(Math.random())
    console.log('test case:', testCase, Date.now())
    if (testCase) {
      return resolve({
        timestamp: Date.now()
      })
    } else {
      return reject('error')
    }
  })
}

module.exports.test = test
module.exports.start = punchDuty
module.exports.config = setConfig