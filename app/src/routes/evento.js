import express from 'express';
import fs from 'fs';
import pngToJpeg from 'png-to-jpeg';
import moment from 'moment';
import nextIdModule from '../util/next-id';

const router = express.Router();
const nextIdEvento = nextIdModule('evento');
const nextIdImagem = nextIdModule('imagem');

//GET
router.get('/:nome?/:endereco?',(req, res, next) => {
  const nome = req.query.nome;
  const endereco = req.query.endereco;
  req.getConnection((err, connection) => {
    if(err) erro('na conexao com o banco de dados', err, res);

    let query =
    `SELECT
      id, nome, dataHora, endereco, preco, musicas, descricao
    FROM Evento WHERE 0 = 0`;
    if(nome){
      query += ` AND nome LIKE ${connection.escape('%'+nome+'%')}`;
    }
    if(endereco){
    query += ` AND endereco LIKE ${connection.escape('%'+endereco+'%')}`;
    }
    connection.query(query, (err, eventos) => {
      if(err) erro('ao buscar Evento', err, res);
      return res.status(200).json(eventos);
      //buscarImagensEvento(res, connection, eventos);
    });
  });
});

router.get('/imagens:idEvento', (req, res, next) => {
  const idEvento = req.query.idEvento;
  req.getConnection((err, connection) => {
    if(err) erro('na conexao com o banco de dados', err, res);
    let query = `SELECT id, imagem, idEvento FROM Imagem WHERE idEvento = ${connection.escape(idEvento)}`;
    connection.query(query, (err, imagens) => {
      if(err) erro('ao buscar imagens do Evento' + evento.nome, err, res);
      evento.imagens = blobToBase64(imagens);
      if(count >= eventos.length) {
        return res.status(200).json(eventos);
      }
    });
  });
});


function buscarImagensEvento(res, connection, eventos) {
  let count = 0;
  for(let i=0; i<eventos.length; i++) {
    let evento = eventos[i];
    let query = `SELECT id, imagem, idEvento FROM Imagem WHERE idEvento = ${connection.escape(evento.id)}`;
    connection.query(query, (err, imagens) => {
      if(err) erro('ao buscar imagens do Evento' + evento.nome, err, res);
      evento.imagens = blobToBase64(imagens);
      if(count >= eventos.length) {
        return res.status(200).json(eventos);
      }
    });
  }
}

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
      evento.descricao = limitarDescricao(evento.descricao);
      evento.dataHora = moment(evento.dataHora).format("YYYY-MM-DD HH:mm:ss");
      req.getConnection((err, connection) => {
        if(err) erro('na conexao com o banco de dados', err, res);
        nextIdEvento.get(connection, (err, id) => {
          if(err) erro('ao gerar Id', err, res);

          evento.id = id;
          const query =
          `INSERT INTO Evento
            (id, nome, dataHora, endereco, preco, musicas, descricao)
          VALUES (?, ?, ?, ?, ?, ?, ?)`;

          const params = [
            evento.id,
            evento.nome,
            evento.dataHora,
            evento.endereco,
            evento.preco,
            evento.musicas,
            evento.descricao,
          ];
          connection.query(query, params, (err, result) => {
            if(err) erro('ao inserir Evento', err, res);

            cadastrarImagemEvento(evento, connection, res);
          });
        });
      });
  } catch(err) {
    erro('ao inserir Evento', err, res);
  }
});

function cadastrarImagemEvento(evento, connection, res) {
  if(evento.imagens && evento.imagens.length) {
    let contador = 0;
    let idImagem = 0;
    for(let i = 0; i < evento.imagens.length; i++) {
      const img = evento.imagens[i];
      tratarImagem(img, output => {
        nextIdImagem.get(connection, (err, id) => {
          if(err) erro('ao gerar Id', err, res);

          idImagem = idImagem == 0 ? id : idImagem;
          const query = `INSERT INTO Imagem (id, imagem, idEvento) VALUES (?, ?, ?)`;
          const params = [idImagem, output, evento.id];
          idImagem++;
          connection.query(query, params, (err, result) => {
            if(err) erro('ao inserir Evento', err, res);
            contador++;
            if(contador == evento.imagens.length){
              return res.status(200).json({});
            }
          });
        });
      });
    }
  }else{
    return res.status(200).json({});
  }
}

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

function blobToBase64(imagensBlob) {
  let imagens = [];
  for(let i = 0; i < imagensBlob.length; i++) {
    let img = imagensBlob[i].imagem;
    imagens.push(new Buffer(img, 'binary' ).toString('base64'));
  }
  return imagens;
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
