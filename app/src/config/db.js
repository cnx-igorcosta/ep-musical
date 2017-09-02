import connection from 'express-myconnection'
import mysql from 'mysql';

const dsv = {env:'dsv', host: 'localhost',  user: 'root', password : 'root', port: 3306,database: 'ep-musical'};
const prd = {env:'prd', host: 'mysql.epmusicaltv.com.br',  user: 'epmusicaltv', password : 'Epmusical123', port: 3306, database: 'epmusicaltv'};

function getConfig() {
  const env = process.env.NODE_ENV;
  console.log(env);
  return (prd.env === env ? prd : dsv);
}

const dbConfig = getConfig();
const dbConnection =  connection(mysql,{
  host: dbConfig.host,
  user: dbConfig.user,
  password : dbConfig.password,
  port : dbConfig.port,
  database:dbConfig.database
},'request');

module.exports = dbConnection;

//Epmusical123
