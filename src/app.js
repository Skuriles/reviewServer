var express = require("express");
var path = require("path");
var basicRoutes = require('./routes/routes');
var app = express();
var port = 3000;

app.use('/api', basicRoutes);
app.use('/public', express.static(path.join(__dirname, 'public')));

//default route:
app.get('*', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});


app.listen(port, function () {
    console.log("Review app listening on port " + port + "!");
});