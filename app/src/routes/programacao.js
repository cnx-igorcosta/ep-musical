import express from 'express';
import fs from 'fs';
import nextIdModule from '../util/next-id';

const router = express.Router();
const nextId = nextIdModule('Programacao');

//GET
router.get('/:nome?/:dia_semana?',(req, res, next) => {

  const nome = req.query.nome;
  const dia_semana = req.query.dia_semana;

  req.getConnection((err, connection) => {
    if(err) erro('na conexao com o banco de dados', err, res);

    let query =
    `SELECT
      id,
      nome,
      dia_semana,
      hora_inicial,
      hora_final,
      descricao,
      logo
    FROM
      Programacao
    WHERE
      0 = 0`;
    if(nome){
      query += ` AND nome LIKE ${connection.escape('%'+nome+'%')}`;
    }
    if(dia_semana){
      query += ` AND dia_semana = ${connection.escape(dia_semana)}`;
    }
    connection.query(query, (err, result) => {
      if(err) erro('ao buscar Programação', err, res);

      return res.status(200).json(result);
    });
  });
});

//POST
router.post('/', (req, res, next) => {
  const programacao = req.body;
  programacao.imagem = new Buffer(programacao.logo, 'base64');

  req.getConnection((err, connection) => {
    if(err) erro('na conexao com o banco de dados', err, res);
    nextId.get(connection, (err, id) => {
      if(err) erro('ao gerar Id', err, res);

      const query =
      `INSERT INTO
        Programacao
          (id, nome, dia_semana, hora_inicial, hora_final, descricao, logo)
        VALUES
          (?, ?, ?, ?, ?, ?, ?)`;

      const params = [
        id,
        programacao.nome,
        programacao.dia_semana,
        programacao.hora_inicial,
        programacao.hora_final,
        programacao.descricao,
        programacao.imagem,
      ];
      connection.query(query, params, (err, result) => {
          if(err) erro('ao inserir Programação', err, res);

          return res.status(200).json({id: result.insertId});
        });
    });
  });
});

//PUT
router.put('/', (req, res, next) => {
  const programacao = req.body;

  req.getConnection((err, connection) => {
    if(err) erro('na conexao com o banco de dados', err, res);

    const query =
    `UPDATE
      Programacao
    SET
      nome = ?, dia_semana = ?, hora = ?, descricao = ?, logo = ?
    WHERE
      id = ?`;

    const params = [
      programacao.nome,
      programacao.dia_semana,
      programacao.hora,
      programacao.descricao,
      programacao.logo,
      programacao.id
    ];

    connection.query(query, params, (err, result) => {
        if(err) erro('ao atualizar programacao', err, res);

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

// function decodeBase64Image(dataString) {
//   var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
//   var retorno = {};
//
//   if (matches.length !== 3) {
//     return new Error('Invalid input string');
//   }
//   retorno.type = matches[1];
//   retorno.data = new Buffer(matches[2], 'base64');
//   console.log('retorno: ',retorno);
//   return retorno;
// }

module.exports = router;
