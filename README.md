[![Build Status](https://img.shields.io/travis/simlu/aqi-monitor/master.svg)](https://travis-ci.org/simlu/aqi-monitor)
[![Test Coverage](https://img.shields.io/coveralls/simlu/aqi-monitor/master.svg)](https://coveralls.io/github/simlu/aqi-monitor?branch=master)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=simlu/aqi-monitor)](https://dependabot.com)
[![Dependencies](https://david-dm.org/simlu/aqi-monitor/status.svg)](https://david-dm.org/simlu/aqi-monitor)
[![Gardener](https://github.com/simlu/js-gardener/blob/master/assets/badge.svg)](https://github.com/simlu/js-gardener)

# AQI Monitor

Monitor AQI using AWS Lambda

Notifies Slack Channel with Status Message when the level changes.

Allows monitoring of multiple Cities by using multiple deploys.

## Configure a City

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

### Region 
Pick a region from the [aws availability zones](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.RegionsAndAvailabilityZones.html).

### City
Go to [aqicn.org](http://aqicn.org), search for the desired city and then click on the "Widget" for Wordpress. Use the city id, looking something like this `@1234`.

### Rollbar Access Token
Sign up for [Rollbar](https://rollbar.com/signup/), create a new Project and use a server token. This is optional - if you prefer not to enable monitoring you can simply set this to an empty string (`""`).

### WAQI Token
Obtain from [aqicn.org](http://aqicn.org/data-platform/token/#/).

### Slack Channel
Pick a Channel from your slack workspace.

### Slack Workspace
Use your Slack Workspace.

### Slack Session Token
Follow the instructions provided [here](https://github.com/simlu/slack-sdk#obtaining-user-session-token).

## Deploy

Requires serverless framework to be installed. Use `npm i -g serverless`. Then run:

```bash
npm t && npm run clean-build && sls deploy --city=CITY && npm run clean
```
