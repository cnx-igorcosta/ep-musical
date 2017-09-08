'use strict';

var _expressMyconnection = require('express-myconnection');

var _expressMyconnection2 = _interopRequireDefault(_expressMyconnection);

var _mysql = require('mysql');

var _mysql2 = _interopRequireDefault(_mysql);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var dbConnection = (0, _expressMyconnection2.default)(_mysql2.default, {
  host: 'mysql.epmusicaltv.com.br',
  user: 'epmusicaltv',
  password: 'Epmusical123',
  port: 3306,
  database: 'epmusicaltv'
}, 'request');

module.exports = dbConnection;