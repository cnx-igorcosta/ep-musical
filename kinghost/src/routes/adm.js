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
var nextId = (0, _nextId2.default)('Adm');

//GET
router.get('/', function (req, res, next) {
  req.getConnection(function (err, connection) {
    if (err) erro('na conexao com o banco de dados', err, res);

    var query = 'SELECT ped FROM Adm';
    connection.query(query, function (err, result) {
      if (err) erro('', err, res);
      var valido = true;
      for (var i = 0; i < result.length; i++) {
        if (!result[i].ped || result[i].ped == 0) {
          valido = false;
        }
      }
      console.log('passoi');
      return res.status(200).json({ ped: valido });
    });
  });
});

//POST
router.post('/', function (req, res, next) {
  //PDE NEGATIVO
  try {
    req.getConnection(function (err, connection) {
      if (err) erro('na conexao com o banco de dados', err, res);
      nextId.get(connection, function (err, id) {
        if (err) erro('ao gerar Id', err, res);

        var query = 'INSERT INTO Adm\n            (id, ped)\n          VALUES (?, ?)';

        var params = [id, 0];
        connection.query(query, params, function (err, result) {
          if (err) erro('', err, res);
          return res.status(200).json({/*id: result.insertId*/});
        });
      });
    });
  } catch (err) {
    erro('', err, res);
  }
});

//PUT
router.put('/', function (req, res, next) {
  //PDE POSITIVO
  req.getConnection(function (err, connection) {
    if (err) erro('na conexao com o banco de dados', err, res);
    var query = 'UPDATE Adm SET ped = ?';
    var params = [1];
    connection.query(query, params, function (err, result) {
      if (err) erro('', err, res);
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

module.exports = router;