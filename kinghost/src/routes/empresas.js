'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _nextId = require('../util/next-id');

var _nextId2 = _interopRequireDefault(_nextId);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//import debug from 'debug'
var router = _express2.default.Router();
var nextId = (0, _nextId2.default)('Empresa');

router.get('/', function (req, res, next) {
  req.getConnection(function (err, connection) {
    if (err) erro('na conexao com o banco', err, res);

    var query = 'SELECT * FROM Empresa';
    connection.query(query, [], function (err, result) {
      if (err) erro('ao listar Empresa ', err, res);

      return res.status(200).json(result);
    });
  });
});

router.get('/:nome', function (req, res, next) {
  var nome = req.params.nome.toUpperCase();

  req.getConnection(function (err, connection) {
    if (err) erro('na conexao com o banco', err, res);

    var query = 'SELECT * FROM Empresa WHERE nome LIKE ' + connection.escape('%' + nome + '%');
    connection.query(query, function (err, result) {
      if (err) erro('ao buscar Empresa de nome: ' + nome, err, res);

      return res.status(200).json(result);
    });
  });
});

router.post('/', function (req, res, next) {
  var params = req.body;

  req.getConnection(function (err, connection) {
    if (err) erro('na conexao com o banco', err, res);

    nextId.get(connection, function (err, id) {
      if (err) erro('ao gerar Id', err, res);

      var query = 'INSERT INTO Empresa (id, nome) VALUES (?, ?)';
      var params = [id, nome];
      connection.query(query, params, function (err, result) {
        if (err) erro('ao inserir Empresa', err, res);

        return res.status(200).json({ id: result.insertId });
      });
    });
  });
});

router.put('/:id/:nome', function (req, res, next) {
  req.getConnection(function (err, connection) {
    if (err) erro('na conexao com o banco', err, res);

    var query = 'UPDATE Empresa SET nome = ? WHERE id = ?';
    var params = [req.body.nome, req.params.id];
    connection.query(query, params, function (err, result) {
      if (err) erro('ao atualizar Empresa', err, res);

      return res.status(200).json(result);
    });
  });
});

router.delete('/:id', function (req, res, next) {

  req.getConnection(function (err, connection) {
    if (err) erro('na conexao com o banco', err, res);

    var query = 'DELETE FROM Empresa WHERE id = ?';
    var id = req.params.id;
    connection.query(query, id, function (err, result) {
      if (err) erro('ao deletar Empresa', err, res);

      return res.status(200).json(result);
    });
  });
});

function erro(mensagem, err, res) {
  console.log('Erro ' + mensagem, err);
  var retornoErro = {
    mensagem: mensagem,
    serverError: err
  };
  res.status(400).json(retornoErro);
}

module.exports = router;