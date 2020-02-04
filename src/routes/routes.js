var express = require('express');
var router = express.Router();
var basicRoutes = require('./basicRoutes');

router.route('/').get(basicRoutes.start);
router.route('*').get(basicRoutes.start);
router.route('/getUserList').post(basicRoutes.getUserList);
router.route('/getItems').post(basicRoutes.getItems);
router.route('/addUser').post(basicRoutes.addUser);
router.route('/saveDrink').post(basicRoutes.saveDrink);
router.route('/login').post(basicRoutes.login);
router.route('/checkToken').post(basicRoutes.checkToken);
router.route('/createDrink').post(basicRoutes.createDrink);
router.route('/setUserAsHost').post(basicRoutes.setUserAsHost);
router.route('/checkHost').post(basicRoutes.checkHost);


module.exports = router;