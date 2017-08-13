import connection from 'express-myconnection'
import mysql from 'mysql';

const dbConnection =  connection(mysql,{
    host: 'localhost',
    user: 'root',
    password : 'root',
    port : 3306, //port mysql
    database:'ep-musical'
  },'request');

module.exports = dbConnection;
