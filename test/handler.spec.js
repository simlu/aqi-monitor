const path = require("path");
const lambdaTester = require("lambda-tdd")({
  cwd: path.join(__dirname, ".."),
  verbose: process.argv.slice(2).indexOf("--verbose") !== -1,
  handlerFile: path.join(__dirname, "..", "src", "handler.js"),
  cassetteFolder: path.join(__dirname, "handler", "__cassettes"),
  envVarYml: path.join(__dirname, "env.yml"),
  envVarYmlRecording: path.join(__dirname, "env.recording.yml"),
  testFolder: path.join(__dirname, "handler")
});

lambdaTester.execute((process.argv.slice(2).find(e => e.startsWith("--filter=")) || "").substring(9));
