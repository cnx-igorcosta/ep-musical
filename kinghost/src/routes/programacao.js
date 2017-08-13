'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

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

    var query = 'SELECT\n      id,\n      nome,\n      dia_semana,\n      hora,\n      descricao,\n      logo\n    FROM\n      Programacao\n    WHERE\n      0 = 0';
    if (nome) {
      query += ' AND nome LIKE ' + connection.escape('%' + nome + '%');
    }
    if (dia_semana) {
      query += ' AND dia_semana = ' + connection.escape(dia_semana);
    }
    connection.query(query, function (err, result) {
      if (err) erro('ao buscar Programação', err, res);

      return res.status(200).json(result);
    });
  });
});

//POST
router.post('/', function (req, res, next) {
  var programacao = req.body;

  req.getConnection(function (err, connection) {
    if (err) erro('na conexao com o banco de dados', err, res);

    nextId.get(connection, function (err, id) {
      if (err) erro('ao gerar Id', err, res);

      var query = 'INSERT INTO\n        CorretorSeguradoraCanal\n          (id, nome, dia_semana, hora, descricao, logo)\n        VALUES\n          (?, ?, ?, ?, ?, ?)';

      var params = [id, programacao.nome, programacao.dia_semana, programacao.hora, programacao.descricao, programacao.logo];
      console.log(params);
      connection.query(query, params, function (err, result) {
        if (err) erro('ao inserir Programação', err, res);

        return res.status(200).json({ id: result.insertId });
      });
    });
  });
});

//PUT
router.put('/', function (req, res, next) {
  var programacao = req.body;

  req.getConnection(function (err, connection) {
    if (err) erro('na conexao com o banco de dados', err, res);

    var query = 'UPDATE\n      Programacao\n    SET\n      nome = ?,\n      dia_semana = ?,\n      hora = ?,\n      descricao = ?,\n      logo = ?\n    WHERE\n      id = ?';

    var params = [programacao.nome, programacao.dia_semana, programacao.hora, programacao.descricao, programacao.logo, programacao.id];

    connection.query(query, params, function (err, result) {
      if (err) erro('ao atualizar programacao', err, res);

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