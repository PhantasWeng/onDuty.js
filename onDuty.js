require('dotenv').config();
const puppeteer = require('puppeteer');
const dateFns = require('date-fns');

(async () => {
  console.log('[1/7] 👻  開始自動打卡')
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    // args: ['--window-size=400,700', '--no-sandbox'],
    slowMo: 20,
  });
  const page = await browser.newPage();
  await page.setViewport({width: 400, height: 720});
  const navigationPromise = page.waitForNavigation({ waitUntil: 'networkidle0' });

  const loginUrl = 'https://auth.mayohr.com/HRM/Account/Login?original_target=https%3A%2F%2Fhrm.mayohr.com%2Fta&lang=undefined'
  const menuBtn = '.ta-link-item[data-reactid=".0.0.1.2.0.1.1.1.0.1.2"]';
  const onDutyBtn = '.ta_btn_cancel[data-reactid=".0.0.1.2.0.1.1.1.5.0.1.0.1.0.0"]';
  const offWorkBtn = '.ta_btn_cancel[data-reactid=".0.0.1.2.0.1.1.1.5.0.1.0.1.0.2"]';

  await page.goto(loginUrl, { waitUntil: 'networkidle2' })

  console.log('[2/7] 🧐  輸入帳密')
  console.log(' └─ userName: ' + process.env.userName)
  console.log(' └─ password: ' + '*'.repeat(process.env.password.length))
  await page.type('input[name="userName"]', process.env.userName);
  await page.type('input[name="password"]', process.env.password);
  await page.click('button[type="submit"]');
  await page.on('response', response => {
    if (response.url().endsWith('Token') === true) {
      if (response._status === 200) {
        console.log('[3/7] 🤨  登入成功')
      }
    }
  });
  await navigationPromise;

  await page.waitForSelector(menuBtn);
  await page.click(menuBtn);
  console.log('[4/7] 🤳  開啟: 我要打卡')

  // 上班
  if(dateFns.format(new Date, 'HH') < 12) {
    console.log('[5/7] 😏  點擊: 上班')
    await page.waitForSelector(onDutyBtn);
    await page.click(onDutyBtn);
    await page.on('response', response => {
      if (response.url().endsWith('GetWithReason') === true) {
        if (response._status === 200) {
          console.log('[6/7] 😈   打卡成功')
        }
      }
      if (response.url().endsWith('web') === true) {
        response.json().then(function (textBody) {
          console.log(' └─ [下班] 打卡時間: ' + textBody.Data.punchDate);
        })
      }
    });
  }

  // 下班
  if(dateFns.format(new Date, 'HH') > 17) {
    console.log('[5/7] 😏  點擊: 下班')
    await page.waitForSelector(onDutyBtn);
    await page.click(onDutyBtn);
    await page.on('response', response => {
      if (response.url().endsWith('GetWithReason') === true) {
        if (response._status === 200) {
          console.log('[6/7] 😈   打卡成功')
        }
      }
      if (response.url().endsWith('web') === true) {
        response.json().then(function (textBody) {
          console.log(' └─ [上班] 打卡時間: ' + textBody.Data.punchDate);
        })
      }
    });
  }


  // const dimensions = await page.evaluate(() => {
  //   return {
  //     width: document.documentElement.clientWidth,
  //     height: document.documentElement.clientHeight,
  //     deviceScaleFactor: window.devicePixelRatio
  //   };
  // });
  // console.log('Dimensions:', dimensions);

  await page.screenshot({path: './screenshots/' + dateFns.format(new Date, 'YYYY-MM-DD HH:mm:ss') + '.jpg'});

  await browser.close().then(() => {
    console.log('[7/7] 🙆‍♂  打卡完成!!!')
  });
})();