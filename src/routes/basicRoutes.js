const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("db.json");
const db = low(adapter);
var jwt = require("jsonwebtoken");
var fs = require("fs");
const tokenHash = "hhdaii1123";
// Set some defaults (required if your JSON file is empty)
initDb();

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
  },
  finish: (req, res) => {
    finish(req, res);
  },
  checkResult: (req, res) => {
    checkResult(req, res);
  },
  getResult: (req, res) => {
    getResult(req, res);
  },
  resetAll: (req, res) => {
    resetAll(req, res);
  },
  getArchive: (req, res) => {
    getArchive(req, res);
  },
  getFileResult: (req, res) => {
    getFileResult(req, res);
  },
  getFile: (req, res) => {
    getFile(req, res);
  },
};

function initDb() {
  db.defaults({
    users: [
      {
        name: "admin",
        pw: "admin",
        id: 1,
        role: "admin",
        drinks: [],
      },
    ],
    drinks: [],
    result: [],
    checkResult: false,
  }).write();
}

function initDbAfterReset() {
  db.get("users")
    .push({
      name: "admin",
      pw: "admin",
      id: 1,
      role: "admin",
      drinks: [],
    })
    .write();
}

function resetDb() {
  db.set("users", []).write();
  db.set("drinks", []).write();
  db.set("result", []).write();
  db.set("checkResult", false).write();
}

function login(req, res) {
  const user = req.body.user;
  // nicht mit token sondern username und pw authentifizieren
  authenticate(user, (result) => {
    if (result) {
      const token = jwt.sign(
        {
          name: result.name.toLowerCase(),
          pw: result.pw,
          id: result.id,
        },
        tokenHash
      );
      res.send({
        token,
      });
      return;
    }
    var users = db.get("users").sortBy("id").value();
    if (nameAlreadyExist(users, user.name)) {
      res.send(null);
      return;
    }
    var id = getNextId(users);
    var drinks = db.get("drinks").value();
    var userDrinks = [];
    for (const drink of drinks) {
      const userDrink = {
        id: drind.id,
        name: drink.name,
        value: "",
        comment: "",
        user: drink.user,
      };
      userDrinks.push(userDrink); // make deep copy otherwise references cause strange effects in release build
    }
    var newUser = {
      id: id,
      name: user.name.toLowerCase(),
      pw: user.pw,
      role: "drinker",
      userDrinks: userDrinks,
    };
    db.get("users").push(newUser).write();
    const token = jwt.sign(
      {
        name: newUser.name.toLowerCase(),
        pw: newUser.pw,
        id: newUser.id,
      },
      tokenHash
    );
    res.send({
      token,
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
      role,
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
        pw: decoded.pw,
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
      name: user.name.toLowerCase(),
      pw: user.pw,
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
        id: decoded.id,
      })
      .get("role")
      .value();
    callback(null, role);
  } else {
    callback("Keine Rechte", "drinker");
  }
}

function getUserList(req, res) {
  verifyRole(req, (err, result) => {
    if (err || result != "admin") {
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
    var list = db
      .get("users")
      .find({
        id: result.id,
      })
      .get("userDrinks")
      .sortBy("id")
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
    var list = db.get("drinks").sortBy("id").value();
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
    const drinkId = req.body.drinkId;
    if (drinkId != null) {
      db.get("drinks")
        .remove({
          id: drinkId,
        })
        .write();
      const users = db.get("users").value();
      for (const user of users) {
        db.get("users")
          .find({
            id: user.id,
          })
          .get("userDrinks")
          .remove({
            id: drinkId,
          })
          .write();
      }
      res.send(true);
      return;
    }
    res.send(true);
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
      var drinkExist = db
        .get("drinks")
        .find({
          name: drink.name,
        })
        .value();
      if (drinkExist) {
        res.send(false);
        return;
      }
      console.log("push drink " + drink.name);
      db.get("drinks").push(drink).write();
      const users = db.get("users").value();
      for (const user of users) {
        if (user.role == "admin") {
          continue;
        }
        console.log("push userdrink " + drink.name + " for user " + user.name);
        db.get("users")
          .find({
            id: user.id,
          })
          .get("userDrinks")
          .push(drink)
          .write();
      }
      res.send(true);
    } else {
      db.get("drinks")
        .find({
          id: drink.id,
        })
        .set("user", drink.user)
        .set("name", drink.name)
        .write();
      const users = db.get("users").value();
      for (const user of users) {
        // TODO eigentlich user und name aus Drink Tabelle??!
        db.get("users")
          .find({
            id: user.id,
          })
          .get("userDrinks")
          .find({
            id: drink.id,
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
  verifyRole(req, (err, result) => {
    if (err || result != "admin") {
      return false;
    }
    var userId = req.body.id;
    var users = db.get("users").value();
    let userfound = false;
    // alten Host zurücksetzen
    for (const user of users) {
      if (user.role == "host" && user.id != userId) {
        db.get("users")
          .find({
            id: user.id,
          })
          .set("role", "drinker")
          .value();
      }
      if (user.id == userId) {
        db.get("users")
          .find({
            id: userId,
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
        id: result.id,
      })
      .get("userDrinks")
      .find({
        id: drink.id,
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
  // users.sort(compareUsers);
  if (users.length == 1) {
    return 2;
  }
  for (let i = 1; i < users.length; i++) {
    const user = users[i];
    if (i + 1 != user.id) {
      return i + 1;
    }
  }
  return users.length + 1;
}

function getNextDrinkId() {
  const drinks = db.get("drinks").sortBy("id").value();
  if (!drinks || drinks.length == 0) {
    return 1;
  }
  let id = 1;
  for (let i = 0; i < drinks.length; i++) {
    const drink = drinks[i];
    if (id != drink.id) {
      return id++;
    }
    id++;
  }
  return drinks.length + 1;
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

function finish(req, res) {
  verifyRole(req, (err, result) => {
    if (err || result != "host") {
      res.send(false);
      return;
    }
    const drinks = db.get("drinks").value();
    const users = db.get("users").value();
    var errors = [];
    var drinkMap = [];
    for (const drink of drinks) {
      var drinkValues = [];
      var map = {
        id: drink.id,
        drinkValues: [],
      };
      for (const user of users) {
        if (user.role == "admin") {
          continue;
        }
        for (const userDrink of user.userDrinks) {
          if (userDrink.id == drink.id) {
            if (userDrink.value == "" || !userDrink.value) {
              errors.push(
                user.name +
                  " hat Getränk Nr." +
                  drink.id +
                  " noch nicht bewertet"
              );
            }
            drinkValues.push(userDrink.value);
          }
        }
      }
      map.drinkValues = drinkValues;
      drinkMap.push(map);
    }
    if (errors.length > 0) {
      res.status(500).send({
        error: errors,
      });
    } else {
      var result = calcResult(drinkMap);
      db.set("checkResult", true).write();
      res.send(true);
    }
  });
}

function calcResult(drinkMap) {
  var list = [];
  for (const map of drinkMap) {
    var drinkResult = {
      id: map.id,
      value: calcValue(map.drinkValues),
    };
    list.push(drinkResult);
  }
  db.set("result", []).write();
  db.set("result", list).write();
  return list;
}

function calcValue(values) {
  var result = 0;
  for (const value of values) {
    switch (value) {
      case "0":
        result += 1;
        break;
      case "1":
        result += 1.5;
        break;
      case "2":
        result += 2;
        break;
      case "3":
        result += 2.5;
        break;
      case "4":
        result += 3;
        break;
      case "5":
        result += 3.5;
        break;
      case "6":
        result += 4;
        break;
      case "7":
        result += 4.5;
        break;
      case "8":
        result += 5;
        break;
      case "9":
        result += 5.5;
        break;
      case "9":
        result += 6;
        break;
      default:
        break;
    }
  }
  return Math.round((result * 100) / values.length) / 100;
}

function checkResult(req, res) {
  verifyToken(req, (err, result) => {
    if (err) {
      res.send(false);
      return;
    }
    var isFree = db.get("checkResult").value();
    res.send(isFree);
  });
}

function getResult(req, res) {
  verifyToken(req, (err, result) => {
    if (err) {
      res.send([]);
      return;
    }
    var isFree = db.get("checkResult").value();
    if (!isFree) {
      res.send([]);
      return;
    }
    var result = db.get("result").value();
    var drinkResult = buildResult(result);
    res.send(drinkResult);
  });
}

function buildResult(result) {
  var list = [];
  var drinks = db.get("drinks").value();
  for (const drink of drinks) {
    const res = {};
    res.name = drink.name;
    res.id = drink.id;
    res.user = drink.user;
    for (const drinkVal of result) {
      if (drinkVal.id == drink.id) {
        res.value = drinkVal.value;
        list.push(res);
      }
    }
  }
  list.sort(sortDrinkResult);
  return list;
}

function sortDrinkResult(a, b) {
  var valueA = a.value;
  var valueB = b.value;
  if (valueA < valueB) {
    return -1;
  }
  if (valueA > valueB) {
    return 1;
  }
  return 0;
}

function resetAll(req, res) {
  verifyRole(req, (err, result) => {
    if (err || result != "admin") {
      res.send(false);
      return;
    }
    var date = new Date();
    var fileName = getFileName(date);
    fs.rename("db.json", fileName, function (err) {
      if (err) {
        res.send(false);
        return;
      }
      resetDb();
      initDbAfterReset();
      res.send(true);
    });
  });
}

function getFileName(date) {
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDay();
  var fileName = year + "_" + month + "_" + day + "_db.json";
  if (!fs.existsSync(fileName)) {
    return fileName;
  } else {
    for (let i = 0; i < 1000; i++) {
      var newFileName = i + "-" + fileName;
      if (!fs.existsSync(newFileName)) {
        return newFileName;
      }
    }
  }
}

function getArchive(req, res) {
  verifyRole(req, (err, result) => {
    if (err || result != "admin") {
      res.send([]);
      return;
    }
    var list = [];
    fs.readdirSync("./").forEach((file) => {
      if (file.endsWith("db.json")) {
        list.push(file);
      }
    });
    res.send(list);
  });
}

function getFile(req, res) {
  verifyRole(req, (err, result) => {
    if (err || result != "admin") {
      res.send([]);
      return;
    }
    var jsonFile = fs.readFileSync(req.body.fileName);
    res.send(jsonFile);
  });
}

function getFileResult(req, res) {
  verifyRole(req, (err, result) => {
    if (err || result != "admin") {
      res.send([]);
      return;
    }
    const newAdap = new FileSync(req.body.fileName);
    const dbResult = low(newAdap);
    var result = dbResult.get("result").value();
    var list = buildResultArchive(result, dbResult);
    res.send(list);
  });
}

function buildResultArchive(result, dbResult) {
  var list = [];
  var drinks = dbResult.get("drinks").value();
  for (const drink of drinks) {
    const res = {};
    res.name = drink.name;
    res.id = drink.id;
    res.user = drink.user;
    for (const drinkVal of result) {
      if (drinkVal.id == drink.id) {
        res.value = drinkVal.value;
        list.push(res);
      }
    }
  }
  list.sort(sortDrinkResult);
  return list;
}
