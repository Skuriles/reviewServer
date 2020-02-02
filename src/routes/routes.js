var express = require('express');
var router = express.Router();
var basicRoutes = require('./basicRoutes');

router.route('/').get(basicRoutes.start);
router.route('*').get(basicRoutes.start);
router.route('/getUserList').post(basicRoutes.getUserList);
router.route('/getItems').post(basicRoutes.getItems);

module.exports = router;