[![Build Status](https://img.shields.io/travis/simlu/aqi-monitor/master.svg)](https://travis-ci.org/simlu/aqi-monitor)
[![Test Coverage](https://img.shields.io/coveralls/simlu/aqi-monitor/master.svg)](https://coveralls.io/github/simlu/aqi-monitor?branch=master)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=simlu/aqi-monitor)](https://dependabot.com)
[![Dependencies](https://david-dm.org/simlu/aqi-monitor/status.svg)](https://david-dm.org/simlu/aqi-monitor)
[![Gardener](https://github.com/blackflux/js-gardener/blob/master/assets/badge.svg)](https://github.com/blackflux/js-gardener)

# AQI Monitor

Monitor AQI using AWS Lambda

Notifies Slack Channel with Status Message when the level changes.

Allows monitoring of multiple Cities by using multiple deploys.

Only works for Cities from [BC](https://envistaweb.env.gov.bc.ca/).

## How can I run this for my slack team?

Very easy! Just follow the instructions below for setup and testing. Then configure a city and deploy.

## Setup and Testing

Requires [npm](https://www.npmjs.com/) and [serverless framework](https://serverless.com/) to be installed globally.

### Install Dependencies and Test

In your project folder run

```sh
npm install
```

then 

```sh
npm test
```

This project uses [js-gardener](https://github.com/simlu/js-gardener) and [lambda-tdd](https://github.com/simlu/lambda-tdd). More details on testing and debuggging are documented under those projects.

## Configure a City / Workspace

1) Create config with under `config/[FILL CONFIG NAME].yml`
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
Go to [https://envistaweb.env.gov.bc.ca/](https://envistaweb.env.gov.bc.ca/), 
search for the desired station, click it and then copy the corresponding number from the url, e.g. `9` for` `Kelowna College`.

### Rollbar Access Token
Sign up for [Rollbar](https://rollbar.com/signup/), create a new Project and use a server token. This is optional - if you prefer not to enable monitoring you can simply set this to an empty string (`""`).

### Slack Channel
Pick a Channel from your slack workspace.

### Slack Workspace
Use your Slack Workspace.

### Slack Session Token
Follow the instructions provided [here](https://github.com/simlu/slack-sdk#obtaining-user-session-token).

## Deploy

Requires you to have an AWS account setup and credentials configured.

```bash
npm t && npm run clean-build && sls deploy --config=[FILL CONFIG NAME] && npm run clean
```
