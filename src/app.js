var express = require("express");
var path = require("path");
var routes = require("./routes/routes");
var app = express();
var port = 3000;

app.use(express.json());
app.use("/api", routes);
app.use("/", express.static(path.join(__dirname, "public")));

//default route:
app.get("*", function (req, res) {
  var path = __dirname + "/public/index.html";
  res.sendFile(path);
});

app.listen(port, function () {
  console.log("Review app listening on port " + port + "!");
});