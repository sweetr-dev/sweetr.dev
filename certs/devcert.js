var path = require("path");
var fs = require("fs");
var devcert = require("devcert");

devcert
  .certificateFor(["app.sweetr.local", "api.sweetr.local"])
  .then(function (certificate) {
    fs.writeFileSync(path.resolve(__dirname, "./tls.key"), certificate.key);
    fs.writeFileSync(path.resolve(__dirname, "./tls.cert"), certificate.cert);
  })
  .catch(console.error);
