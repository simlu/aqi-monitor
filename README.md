[![Build Status](https://img.shields.io/travis/simlu/aqi-monitor/master.svg)](https://travis-ci.org/simlu/aqi-monitor)
[![Test Coverage](https://img.shields.io/coveralls/simlu/aqi-monitor/master.svg)](https://coveralls.io/github/simlu/aqi-monitor?branch=master)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=simlu/aqi-monitor)](https://dependabot.com)
[![Dependencies](https://david-dm.org/simlu/aqi-monitor/status.svg)](https://david-dm.org/simlu/aqi-monitor)
[![Gardener](https://github.com/simlu/js-gardener/blob/master/assets/badge.svg)](https://github.com/simlu/js-gardener)

# AQI Monitor

Monitor AQI using AWS Lambda

Notifies Slack Channel with Status Message when the level changes.

Allows monitoring of multiple Cities by using multiple deploys.

Only works for Cities from [BC](https://www2.gov.bc.ca/gov/content/environment/air-land-water/air/air-quality/current-air-quality-data).

## Configure a City

1) Create config with city name under `config/CITY.yml`
2) Fill in variables

```yml
REGION: aws-deploy-region (e.g. us-west-2)
STATION: canada-bc-station-number
ROLLBAR_ACCESS_TOKEN: your-rollbar-token (optional)
SLACK_CHANNEL: your-slack-channel
SLACK_WORKSPACE: your-slack-workspace
SLACK_SESSION_TOKEN: your-slack-session-token
```

### Region 
Pick a region from the [aws availability zones](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.RegionsAndAvailabilityZones.html).

### Station
Go to [https://www2.gov.bc.ca](https://www2.gov.bc.ca/gov/content/environment/air-land-water/air/air-quality/current-air-quality-data), 
search for the desired station, click it and then copy the corresponding number from the url, e.g. `0500886` for` `Kelowna College`.

### Rollbar Access Token
Sign up for [Rollbar](https://rollbar.com/signup/), create a new Project and use a server token. This is optional - if you prefer not to enable monitoring you can simply set this to an empty string (`""`).

### Slack Channel
Pick a Channel from your slack workspace.

### Slack Workspace
Use your Slack Workspace.

### Slack Session Token
Follow the instructions provided [here](https://github.com/simlu/slack-sdk#obtaining-user-session-token).

## Deploy

Requires serverless framework to be installed. Use `npm i -g serverless`. Then run:

```bash
npm t && npm run clean-build && sls deploy --city=[FILL CITY NAME] && npm run clean
```
