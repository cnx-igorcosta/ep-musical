'use strict';

var _expressMyconnection = require('express-myconnection');

var _expressMyconnection2 = _interopRequireDefault(_expressMyconnection);

var _mysql = require('mysql');

var _mysql2 = _interopRequireDefault(_mysql);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var dbConnection = (0, _expressMyconnection2.default)(_mysql2.default, {
    host: 'localhost',
    user: 'root',
    password: 'root',
    port: 3306, //port mysql
    database: 'ep-musical'
}, 'request');

module.exports = dbConnection;