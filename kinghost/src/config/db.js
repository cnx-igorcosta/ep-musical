'use strict';

var _expressMyconnection = require('express-myconnection');

var _expressMyconnection2 = _interopRequireDefault(_expressMyconnection);

var _mysql = require('mysql');

var _mysql2 = _interopRequireDefault(_mysql);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var dsv = { env: 'dsv', host: 'localhost', user: 'root', password: 'root', port: 3306, database: 'ep-musical' };
var prd = { env: 'prd', host: 'mysql.epmusicaltv.com.br', user: 'epmusicaltv', password: 'Epmusical123', port: 3306, database: 'epmusicaltv' };

function getConfig() {
  var env = process.env.NODE_ENV;
  console.log(env);
  return prd.env === env ? prd : dsv;
}

var dbConfig = getConfig();
var dbConnection = (0, _expressMyconnection2.default)(_mysql2.default, {
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  port: dbConfig.port,
  database: dbConfig.database
}, 'request');

module.exports = dbConnection;

//Epmusical123