'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _nextId = require('../util/next-id');

var _nextId2 = _interopRequireDefault(_nextId);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//import debug from 'debug'
var router = _express2.default.Router();
var nextId = (0, _nextId2.default)('Corretor');

router.get('/:nome?/:alias?', function (req, res, next) {
  var nome = req.query.nome;
  var alias = req.query.alias;

  req.getConnection(function (err, connection) {
    if (err) erro('na conexao com o banco', err, res);

    var query = 'SELECT * FROM Corretor ';
    if (nome) {
      query += 'WHERE nome LIKE ' + connection.escape('%' + nome + '%');
    } else if (alias) {
      query += 'WHERE alias LIKE ' + connection.escape('%' + alias + '%');
    }
    connection.query(query, function (err, result) {
      if (err) erro('ao buscar Corretor', err, res);

      modificarVisibilidade(result);
      return res.status(200).json(result);
    });
  });
});

router.post('/', function (req, res, next) {
  var corretor = req.body;

  req.getConnection(function (err, connection) {
    if (err) erro('na conexao com o banco', err, res);

    nextId.get(connection, function (err, id) {
      if (err) erro('ao gerar Id', err, res);

      var query = 'INSERT INTO Corretor (id, alias, email, nome, telefone, cpfCnpjCorretor, visivelAlteracaoComissao) VALUES (?, ?, ?, ?, ?, ?, ?)';
      var params = [id, corretor.alias, corretor.email, corretor.nome, corretor.telefone, corretor.cpfCnpjCorretor, corretor.visivelAlteracaoComissao ? 1 : 0];
      connection.query(query, params, function (err, result) {
        if (err) erro('ao inserir Corretor', err, res);

        return res.status(200).json({ id: result.insertId });
      });
    });
  });
});

router.put('/', function (req, res, next) {
  var corretor = req.body;

  req.getConnection(function (err, connection) {
    if (err) erro('na conexao com o banco', err, res);

    var query = 'UPDATE Corretor SET alias = ?, email = ?, nome = ?, telefone = ?, cpfCnpjCorretor = ?, visivelAlteracaoComissao = ?  WHERE id = ?';
    var params = [corretor.alias, corretor.email, corretor.nome, corretor.telefone, corretor.cpfCnpjCorretor, corretor.visivelAlteracaoComissao ? 1 : 0, corretor.id];

    connection.query(query, params, function (err, result) {
      if (err) erro('ao atualizar Corretor', err, res);

      return res.status(200).json(result);
    });
  });
});

router.delete('/', function (req, res, next) {
  var id = req.query.id;
  req.getConnection(function (err, connection) {
    if (err) erro('na conexao com o banco', err, res);

    connection.query('DELETE FROM Corretor WHERE id = ?', id, function (err, result) {
      if (err) erro('ao deletar Corretor', err, res);

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

function modificarVisibilidade(corretores) {
  for (var i = 0; i < corretores.length; i++) {
    if (corretores[i].visivelAlteracaoComissao && corretores[i].visivelAlteracaoComissao == 1) {
      corretores[i].visivelAlteracaoComissao = true;
    } else {
      corretores[i].visivelAlteracaoComissao = false;
    }
  }
}

module.exports = router;