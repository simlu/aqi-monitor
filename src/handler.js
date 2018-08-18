const fs = require("fs");
const zlib = require("zlib");
const request = require("request-promise-native");
const xml2js = require("xml2js");
const objectScan = require("object-scan");
const AWS = require("aws-sdk");
const get = require("lodash.get");
const rollbar = require('lambda-rollbar')({
  verbose: process.env.ROLLBAR_VERBOSE === "1",
  enabled: !!process.env.ROLLBAR_ACCESS_TOKEN,
  accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
  environment: process.env.CITY
});
const slack = require("slack-sdk")(
  process.env.SLACK_WORKSPACE,
  process.env.SLACK_SESSION_TOKEN
);

const parser = new xml2js.Parser();
const s3 = new AWS.S3({ region: process.env.REGION });

const levels = JSON.parse(fs.readFileSync(`${__dirname}/levels.json`));
const getLevel = aqi => String(Math.max(...Object
  .keys(levels)
  .map(value => parseInt(value, 10))
  .filter(value => value <= aqi)));

module.exports.cron = rollbar.wrap(async () => {
  const xmlString = await request({
    method: 'GET',
    uri: `http://www.env.gov.bc.ca/epd/bcairquality/aqo/xml/Current_Hour.xml`
  });
  const xmlJson = await new Promise((resolve, reject) => parser
    .parseString(xmlString, (err, res) => (err ? reject(err) : resolve(res))));

  const stationPath = objectScan(["AQO_TYPE.STATIONS[0].STRD[*].$.NAME"], {
    filterFn: (key, value) => value === process.env.CITY,
    joined: false
  })(xmlJson);
  const station = get(xmlJson, stationPath[0].slice(0, -2));
  const pm25 = objectScan(["**"], {
    filterFn: (key, value) => key.endsWith('.NM') && value === 'PM25',
    joined: false
  })(station);
  const currentData = JSON.stringify({ aqi: get(station, pm25[0].slice(0, -1).concat("VL")) });

  const s3Key = `${process.env.CITY}-last-reading.json.gz`;

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
        `*Reference*: \`http://tiny.cc/nn83wy\``
      ].join("\n\n");
      await slack.message.channel(process.env.SLACK_CHANNEL, msg);
      return "changed";
    }
  }

  return "unchanged";
});
