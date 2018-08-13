[![Build Status](https://img.shields.io/travis/simlu/aqi-monitor/master.svg)](https://travis-ci.org/simlu/aqi-monitor)
[![Test Coverage](https://img.shields.io/coveralls/simlu/aqi-monitor/master.svg)](https://coveralls.io/github/simlu/aqi-monitor?branch=master)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=simlu/aqi-monitor)](https://dependabot.com)
[![Dependencies](https://david-dm.org/simlu/aqi-monitor/status.svg)](https://david-dm.org/simlu/aqi-monitor)
[![Gardener](https://github.com/simlu/js-gardener/blob/master/assets/badge.svg)](https://github.com/simlu/js-gardener)

# AQI Monitor

Monitor AQI using AWS Lambda

## Deploy

```bash
npm t && npm run clean-build && sls deploy --city=CITY && npm run clean
```
