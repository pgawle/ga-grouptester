'use strict';
const puppeteer = require('puppeteer');
const getDataFromFile = require('./getDataFromFile.js').getDataFromFile;

const csvFile = "data_example.csv";
const waitTime = 2000;


const reqUrls = getDataFromFile(csvFile);

(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  // set user agent to mobile phone
  await page.setUserAgent('Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Mobile Safari/537.36');

  page.on('request', request => {
    const url = request.url();

    // look for tracking script
    if (url.match(/^https?:\/\/www\.google-analytics\.com\/(r\/)?collect/i)) {

      const baseData = reqUrls.find(item => item.url === request.headers().referer)
      let cg1Key = ''
      let query = url.match(/\?v=1(.*?)$/)[1];
      let params = decodeURI(query).split('&');
      for (let i = 0; i < params.length; i++) {
        let key = params[i];
        if (key.match(/^(cg1)=/)) {
          cg1Key = key.split('=')[1]
        }
      }
      // console.log(baseData, request.headers().referer)

      if(baseData === undefined){
        console.error(`No group for ${request.headers().referer}`)
      }else {
        if(baseData.group === cg1Key){
          console.log(`PASS: ${baseData.url}`)
        }else{
          console.log({
            test: {
              test_result: baseData.group === cg1Key ? "PASS" : "FAIL",
              url: baseData.url,
              cvs_group: baseData.group,
              group_send: cg1Key
            }
          });
        }
      }


    }

    request.continue();
  });

  try {
    for (var i = 0; i < reqUrls.length; i++) {
      await page.goto(reqUrls[i].url, {waitUntil: 'networkidle2'});
      await page.waitFor(waitTime);
    }
  } catch (err) {
    console.log("Couldn't fetch page " + err);
  }

  await browser.close();
})();

