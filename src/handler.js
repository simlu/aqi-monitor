const fs = require("fs");
const zlib = require("zlib");
const request = require("request-promise-native");
const xml2js = require("xml2js");
const AWS = require("aws-sdk");
const get = require("lodash.get");
const aqibot = require('aqi-bot');
const rollbar = require('lambda-rollbar')({
  verbose: process.env.ROLLBAR_VERBOSE === "1",
  enabled: !!process.env.ROLLBAR_ACCESS_TOKEN,
  accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
  environment: process.env.STATION
});
const slack = require("slack-sdk")(
  process.env.SLACK_WORKSPACE,
  process.env.SLACK_SESSION_TOKEN
);

const xmlParser = new xml2js.Parser();
const s3 = new AWS.S3({ region: process.env.REGION });

const levels = JSON.parse(fs.readFileSync(`${__dirname}/levels.json`));
const getLevel = aqi => String(Math.max(...Object
  .keys(levels)
  .map(value => parseInt(value, 10))
  .filter(value => value <= aqi)));

const PollutantMapping = {
  PM10: 'PM10',
  PM25: 'PM25',
  SO2: 'SO-2',
  NO2: 'NO-2',
  O3: 'OZNE',
  CO: 'C--O'
};

module.exports.cron = rollbar.wrap(async () => {
  const aqi = await request({
    method: 'GET',
    uri: `http://www.env.gov.bc.ca/epd/bcairquality/aqo/xml/${process.env.STATION}_Current_Month.xml`
  })
    .then(e => new Promise((resolve, reject) => xmlParser
      .parseString(e, (err, res) => (err ? reject(err) : resolve(get(res, "AQO_TYPE.STATIONS[0].STRD[0].READS[0].RD")
        .reduce((list, reading) => Object.assign(list, {
          [new Date(get(reading, "$.DT").replace(
            /^(\d\d\d\d),(\d\d),(\d\d),(\d\d),(\d\d),(\d\d)$/,
            "$1-$2-$3T$4:$5:$6"
          )) / 1000]: get(reading, "PARAMS.0.PV")
            .reduce((obj, measure) => Object.assign(obj, { [measure.$.NM]: measure.$.VL }), {})
        }), {}))
      ))))
    .then((measures) => {
      const promises = [];
      const curHour = Math.max(...Object.keys(measures));
      Object.keys(PollutantMapping).forEach((pollutantType) => {
        const timeline = [];
        for (let i = 0; i < 12; i += 1) {
          timeline.push(parseFloat(get(measures, [curHour - i * 3600, PollutantMapping[pollutantType]], -1)));
        }
        promises.push(aqibot.AQICalculator.getAQIResult(aqibot.PollutantType[pollutantType], timeline[0]));
      });
      return Promise.all(promises);
    })
    .then(aqiResults => aqiResults.map(aqiResult => aqiResult.aqi))
    .then(aqis => Math.max(...aqis));
  const currentData = JSON.stringify({ aqi });

  const s3Key = `${process.env.STATION}-last-reading.json.gz`;

  let previousData = "{}";
  try {
    previousData = zlib.gunzipSync((await s3.getObject({
      Bucket: process.env.DATA_BUCKET_NAME,
      Key: s3Key
    }).promise()).Body).toString("utf8");
  } catch (e) {
    if (e.code !== 'NoSuchKey') {
      throw e;
    }
  }

  if (currentData !== previousData) {
    // update previous data
    await s3.putObject({
      ContentType: "application/json",
      ContentEncoding: "gzip",
      Body: zlib.gzipSync(currentData, { level: 9 }),
      Bucket: process.env.DATA_BUCKET_NAME,
      Key: s3Key
    }).promise();

    const prevLevel = getLevel(get(JSON.parse(previousData), "aqi", 0));
    const curLevel = getLevel(get(JSON.parse(currentData), "aqi", 0));
    if (prevLevel !== curLevel) {
      const info = levels[curLevel];
      const msg = [
        `*Air Quality Index*: \`${info.level}\``,
        `_${info.impact}_`,
        info.recommendation,
        info.image,
        `*Source*: \`http://tiny.cc/nn83wy\``
      ].join("\n\n");
      await slack.message.channel(process.env.SLACK_CHANNEL, msg);
      return "changed";
    }
  }

  return "unchanged";
});
