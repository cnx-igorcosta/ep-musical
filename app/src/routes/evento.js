import express from 'express';
import fs from 'fs';
import pngToJpeg from 'png-to-jpeg';
import moment from 'moment';
import nextIdModule from '../util/next-id';

const router = express.Router();
const nextIdEvento = nextIdModule('Evento');
const nextIdImagem = nextIdModule('Imagem');

//GET
router.get('/:nome?/:endereco?',(req, res, next) => {

  const nome = req.query.nome;
  const endereco = req.query.endereco;

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

      blobToBase64(result);
      return res.status(200).json(result);
    });
  });
});

function tratarImagem(base64Image, callback) {
  if(base64Image.indexOf('image/png') != -1){
    const buffer = new Buffer(base64Image.split(/,\s*/)[1],'base64');
    pngToJpeg({quality: 90})(buffer).
    then(output => {callback(output)});
  }else {
    const buffer = new Buffer(base64Image, 'base64');
    callback(buffer);
  }
}

//POST
router.post('/', (req, res, next) => {
  const evento = req.body;
  try{
    // tratarImagem(programacao.logo, output => {
    //   programacao.imagem = output;
      evento.descricao = limitarDescricao(evento.descricao);
      req.getConnection((err, connection) => {
        if(err) erro('na conexao com o banco de dados', err, res);
        nextId.get(connection, (err, id) => {
          if(err) erro('ao gerar Id', err, res);

          const query =
          `INSERT INTO Evento
            (id, nome, dataHora, endereco, preco, musicas, descricao)
          VALUES (?, ?, ?, ?, ?, ?, ?)`;

          const params = [
            id,
            evento.nome,
            evento.dataHora,
            evento.endereco,
            evento.preco,
            evento.musicas,
            evento.descricao,
          ];
          connection.query(query, params, (err, result) => {
            if(err) erro('ao inserir Evento', err, res);

            return res.status(200).json({id: result.insertId});
          });
        });
      });
    // });
  } catch(err) {
    erro('ao inserir Evento', err, res);
  }
});

//PUT
router.put('/', (req, res, next) => {
  const programacao = req.body;
  console.log(programacao);
  tratarImagem(programacao.logo, output => {
    programacao.imagem = output;
    programacao.descricao = limitarDescricao(programacao.descricao);
    req.getConnection((err, connection) => {
      if(err) erro('na conexao com o banco de dados', err, res);

      const query =
      `UPDATE Programacao
       SET nome = ?, dia_semana = ?, hora_inicial = ?, hora_final =?, descricao = ?, logo = ?
       WHERE id = ?`;

      const params = [
        programacao.nome,
        programacao.dia_semana,
        programacao.hora_inicial,
        programacao.hora_final,
        programacao.descricao,
        programacao.imagem,
        programacao.id
      ];
      connection.query(query, params, (err, result) => {
          if(err) erro('ao atualizar programacao', err, res);
          return res.status(200).json(result);
      });
    });
  });
});

router.delete('/', (req, res, next) => {
  const id = req.query.id;
  req.getConnection((err, connection) => {
    if(err) erro('na conexao com o banco', err, res);

    connection.query('DELETE FROM Programacao WHERE id = ?', id, (err, result) => {
        if(err) erro('ao deletar Programação', err, res);

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

function blobToBase64(programas) {
  for(let i = 0; i < programas.length; i++) {
    let programa = programas[i];
    if(programa.logo){
      programa.logo = new Buffer( programa.logo, 'binary' ).toString('base64');
    }
  }
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

function limitarDescricao(descricao) {
  if(descricao && descricao.length > 500) {
    return descricao.substring(0,499);
  }
  return descricao;
}

module.exports = router;
