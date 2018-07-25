require('dotenv').config();
const puppeteer = require('puppeteer');

(async () => {
  console.log('[1/6] 👻  開始自動打卡')
  const browser = await puppeteer.launch({
    headless: true,
    // args: ['--window-size=400,700', '--no-sandbox'],
    slowMo: 0,
  });
  const page = await browser.newPage();
  await page.setViewport({width: 400, height: 720});
  const navigationPromise = page.waitForNavigation({ waitUntil: 'networkidle0' });

  const loginUrl = 'https://auth.mayohr.com/HRM/Account/Login?original_target=https%3A%2F%2Fhrm.mayohr.com%2Fta&lang=undefined'
  const menuBtn = '.ta-link-item[data-reactid=".0.0.1.2.0.1.1.1.0.1.2"]';
  const onDutyBtn = '.ta_btn_cancel[data-reactid=".0.0.1.2.0.1.1.1.5.0.1.0.1.0.2"]';

  await page.goto(loginUrl, { waitUntil: 'networkidle2' })

  console.log('[2/6] 🧐  輸入帳密')
  console.log('└─ userName: ' + process.env.userName)
  console.log('└─ password: 不告訴你')
  await page.type('input[name="userName"]', process.env.userName);
  await page.type('input[name="password"]', process.env.password);
  await page.click('button[type="submit"]');
  await page.on('response', response => {
    if (response.url().endsWith('Token') === true) {
      if (response._status === 200) {
        console.log('[3/6] 🤨  登入成功')
      }
    }
  });
  await navigationPromise;

  console.log('[4/6] 🤳  開啟: 我要打卡')
  await page.waitForSelector(menuBtn);
  await page.click(menuBtn);

  console.log('[5/6] 😏  點擊: 上班')
  await page.waitForSelector(onDutyBtn);
  await page.click(onDutyBtn);
  // const dimensions = await page.evaluate(() => {
  //   return {
  //     width: document.documentElement.clientWidth,
  //     height: document.documentElement.clientHeight,
  //     deviceScaleFactor: window.devicePixelRatio
  //   };
  // });
  // console.log('Dimensions:', dimensions);


  await page.screenshot({path: './screenshots/result.png'});

  await browser.close().then(() => {
    console.log('[6/6] 🙆‍♂  打卡完成!!!')
  });
})();