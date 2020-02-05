const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("db.json");
const db = low(adapter);
var jwt = require("jsonwebtoken");
const tokenHash = "hhdaii1123";
// Set some defaults (required if your JSON file is empty)
db.defaults({
    users: [{
        name: "admin",
        pw: "admin",
        id: 1,
        role: "admin",
        drinks: []
    }],
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
    getHostItems: (req, res) => {
        getHostItems(req, res);
    },
    addUser: (req, res) => {
        addUser(req, res);
    },
    saveDrink: (req, res) => {
        saveDrink(req, res);
    },
    setUserAsHost: (req, res) => {
        setUserAsHost(req, res);
    },
    createDrink: (req, res) => {
        createDrink(req, res);
    },
    checkRole: (req, res) => {
        checkRole(req, res);
    },
    deleteDrink: (req, res) => {
        deleteDrink(req, res);
    }
};

function login(req, res) {
    const user = req.body.user;
    // nicht mit token sondern username und pw authentifizieren
    authenticate(user, (result) => {
        if (result) {
            const token = jwt.sign({
                    name: result.name,
                    pw: result.pw,
                    id: result.id
                },
                tokenHash
            );
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
            role: "drinker",
            drinks: []
        };
        db.get("users")
            .push(newUser)
            .write();
        const token = jwt.sign({
                name: newUser.name,
                pw: newUser.pw,
                id: newUser.id
            },
            tokenHash
        );
        res.send({
            token
        });
        return;
    });
}

function checkToken(req, res) {
    authenticateToken(req.body.token, (result) => {
        res.send(result);
    });
}

function checkRole(req, res) {
    verifyRole(req, (err, role) => {
        res.send({
            role
        });
    });
}

function authenticateToken(token, callback) {
    return jwt.verify(token, tokenHash, function (err, decoded) {
        if (err) {
            callback(false);
            return;
        }
        const dbUser = db
            .get("users")
            .find({
                name: decoded.name,
                pw: decoded.pw
            })
            .value();
        if (dbUser) {
            callback(true);
            return;
        }
        callback(false);
    });
}

function authenticate(user, callback) {
    const dbUser = db
        .get("users")
        .find({
            name: user.name,
            pw: user.pw
        })
        .value();
    callback(dbUser);
}

function verifyToken(req, callback) {
    var token = req.headers.authorization;
    var decoded = jwt.verify(token, tokenHash);
    if (decoded) {
        callback(null, decoded);
    } else {
        callback("Token ungültig", null);
    }
}

function verifyRole(req, callback) {
    var token = req.headers.authorization;
    var decoded = jwt.verify(token, tokenHash);
    if (decoded) {
        const role = db
            .get("users")
            .find({
                id: decoded.id
            })
            .get("role")
            .value();
        callback(null, role);
    } else {
        callback("Keine Rechte", "drinker");
    }
}

function getUserList(req, res) {
    verifyToken(req, result => {
        if (!result) {
            return [];
        }
        var users = db.get("users").value();
        res.send(users);
    });
}

function getItems(req, res) {
    verifyToken(req, (err, result) => {
        if (!result) {
            return [];
        }
        var list = db.get("users")
            .find({
                id: result.id
            })
            .get("drinks")
            .value();
        res.send(list);
        return;
    });
}

function getHostItems(req, res) {
    verifyRole(req, (err, result) => {
        if (err || result !== "host") {
            return [];
        }
        var list = db.get("drinks").value();
        res.send(list);
        return;
    });
}

function deleteDrink(req, res) {
    verifyRole(req, (err, result) => {
        if (err || result != "host") {
            res.send(false);
            return;
        }
        const drink = req.body;
        if (drink.id == null) {
            const id = getNextDrinkId();
            drink.id = id;
            db.get("drinks")
                .push(drink)
                .write();
            const users = db.get("users").value();
            for (const user of users) {
                db.get("users")
                    .find({
                        id: user.id
                    })
                    .get("drinks")
                    .push(drink)
                    .write()
            }
            res.send(true);
        } else {
            db.get("drinks")
                .find({
                    id: drink.id
                })
                .set("user", drink.user)
                .set("name", drink.name);
            const users = db.get("users").value();
            for (const user of users) {
                // TODO eigentlich user und name aus Drink Tabelle??!
                db.get("users")
                    .find({
                        id: user.id
                    })
                    .get("drinks")
                    .find({
                        id: drink.id
                    })
                    .set("user", drink.user)
                    .set("name", drink.name);
            }
            db.write();

            res.send(true);
        }
    });
}

function createDrink(req, res) {
    verifyRole(req, (err, result) => {
        if (err || result != "host") {
            res.send(false);
            return;
        }
        const drink = req.body;
        if (drink.id == null) {
            const id = getNextDrinkId();
            drink.id = id;
            db.get("drinks")
                .push(drink)
                .write();
            const users = db.get("users").value();
            for (const user of users) {
                db.get("users")
                    .find({
                        id: user.id
                    })
                    .get("drinks")
                    .push(drink)
                    .write()
            }
            res.send(true);
        } else {
            db.get("drinks")
                .find({
                    id: drink.id
                })
                .set("user", drink.user)
                .set("name", drink.name)
                .write();
            const users = db.get("users").value();
            for (const user of users) {
                // TODO eigentlich user und name aus Drink Tabelle??!
                db.get("users")
                    .find({
                        id: user.id
                    })
                    .get("drinks")
                    .find({
                        id: drink.id
                    })
                    .set("user", drink.user)
                    .set("name", drink.name)
                    .write();
            }
            res.send(true);
        }
    });
}

function setUserAsHost(req, res) {
    verifyTokenAdmin(req, result => {
        if (!result) {
            return [];
        }
        var userId = req.body.id;
        var users = db.get("users").value();
        let userfound = false;
        // alten Host zurücksetzen
        for (const user of users) {
            if (user.role == "host" && user.id != userId) {
                db.get("users")
                    .find({
                        id: user.id
                    })
                    .set("role", "drinker")
                    .value();
            }
            if (user.id == userId) {
                db.get("users")
                    .find({
                        id: userId
                    })
                    .set("role", "host")
                    .value();
                userfound = true;
            }
        }
        res.send(userfound);
        return;
    });
}

function saveDrink(req, res) {
    verifyToken(req, (err, result) => {
        if (err) {
            return [];
        }
        var drink = req.body.item;
        // Add a post

        db.get("users")
            .find({
                id: result.id
            })
            .get("drinks")
            .find({
                id: drink.id
            })
            .set("value", drink.value)
            .set("comment", drink.comment)
            .write();
        res.send(true);
    });
}

function getNextId(users) {
    if (!users || users.length == 0) {
        return 1;
    }
    users.sort(compareUsers);
    let lastId = 1;
    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        if (i == 0 && user.id != 1) {
            return 1;
        }
        if (lastId + 1 != user.id) {
            return lastId + 1;
        }
        lastId++;
    }
}

function getNextDrinkId() {
    const drinks = db.get("drinks").value();
    if (!drinks || drinks.length == 0) {
        return 1;
    }
    drinks.sort(compareUsers);
    let lastId = 0;
    for (let i = 0; i < drinks.length; i++) {
        const drink = drinks[i];
        if (i == 0 && drink.id != 1) {
            return 1;
        }
        if (lastId + 1 != drink.id) {
            return lastId + 1;
        }
        lastId++;
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