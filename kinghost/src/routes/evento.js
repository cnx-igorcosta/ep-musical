'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _pngToJpeg = require('png-to-jpeg');

var _pngToJpeg2 = _interopRequireDefault(_pngToJpeg);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _nextId = require('../util/next-id');

var _nextId2 = _interopRequireDefault(_nextId);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();
var nextIdEvento = (0, _nextId2.default)('evento');
var nextIdImagem = (0, _nextId2.default)('imagem');

//GET
router.get('/:nome?/:endereco?', function (req, res, next) {
  var nome = req.query.nome;
  var endereco = req.query.endereco;
  req.getConnection(function (err, connection) {
    if (err) erro('na conexao com o banco de dados', err, res);

    var query = 'SELECT\n      id, nome, dataHora, endereco, preco, musicas, descricao\n    FROM Evento WHERE 0 = 0';
    if (nome) {
      query += ' AND nome LIKE ' + connection.escape('%' + nome + '%');
    }
    if (endereco) {
      query += ' AND endereco LIKE ' + connection.escape('%' + endereco + '%');
    }
    connection.query(query, function (err, eventos) {
      if (err) erro('ao buscar Evento', err, res);
      return res.status(200).json(eventos);
      //buscarImagensEvento(res, connection, eventos);
    });
  });
});

router.get('/imagens:idEvento', function (req, res, next) {
  var idEvento = req.query.idEvento;
  req.getConnection(function (err, connection) {
    if (err) erro('na conexao com o banco de dados', err, res);
    var query = 'SELECT id, imagem, idEvento FROM Imagem WHERE idEvento = ' + connection.escape(idEvento);
    connection.query(query, function (err, imagens) {
      if (err) erro('ao buscar imagens do Evento' + evento.nome, err, res);
      evento.imagens = blobToBase64(imagens);
      if (count >= eventos.length) {
        return res.status(200).json(eventos);
      }
    });
  });
});

function buscarImagensEvento(res, connection, eventos) {
  var count = 0;

  var _loop = function _loop(i) {
    var evento = eventos[i];
    var query = 'SELECT id, imagem, idEvento FROM Imagem WHERE idEvento = ' + connection.escape(evento.id);
    connection.query(query, function (err, imagens) {
      if (err) erro('ao buscar imagens do Evento' + evento.nome, err, res);
      evento.imagens = blobToBase64(imagens);
      if (count >= eventos.length) {
        return res.status(200).json(eventos);
      }
    });
  };

  for (var i = 0; i < eventos.length; i++) {
    _loop(i);
  }
}

function tratarImagem(base64Image, callback) {
  if (base64Image.indexOf('image/png') != -1) {
    var buffer = new Buffer(base64Image.split(/,\s*/)[1], 'base64');
    (0, _pngToJpeg2.default)({ quality: 90 })(buffer).then(function (output) {
      callback(output);
    });
  } else {
    var _buffer = new Buffer(base64Image, 'base64');
    callback(_buffer);
  }
}

//POST
router.post('/', function (req, res, next) {
  var evento = req.body;
  try {
    evento.descricao = limitarDescricao(evento.descricao);
    evento.dataHora = (0, _moment2.default)(evento.dataHora).format("YYYY-MM-DD HH:mm:ss");
    req.getConnection(function (err, connection) {
      if (err) erro('na conexao com o banco de dados', err, res);
      nextIdEvento.get(connection, function (err, id) {
        if (err) erro('ao gerar Id', err, res);

        evento.id = id;
        var query = 'INSERT INTO Evento\n            (id, nome, dataHora, endereco, preco, musicas, descricao)\n          VALUES (?, ?, ?, ?, ?, ?, ?)';

        var params = [evento.id, evento.nome, evento.dataHora, evento.endereco, evento.preco, evento.musicas, evento.descricao];
        connection.query(query, params, function (err, result) {
          if (err) erro('ao inserir Evento', err, res);

          cadastrarImagemEvento(evento, connection, res);
        });
      });
    });
  } catch (err) {
    erro('ao inserir Evento', err, res);
  }
});

function cadastrarImagemEvento(evento, connection, res) {
  if (evento.imagens && evento.imagens.length) {
    (function () {
      var contador = 0;
      var idImagem = 0;
      for (var i = 0; i < evento.imagens.length; i++) {
        var img = evento.imagens[i];
        tratarImagem(img, function (output) {
          nextIdImagem.get(connection, function (err, id) {
            if (err) erro('ao gerar Id', err, res);

            idImagem = idImagem == 0 ? id : idImagem;
            var query = 'INSERT INTO Imagem (id, imagem, idEvento) VALUES (?, ?, ?)';
            var params = [idImagem, output, evento.id];
            idImagem++;
            connection.query(query, params, function (err, result) {
              if (err) erro('ao inserir Evento', err, res);
              contador++;
              if (contador == evento.imagens.length) {
                return res.status(200).json({});
              }
            });
          });
        });
      }
    })();
  } else {
    return res.status(200).json({});
  }
}

//PUT
router.put('/', function (req, res, next) {
  var programacao = req.body;
  console.log(programacao);
  tratarImagem(programacao.logo, function (output) {
    programacao.imagem = output;
    programacao.descricao = limitarDescricao(programacao.descricao);
    req.getConnection(function (err, connection) {
      if (err) erro('na conexao com o banco de dados', err, res);

      var query = 'UPDATE Programacao\n       SET nome = ?, dia_semana = ?, hora_inicial = ?, hora_final =?, descricao = ?, logo = ?\n       WHERE id = ?';

      var params = [programacao.nome, programacao.dia_semana, programacao.hora_inicial, programacao.hora_final, programacao.descricao, programacao.imagem, programacao.id];
      connection.query(query, params, function (err, result) {
        if (err) erro('ao atualizar programacao', err, res);
        return res.status(200).json(result);
      });
    });
  });
});

router.delete('/', function (req, res, next) {
  var id = req.query.id;
  req.getConnection(function (err, connection) {
    if (err) erro('na conexao com o banco', err, res);

    connection.query('DELETE FROM Programacao WHERE id = ?', id, function (err, result) {
      if (err) erro('ao deletar Programação', err, res);

      return res.status(200).json(result);
    });
  });
});

function erro(mensagem, err, res) {
  console.log('Erro  ' + mensagem, err);
  var retornoErro = {
    mensagem: mensagem,
    serverError: err
  };
  res.status(400).json(retornoErro);
}

function blobToBase64(imagensBlob) {
  var imagens = [];
  for (var i = 0; i < imagensBlob.length; i++) {
    var img = imagensBlob[i].imagem;
    imagens.push(new Buffer(img, 'binary').toString('base64'));
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
  if (descricao && descricao.length > 500) {
    return descricao.substring(0, 499);
  }
  return descricao;
}

module.exports = router;