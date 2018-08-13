// eslint-disable-next-line import/no-extraneous-dependencies
const gardener = require('js-gardener');

if (require.main === module) {
  gardener({
    author: "Lukas Siemon",
    badges: {
      skip: ["npm", "downloads", "semantic"]
    }
  }).catch(() => process.exit(1));
}
