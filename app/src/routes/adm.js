import express from 'express';
import fs from 'fs';
import pngToJpeg from 'png-to-jpeg';
import moment from 'moment';
import nextIdModule from '../util/next-id';


const router = express.Router();
const nextId = nextIdModule('Adm');

//GET
router.get('/',(req, res, next) => {
  req.getConnection((err, connection) => {
    if(err) erro('na conexao com o banco de dados', err, res);

    let query =
    `SELECT ped FROM Adm`;
    connection.query(query, (err, result) => {
      if(err) erro('', err, res);
      let valido = true;
      for(var i=0; i<result.length; i++) {
        if(!result[i].ped || result[i].ped == 0) {
          valido = false;
        }
      }
      console.log('passoi');
      return res.status(200).json({ped: valido});
    });
  });
});

//POST
router.post('/', (req, res, next) => {
  //PDE NEGATIVO
  try{
      req.getConnection((err, connection) => {
        if(err) erro('na conexao com o banco de dados', err, res);
        nextId.get(connection, (err, id) => {
          if(err) erro('ao gerar Id', err, res);

          const query =
          `INSERT INTO Adm
            (id, ped)
          VALUES (?, ?)`;

          const params = [
            id,
            0
          ];
          connection.query(query, params, (err, result) => {
            if(err) erro('', err, res);
            return res.status(200).json({/*id: result.insertId*/});
          });
        });
    });
  } catch(err) {
    erro('', err, res);
  }
});

//PUT
router.put('/', (req, res, next) => {
  //PDE POSITIVO
    req.getConnection((err, connection) => {
      if(err) erro('na conexao com o banco de dados', err, res);
      const query =
      `UPDATE Adm SET ped = ?`;
      const params = [1];
      connection.query(query, params, (err, result) => {
          if(err) erro('', err, res);
          return res.status(200).json(result);
      });
    });
});

function erro(mensagem, err, res){
  console.log(`Erro  ${mensagem}`, err);
  var retornoErro = {
    mensagem,
    serverError: err
  };
  res.status(400).json(retornoErro);
}

module.exports = router;
