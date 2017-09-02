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
var nextId = (0, _nextId2.default)('Programacao');

//GET
router.get('/:nome?/:dia_semana?', function (req, res, next) {

  var nome = req.query.nome;
  var dia_semana = req.query.dia_semana;

  req.getConnection(function (err, connection) {
    if (err) erro('na conexao com o banco de dados', err, res);

    var query = 'SELECT\n      id,\n      nome,\n      dia_semana,\n      hora_inicial,\n      hora_final,\n      descricao,\n      logo\n    FROM\n      Programacao\n    WHERE\n      0 = 0';
    if (nome) {
      query += ' AND nome LIKE ' + connection.escape('%' + nome + '%');
    }
    if (dia_semana) {
      query += ' AND dia_semana = ' + connection.escape(dia_semana);
    }
    connection.query(query, function (err, result) {
      if (err) erro('ao buscar Programação', err, res);

      blobToBase64(result);
      return res.status(200).json(result);
    });
  });
});

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
  var programacao = req.body;
  try {
    tratarImagem(programacao.logo, function (output) {
      programacao.imagem = output;
      programacao.descricao = limitarDescricao(programacao.descricao);
      req.getConnection(function (err, connection) {
        if (err) erro('na conexao com o banco de dados', err, res);
        nextId.get(connection, function (err, id) {
          if (err) erro('ao gerar Id', err, res);

          var query = 'INSERT INTO Programacao\n            (id, nome, dia_semana, hora_inicial, hora_final, descricao, logo)\n          VALUES (?, ?, ?, ?, ?, ?, ?)';

          var params = [id, programacao.nome, programacao.dia_semana, programacao.hora_inicial, programacao.hora_final, programacao.descricao, programacao.imagem];
          connection.query(query, params, function (err, result) {
            if (err) erro('ao inserir Programação', err, res);

            return res.status(200).json({ id: result.insertId });
          });
        });
      });
    });
  } catch (err) {
    erro('ao inserir Programação', err, res);
  }
});

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

function blobToBase64(programas) {
  for (var i = 0; i < programas.length; i++) {
    var programa = programas[i];
    if (programa.logo) {
      programa.logo = new Buffer(programa.logo, 'binary').toString('base64');
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
  if (descricao && descricao.length > 500) {
    return descricao.substring(0, 499);
  }
  return descricao;
}

module.exports = router;