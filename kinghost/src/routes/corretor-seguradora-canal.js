'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _nextId = require('../util/next-id');

var _nextId2 = _interopRequireDefault(_nextId);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//import debug from 'debug'
var router = _express2.default.Router();
var nextId = (0, _nextId2.default)('CorretorSeguradoraCanal');

router.get('/:canal_id?/:corretor_id?/:seguradora_id?/:parametros_id?/:operacao?', function (req, res, next) {

  var canal_id = req.query.canal_id;
  var corretor_id = req.query.corretor_id;
  var seguradora_id = req.query.seguradora_id;
  var parametros_id = req.query.parametros_id;
  var operacao = req.query.operacao;

  req.getConnection(function (err, connection) {
    if (err) erro('na conexao com o banco', err, res);

    var query = 'SELECT * FROM CorretorSeguradoraCanal WHERE 0 = 0 ';
    if (canal_id) {
      query += 'AND canal_id LIKE ' + connection.escape('%' + canal_id + '%');
    }
    if (corretor_id) {
      query += 'AND corretor_id = ' + connection.escape(corretor_id);
    }
    if (seguradora_id) {
      query += 'AND seguradora_id LIKE ' + connection.escape('%' + seguradora_id + '%');
    }
    if (parametros_id) {
      query += 'AND parametros_id = ' + connection.escape(parametros_id);
    }
    if (operacao) {
      query += 'AND operacao LIKE ' + connection.escape('%' + operacao + '%');
    }
    connection.query(query, function (err, result) {
      if (err) erro('ao buscar Corretor Seguradora Canal', err, res);

      return res.status(200).json(result);
    });
  });
});

router.post('/', function (req, res, next) {
  var canal = req.body;

  req.getConnection(function (err, connection) {
    if (err) erro('na conexao com o banco', err, res);

    nextId.get(connection, function (err, id) {
      if (err) erro('ao gerar Id', err, res);

      var query = 'INSERT INTO CorretorSeguradoraCanal (id, canal_id, corretor_id, seguradora_id, parametros_id, operacao) VALUES (?, ?, ?, ?, ?, ?)';
      var params = [id, canal.canal_id, canal.corretor_id, canal.seguradora_id, canal.parametros_id, canal.operacao];
      console.log(params);
      connection.query(query, params, function (err, result) {
        if (err) erro('ao inserir Corretor Seguradora Canal', err, res);

        return res.status(200).json({ id: result.insertId });
      });
    });
  });
});

router.put('/', function (req, res, next) {
  var canal = req.body;

  req.getConnection(function (err, connection) {
    if (err) erro('na conexao com o banco', err, res);

    var query = 'UPDATE CorretorSeguradoraCanal SET canal_id = ?, corretor_id = ?, seguradora_id = ?, parametros_id = ?, operacao = ? WHERE id = ?';
    var params = [canal.canal_id, canal.corretor_id, canal.seguradora_id, canal.parametros_id, canal.operacao, canal.id];

    connection.query(query, params, function (err, result) {
      if (err) erro('ao atualizar Corretor Seguradora Canal', err, res);

      return res.status(200).json(result);
    });
  });
});

router.delete('/', function (req, res, next) {
  var id = req.query.id;
  req.getConnection(function (err, connection) {
    if (err) erro('na conexao com o banco', err, res);

    connection.query('DELETE FROM CorretorSeguradoraCanal WHERE id = ?', id, function (err, result) {
      if (err) erro('ao deletar Corretor Seguradora Canal', err, res);

      return res.status(200).json(result);
    });
  });
});

function erro(mensagem, err, res) {
  //debug('Erro ' + mensagem, err);
  console.log('Erro ' + mensagem, err);
  var retornoErro = {
    mensagem: mensagem,
    serverError: err
  };
  res.status(400).json(retornoErro);
}

module.exports = router;