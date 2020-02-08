var express = require('express');
var router = express.Router();
var basicRoutes = require('./basicRoutes');

router.route('/').get(basicRoutes.start);
router.route('*').get(basicRoutes.start);
router.route('/getUserList').post(basicRoutes.getUserList);
router.route('/getItems').post(basicRoutes.getItems);
router.route('/getHostItems').post(basicRoutes.getHostItems);
router.route('/addUser').post(basicRoutes.addUser);
router.route('/saveDrink').post(basicRoutes.saveDrink);
router.route('/login').post(basicRoutes.login);
router.route('/checkToken').post(basicRoutes.checkToken);
router.route('/createDrink').post(basicRoutes.createDrink);
router.route('/setUserAsHost').post(basicRoutes.setUserAsHost);
router.route('/checkRole').post(basicRoutes.checkRole);
router.route('/deleteDrink').post(basicRoutes.deleteDrink);
router.route('/finish').post(basicRoutes.finish);
router.route('/checkResult').post(basicRoutes.checkResult);
router.route('/getResult').post(basicRoutes.getResult);
router.route('/resetAll').post(basicRoutes.resetAll);
router.route('/getArchive').post(basicRoutes.getArchive);
router.route('/getFileResult').post(basicRoutes.getFileResult);
router.route('/getFile').post(basicRoutes.getFile);

module.exports = router;