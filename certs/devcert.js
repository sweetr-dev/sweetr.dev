var path = require("path");
var fs = require("fs");

try {
  var devcert = require("devcert");
} catch {
  console.error(
    "Error: 'devcert' is not installed.\n\n" +
      "Install it globally to generate local SSL certificates:\n\n" +
      "  npm install -g devcert\n"
  );
  process.exit(1);
}

devcert
  .certificateFor(["app.sweetr.local", "api.sweetr.local"])
  .then(function (certificate) {
    fs.writeFileSync(path.resolve(__dirname, "./tls.key"), certificate.key);
    fs.writeFileSync(path.resolve(__dirname, "./tls.cert"), certificate.cert);
    console.log("SSL certificates generated successfully.");
  })
  .catch(console.error);
