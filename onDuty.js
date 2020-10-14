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

function setConfig (data) {
  userName = data.userName
  password = data.password
  loginUrl = data.loginUrl
}

const punchDuty = async () => {
  var punchResult = {
    status: null,
    msg: '',
    time: ''
  }
  // console.log(`${colors.yellow('env 目前設定:')}
  // userName = ${colors.green(userName)}
  // password = ${colors.green('*'.repeat(password.length))}
  // loginUrl = ${colors.green(loginUrl)}
  // `)
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
  await page.click('button[type="submit"]');
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
      const finalResponse = await page.waitForResponse( response => {
        if (response.url().endsWith('web') && response.request().method() === 'POST') {
          if (response.status() === 200) {
            return response.json().then( text => {
              // punchType: 1 上班
              // punchType: 2 下班
              // punchDate 打卡時間
              // LocationName 打卡地點
              let myPunchType = ''
              if (text.Data.punchType === 1) { myPunchType = '上班' }
              if (text.Data.punchType === 2) { myPunchType = '下班' }
              console.log('[6/7] 🎉   ' + '打卡成功 @ ' + text.Data.LocationName)
              console.log(' └─ [' + myPunchType + '] 打卡時間: ' + dateFns.format(text.Data.punchDate,  'YYYY-MM-DD HH:mm:ss'))
              punchResult.status = true
              punchResult.msg = '[' + myPunchType + '] 打卡成功'
              punchResult.time = dateFns.format(text.Data.punchDate,  'YYYY-MM-DD HH:mm:ss')
            })
          } else {
            return response.json().then( text => {
              console.log('[6/7] 🚧  ' + response.status() + ': ' + text.Error.Title)
            })
          }
        }
      }, {timeout: 10000})
      if (finalResponse.ok()) {
        return finalResponse.ok()
      } else {
        let msg = ''
        await finalResponse.json().then(text => msg = text.Error.Title)
        return finalResponse.status() + ': ' + msg
      }
    } catch (e) {
      if (e instanceof TimeoutError) {
        // Do something if this is a timeout.
        console.log('[6/7] 🚧  ' + '打卡失敗: ' + dateFns.format(Date.now(),  'YYYY-MM-DD HH:mm:ss'))
        punchResult.status = false
        punchResult.msg = '打卡失敗'
        punchResult.time = dateFns.format(Date.now(),  'YYYY-MM-DD HH:mm:ss')
        return e.message
      }
    }
  }

  // const dimensions = await page.evaluate(() => {
  //   return {
  //     width: document.documentElement.clientWidth,
  //     height: document.documentElement.clientHeight,
  //     deviceScaleFactor: window.devicePixelRatio
  //   };
  // });
  // console.log('Dimensions:', dimensions);
  return await waitResult().then( async res => {
    if (res === true) {
      await page.screenshot({path: './screenshots/' + dateFns.format(new Date, 'YYYY-MM-DD HH:mm:ss') + '.jpg'});
      if (!program.devtools) {
        await browser.close()
      }
      // console.log('')
      console.log('[7/7] 🍻  打卡完成!!!')
      // console.log('')
      // console.log('punchResult', punchResult)
    } else {
      if (!program.devtools) {
        await browser.close()
      }
      // console.log('')
      console.log('[7/7] 🚨  打卡失敗: ' + res)
      // console.log('')
      // console.log('punchResult', punchResult)
    }
    return punchResult
  })
}


if ('require', require.main === module) {
  punchDuty()
}

module.exports.start = punchDuty
module.exports.config = setConfig