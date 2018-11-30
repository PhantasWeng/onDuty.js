require('dotenv').config();
const program = require('commander')
const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors')
const dateFns = require('date-fns');
const colors = require('colors');

program
  .version('onDuty.js: Version 0.1.0')
  .option('-p, --punch [type]', '[開發中] 指定特定的動作: 打卡, 休息, 請假')
  .option('-d, --devtools', '開啟 devtool')
  .option('-w, --watch', '察看 UI 介面')

  program.on('--help', function(){
  console.log('')
  console.log(`${colors.yellow('env 目前設定:')}
  userName = ${colors.green(process.env.userName)}
  password = ${colors.green('*'.repeat(process.env.password.length))}
  loginUrl = ${colors.green(process.env.loginUrl)}
  `)
  });
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

(async () => {

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

  await page.goto(process.env.loginUrl, { waitUntil: 'networkidle2' })

  console.log('[2/7] ⚡️  輸入帳密')
  console.log(' └─ userName: ' + process.env.userName)
  console.log(' └─ password: ' + '*'.repeat(process.env.password.length))
  await page.type('input[name="userName"]', process.env.userName);
  await page.type('input[name="password"]', process.env.password);
  await page.click('button[type="submit"]');
  await page.on('response', response => {
    if (response.url().endsWith('Token') === true) {
      if (response._status === 200) {
        console.log('[3/7] ✨  登入成功')
      }
    }
  });
  await navigationPromise;

  await page.waitForSelector(menuBtn);
  await page.click(menuBtn);
  console.log('[4/7] ⚡️  開啟: 我要打卡')

  // Duty
  console.log('[5/7] ✨  點擊: 上/下班 按鈕')
  await page.waitForSelector(dutyBtn);
  await page.click(dutyBtn);

  const waitResult = async res => {
    try {
      await page.waitForResponse( response => {
        if (response.url().endsWith('GetWithReason') === true) {
          if (response._status === 200) {
            console.log('[6/7] 🎉   ' + myPunchType + '打卡成功')
          }
        }
        if (response.url().endsWith('web') === true) {
          response.json().then(function (textBody) {
            let myPunchType
            if (textBody.Data.punchType == 1) myPunchType = '上班'
            if (textBody.Data.punchType == 2) myPunchType = '下班'
            console.log(' └─ [' + myPunchType + '] 打卡時間: ' + dateFns.format(textBody.Data.punchDate,  'YYYY-MM-DD HH:MM:SS'));
          })
          return true
        }
      }, {timeout: 10000});
    } catch (e) {
      if (e instanceof TimeoutError) {
        // Do something if this is a timeout.
        console.log('[6/7] 🚧  ' + '打卡失敗: ' + dateFns.format(Date.now(),  'YYYY-MM-DD HH:MM:SS'))
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
  waitResult().then( async res => {
    if (res === true) {
      await page.screenshot({path: './screenshots/' + dateFns.format(new Date, 'YYYY-MM-DD HH:mm:ss') + '.jpg'});
      if (!program.devtools) {
        await browser.close()
      }
      console.log('')
      console.log(colors.green('[7/7] 🍻  打卡完成!!!'))
      console.log('')
    } else {
      if (!program.devtools) {
        await browser.close()
      }
      console.log('')
      console.log(colors.red('[7/7] 🚨  打卡失敗: ' + res))
      console.log('')
    }
  })
})()
