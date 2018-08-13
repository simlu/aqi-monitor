const fs = require("fs");
const zlib = require("zlib");
const request = require("request-promise-native");
const AWS = require("aws-sdk");
const get = require("lodash.get");
const rollbar = require('lambda-rollbar')({
  verbose: process.env.ROLLBAR_VERBOSE === "1",
  enabled: !!process.env.ROLLBAR_ACCESS_TOKEN,
  accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
  environment: process.env.CITY
});

const s3 = new AWS.S3({ region: process.env.REGION });

const levels = JSON.parse(fs.readFileSync(`${__dirname}/levels.json`));
const getLevel = aqi => String(Math.max(...Object
  .keys(levels)
  .map(value => parseInt(value, 10))
  .filter(value => value <= aqi)));

module.exports.cron = rollbar.wrap(async () => {
  const currentData = await request({
    method: 'GET',
    uri: `http://api.waqi.info/feed/${process.env.CITY}/?token=${process.env.WAQI_TOKEN}`
  });

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

    const prevLevel = getLevel(get(JSON.parse(previousData), "data.aqi", 0));
    const curLevel = getLevel(get(JSON.parse(currentData), "data.aqi", 0));
    if (prevLevel !== curLevel) {
      // todo: notification
      return "changed";
    }
  }

  return "unchanged";
});
