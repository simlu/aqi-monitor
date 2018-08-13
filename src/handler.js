const request = require("request-promise-native");
const rollbar = require('lambda-rollbar')({
  verbose: process.env.ROLLBAR_VERBOSE === "1",
  enabled: !!process.env.ROLLBAR_ACCESS_TOKEN,
  accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
  environment: process.env.CITY
});

module.exports.cron = rollbar.wrap(async () => {
  const data = await request({
    method: 'GET',
    uri: `http://api.waqi.info/feed/${process.env.CITY}/?token=${process.env.WAQI_TOKEN}`,
    json: true
  });
  return data;
});
