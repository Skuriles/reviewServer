const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("db.json");
const db = low(adapter);
var jwt = require("jsonwebtoken");
const tokenHash = "hhdaii1123";
// Set some defaults (required if your JSON file is empty)
db.defaults({
    users: [],
    drinks: []
}).write();

module.exports = {
    start: (req, res) => {
        res.sendFile(path.resolve(__dirname + "/../public/index.html"));
    },
    login: (req, res) => {
        login(req, res);
    },
    checkToken: (req, res) => {
        checkToken(req, res);
    },
    getUserList: (req, res) => {
        getUserList(req, res);
    },
    getItems: (req, res) => {
        getItems(req, res);
    },
    addUser: (req, res) => {
        addUser(req, res);
    },
    saveDrink: (req, res) => {
        saveDrink(req, res);
    }
};

function login(req, res) {
    const user = req.body.user;
    const token = jwt.sign({
        name: user.name,
        pw: user.pw
    }, tokenHash);
    authenticate(token, (result) => {
        if (result) {
            res.send({
                token
            });
            return;
        }
        var users = db.get("users").value();
        if (nameAlreadyExist(users, user.name)) {
            res.send(null);
            return;
        }
        var id = getNextId(users);
        var newUser = {
            id: id,
            name: user.name,
            pw: user.pw,
            drinks: []
        };
        db.get("users")
            .push(newUser)
            .write();
        res.send({
            token
        });
        return;
    });
}

function checkToken(req, res) {
    authenticate(req.body.token, (result) => {
        res.send(result);
    });
}

function authenticate(token, callback) {
    return jwt.verify(token, tokenHash, function (err, decoded) {
        if (err && err.length > 0) {
            callback(false);
        }
        const dbUser = db.get("users")
            .find({
                name: decoded.name,
                pw: decoded.pw
            })
            .value();
        if (dbUser) {
            callback(true);
        }
        callback(false);
    });

}

function getUserList(req, res) {
    var users = db.get("users").value();
    res.send(users);
}

function getItems(req, res) {
    var list = [];
    for (let i = 0; i < 3; i++) {
        var item = {
            name: "drink" + i,
            id: i + 1
        };
        list.push(item);
    }

    res.send(list);
    return;
}

function addUser(req, res) {
    // TODO check if needed
    var user = req.body.user;
    var users = db.get("users").value();
    if (nameAlreadyExist(users, user.name)) {
        res.send(null);
        return;
    }
    var id = getNextId(users);
    var user = {
        id: id,
        name: user.name,
        pw: user.pw,
        drinks: []
    };
    // Add a post
    db.get("users")
        .push(user)
        .write();
    res.send({
        token
    });
}

function saveDrink(req, res) {
    var drink = req.body.item;
    // Add a post

    db.get("users[0].drinks")
        .push(drink)
        .write();
    res.send(true);
}

function getNextId(users) {
    if (!users || users.length == 0) {
        return 1;
    }
    users.sort(compareUsers);
    const lastId = 0;
    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        if (i == 0 && user.id != 1) {
            return 1;
        }
        if (lastId + 1 != user.id) {
            return lastId + 1;
        }
    }
}

function compareUsers(a, b) {
    if (a.id < b.id) {
        return -1;
    }
    if (a.id > b.id) {
        return 1;
    }
    return 0;
}

function nameAlreadyExist(users, name) {
    for (const user of users) {
        if (user.name.toLowerCase() == name.toLowerCase()) {
            return true;
        }
    }
    return false;
}