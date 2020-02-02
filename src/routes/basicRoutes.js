var fs = require("fs");
var path = require("path");

module.exports = {
    start: (req, res) => {
        res.sendFile(path.resolve(__dirname + "/../public/index.html"));
    },
    getUserList: (req, res) => {
        getUserList(req, res);
    },
    getItems: (req, res) => {
        getItems(req, res);
    },
};

function getUserList(req, res) {
    res.send("test");
    return;
};

function getItems(req, res) {
    var list = [];
    for (let i = 0; i < 3; i++) {
        var item = {
            name: "drink" + i,
            id: i + 1
        }
        list.push(item);
    }

    res.send(list);
    return;
};