const fs = require('fs');
const zlib = require('zlib');
const request = require('request-promise-native');
const cheerio = require('cheerio');
const get = require('lodash.get');
const aqibot = require('aqi-bot');
const rollbar = require('lambda-rollbar')({
  verbose: process.env.ROLLBAR_VERBOSE === '1',
  enabled: !!process.env.ROLLBAR_ACCESS_TOKEN,
  accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
  environment: process.env.STATION
});
const aws = require('aws-sdk-wrap')({ config: { region: process.env.REGION } });
const slack = require('slack-sdk')(
  process.env.SLACK_WORKSPACE,
  process.env.SLACK_SESSION_TOKEN
);

const levels = JSON.parse(fs.readFileSync(`${__dirname}/levels.json`));
const getLevel = aqi => String(Math.max(...Object
  .keys(levels)
  .map(value => parseInt(value, 10))
  .filter(value => value <= aqi)));

const PollutantMapping = {
  PM10: 'PM10',
  PM25: 'PM25',
  SO2: 'SO2',
  NO2: 'NO2',
  O3: 'O3',
  CO: 'CO'
};

module.exports.cron = rollbar.wrap(async () => {
  const maxAqiResult = await request({
    method: 'GET',
    uri: `https://envistaweb.env.gov.bc.ca/OnlineA.aspx?ST_ID=${process.env.STATION};1;GRID`,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) '
        + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
    }
  })
    .then((r) => {
      const $ = cheerio.load(r);
      const result = [];
      $('tr', '#C1WebGrid1').each((idxTr, tr) => result.push(tr.children
        .filter(td => td.name === 'td')
        .map(td => td.children[0].children[0].data.trim())));
      return Object.assign(...result.slice(2).map(tr => ({
        [Math.round(Date.parse(tr[0]) / 1000)]: Object.assign(...tr.slice(1).map((td, idx) => ({
          [result[0].slice(1)[idx]]: Number(td)
        })))
      })));
    })
    .then((r) => {
      const result = {};
      Object.keys(r).map(unix => Number(unix)).sort().reverse()
        .forEach((unix) => {
          Object.entries(r[unix]).forEach(([key, value]) => {
            if (!Number.isNaN(value) && result[key] === undefined) {
              result[key] = value;
            }
          });
        });
      return result;
    })
    .then(measure => Promise.all(Object
      .keys(PollutantMapping)
      .map(pollutantType => aqibot.AQICalculator.getAQIResult(
        aqibot.PollutantType[pollutantType],
        measure[PollutantMapping[pollutantType]]
      ))))
    .then(aqiResults => aqiResults.sort((a, b) => b.aqi - a.aqi)[0]);
  const currentData = JSON.stringify(maxAqiResult);

  const s3Key = `${process.env.STATION}-last-reading.json.gz`;

  const previousData = await aws.call('s3', 'getObject', {
    Bucket: process.env.DATA_BUCKET_NAME,
    Key: s3Key
  }, { expectedErrorCodes: ['NoSuchKey'] })
    .then(r => (r === 'NoSuchKey' ? '{}' : zlib.gunzipSync(r.Body).toString('utf8')));

  if (currentData !== previousData) {
    // update previous data
    await aws.call('s3', 'putObject', {
      ContentType: 'application/json',
      ContentEncoding: 'gzip',
      Body: zlib.gzipSync(currentData, { level: 9 }),
      Bucket: process.env.DATA_BUCKET_NAME,
      Key: s3Key
    });

    const prevPollutant = JSON.parse(previousData);
    const prevLevel = getLevel(get(prevPollutant, 'aqi', 0));
    const curPollutant = JSON.parse(currentData);
    const curLevel = getLevel(get(curPollutant, 'aqi', 0));
    if (prevLevel !== curLevel) {
      const info = levels[curLevel];
      const msg = [
        `*Air Quality Index*: \`${info.level}\` *(${curPollutant.pollutant})*`,
        `_${info.impact}_`,
        info.recommendation,
        info.image,
        '*Source*: `http://tiny.cc/nn83wy`'
      ].join('\n\n');
      await slack.message.channel(process.env.SLACK_CHANNEL, msg);
      return 'changed';
    }
  }

  return 'unchanged';
});
