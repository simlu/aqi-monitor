[![Build Status](https://img.shields.io/travis/simlu/aqi-monitor/master.svg)](https://travis-ci.org/simlu/aqi-monitor)
[![Test Coverage](https://img.shields.io/coveralls/simlu/aqi-monitor/master.svg)](https://coveralls.io/github/simlu/aqi-monitor?branch=master)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=simlu/aqi-monitor)](https://dependabot.com)
[![Dependencies](https://david-dm.org/simlu/aqi-monitor/status.svg)](https://david-dm.org/simlu/aqi-monitor)
[![Gardener](https://github.com/simlu/js-gardener/blob/master/assets/badge.svg)](https://github.com/simlu/js-gardener)

# AQI Monitor

Monitor AQI using AWS Lambda

## Configuration A City

1) Create config with city name under `config/CITY.yml`
2) Fill in variables

```yml
REGION: aws-deploy-region (e.g. us-west-2)
CITY: waqi-city-id (e.g. @1234)
ROLLBAR_ACCESS_TOKEN: your-rollbar-token (optional)
WAQI_TOKEN: your-waqi-token
SLACK_CHANNEL: your-slack-channel
SLACK_WORKSPACE: your-slack-workspace
SLACK_SESSION_TOKEN: your-slack-session-token
```

## Deploy

```bash
npm t && npm run clean-build && sls deploy --city=CITY && npm run clean
```
