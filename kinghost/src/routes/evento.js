'use strict';

var _expressPromiseRouter = require('express-promise-router');

var _expressPromiseRouter2 = _interopRequireDefault(_expressPromiseRouter);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _pngToJpeg = require('png-to-jpeg');

var _pngToJpeg2 = _interopRequireDefault(_pngToJpeg);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _nextId = require('../util/next-id');

var _nextId2 = _interopRequireDefault(_nextId);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = (0, _expressPromiseRouter2.default)();
var nextIdEvento = (0, _nextId2.default)('evento');
var nextIdImagem = (0, _nextId2.default)('imagem');

//GET
router.get('/:nome?/:endereco?', function (req, res, next) {
  var evento = { nome: req.query.nome, endereco: req.query.endereco };
  var contexto = { evento: evento, req: req };
  return Promise.resolve(contexto).then(connect).then(listarEventos).then(function (contexto) {
    return res.status(200).json(contexto.eventos);
  }).catch(function (err) {
    return handleError(err, res, 'Erro ao buscar eventos');
  });
});
//POST
router.post('/', function (req, res, next) {
  var contexto = { evento: req.body, req: req };
  return Promise.resolve(contexto).then(tratarDataHora).then(limitarDescricao).then(connect).then(gerarIdEvento).then(inserirEvento).then(tratarImagensBase64).then(salvarImagens).then(function (contexto) {
    return res.status(200).json({ result: contexto.result });
  }).catch(function (err) {
    return handleError(err, res, 'Erro ao salvar evento');
  });
});
//PUT
router.put('/', function (req, res, next) {
  //TODO: EXCLUIR IMAGENS AO ATUALIZAR
  var contexto = { evento: req.body, req: req };
  return Promise.resolve(contexto).then(tratarDataHora).then(limitarDescricao).then(connect).then(atualizarEvento).then(tratarImagensBase64).then(atualizarImagens).then(function (contexto) {
    return res.status(200).json({ result: contexto.result });
  }).catch(function (err) {
    return handleError(err, res, 'Erro ao salvar evento');
  });
});
//DELETE
router.delete('/', function (req, res, next) {
  var contexto = { id: req.query.id, req: req };
  return Promise.resolve(contexto).then(connect).then(deletarImagens).then(deletarEvento).then(function (contexto) {
    return res.status(200).json({});
  }).catch(function (err) {
    return handleError(err, res, 'Erro ao salvar evento');
  });
});

var atualizarImagens = function atualizarImagens(contexto) {
  var query = 'UPDATE Imagem SET imagem = ? WHERE id= ?';
  return new Promise(function (resolve, reject) {
    contexto.imagens.map(function (img) {
      var params = [img.blob, img.id];
      contexto.connection.query(query, params, function (err, result) {
        if (err) reject(err);
      });
    });
    resolve(contexto);
  });
};

var atualizarEvento = function atualizarEvento(contexto) {
  var evento = contexto.evento;
  var query = 'UPDATE Evento SET\n  nome = ?, dataHora = ?, endereco = ?, preco = ?, musicas = ?, descricao = ?\n  WHERE id = ?';
  var params = [evento.nome, evento.dataHora, evento.endereco, evento.preco, evento.musicas, evento.descricao, evento.id];
  return new Promise(function (resolve, reject) {
    contexto.connection.query(query, params, function (err, result) {
      if (err) reject(err);
      contexto.result = result;
      resolve(contexto);
    });
  });
};

var deletarImagens = function deletarImagens(contexto) {
  return new Promise(function (resolve, reject) {
    contexto.connection.query('DELETE FROM Imagem WHERE idEvento = ?', contexto.id, function (err, result) {
      if (err) reject(err);
      resolve(contexto);
    });
  });
};

var deletarEvento = function deletarEvento(contexto) {
  return new Promise(function (resolve, reject) {
    contexto.connection.query('DELETE FROM Evento WHERE id = ?', contexto.id, function (err, result) {
      if (err) reject(err);
      resolve(contexto);
    });
  });
};

var listarEventos = function listarEventos(contexto) {
  var evento = contexto.evento;
  return new Promise(function (resolve, reject) {
    var query = 'SELECT id, nome, dataHora, endereco, preco, musicas, descricao\n    FROM Evento WHERE 0 = 0';
    if (evento.nome) query += ' AND nome LIKE ' + connection.escape('%' + evento.nome + '%');
    if (evento.endereco) query += ' AND endereco LIKE ' + connection.escape('%' + evento.endereco + '%');
    query += ' ORDER BY dataHora desc';
    try {
      contexto.connection.query(query, function (err, eventos) {
        if (err) reject(err);
        contexto.eventos = eventos;
        resolve(contexto);
      });
    } catch (err) {
      reject(err);
    }
  });
};

var salvarImagens = function salvarImagens(contexto) {
  return new Promise(function (resolve, reject) {
    if (contexto.imagens && contexto.imagens.length) {
      nextIdImagem.get(contexto.connection, function (err, id) {
        if (err) reject(err);
        contexto.imagens.map(function (img) {
          img.id = id;
          salvarImagem(img, contexto.connection);
          id++;
        });
        resolve(contexto);
      });
    } else {
      resolve(contexto);
    }
  });
};

var salvarImagem = function salvarImagem(img, connection) {
  var query = 'INSERT INTO Imagem (id, imagem, idEvento) VALUES (?, ?, ?)';
  var params = [img.id, img.blob, img.idEvento];
  connection.query(query, params, function (err, result) {
    if (err) erro('ao inserir Evento', err, res);
  });
};

var tratarImagensBase64 = function tratarImagensBase64(contexto) {
  var evento = contexto.evento;
  return new Promise(function (resolve, reject) {
    try {
      if (evento.imagens && evento.imagens.length) {
        contexto.imagens = evento.imagens.map(function (img) {
          return {
            id: img.id,
            blob: tratarImagem(img),
            idEvento: evento.id
          };
        });
        resolve(contexto);
      } else {
        resolve(contexto);
      }
    } catch (err) {
      reject(err);
    }
  });
};

var tratarImagem = function tratarImagem(img) {
  if (img.indexOf('image/png') != -1) {
    var buffer = new Buffer(img.split(/,\s*/)[1], 'base64');
    (0, _pngToJpeg2.default)({ quality: 90 })(buffer).then(function (tratada) {
      return tratada;
    });
  } else {
    var _buffer = new Buffer(img, 'base64');
    return _buffer;
  }
};

var inserirEvento = function inserirEvento(contexto) {
  return new Promise(function (resolve, reject) {
    var evento = contexto.evento;
    var query = 'INSERT INTO Evento\n                  (id, nome, dataHora, endereco, preco, musicas, descricao)\n                   VALUES (?, ?, ?, ?, ?, ?, ?)';
    var params = [evento.id, evento.nome, evento.dataHora, evento.endereco, evento.preco, evento.musicas, evento.descricao];
    contexto.connection.query(query, params, function (err, result) {
      if (err) reject(err);
      contexto.result = result;
      resolve(contexto);
    });
  });
};

var gerarIdEvento = function gerarIdEvento(contexto) {
  return new Promise(function (resolve, reject) {
    nextIdEvento.get(contexto.connection, function (err, id) {
      if (err) reject(err);
      contexto.evento.id = id;
      resolve(contexto);
    });
  });
};

var connect = function connect(contexto) {
  return new Promise(function (resolve, reject) {
    contexto.req.getConnection(function (err, connection) {
      if (err) reject(err);
      contexto.connection = connection;
      resolve(contexto);
    });
  });
};

var tratarDataHora = function tratarDataHora(contexto) {
  return new Promise(function (resolve, reject) {
    try {
      contexto.evento.dataHora = (0, _moment2.default)(contexto.evento.dataHora).format("YYYY-MM-DD HH:mm:ss");
      resolve(contexto);
    } catch (err) {
      console.log('Erro ao tratar dataHora ' + contexto.evento.dataHora + ' do evento');
      contexto.err = err;
      reject(contexto);
    }
  });
};

var limitarDescricao = function limitarDescricao(contexto) {
  return new Promise(function (resolve, reject) {
    var descricao = contexto.evento.descricao;
    if (descricao && descricao.length > 500) {
      contexto.evento.descricao = descricao.substring(0, 499);
    }
    resolve(contexto);
  });
};

var handleError = function handleError(err, res, mensagem) {
  console.log(err);
  var retornoErro = { mensagem: mensagem, serverError: err };
  return res.status(400).json(retornoErro);
};

module.exports = router;