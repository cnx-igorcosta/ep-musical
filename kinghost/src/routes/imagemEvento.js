'use strict';

var _expressPromiseRouter = require('express-promise-router');

var _expressPromiseRouter2 = _interopRequireDefault(_expressPromiseRouter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = (0, _expressPromiseRouter2.default)();

//GET IMAGENS EVENTO
router.get('/:idEvento?', function (req, res, next) {
  var idEvento = req.query.idEvento;
  var contexto = { idEvento: idEvento, req: req };
  contexto.imagens = [];
  return Promise.resolve(contexto).then(connect).then(listarImagensEvento).then(tratarImagensBlob).then(function (contexto) {
    return res.status(200).json(contexto.imagens);
  }).catch(function (err) {
    return handleError(err, res, 'Erro ao buscar imagens do evento');
  });
});

var connect = function connect(contexto) {
  return new Promise(function (resolve, reject) {
    contexto.req.getConnection(function (err, connection) {
      if (err) reject(err);
      contexto.connection = connection;
      resolve(contexto);
    });
  });
};

var listarImagensEvento = function listarImagensEvento(contexto) {
  var connection = contexto.connection;
  var query = 'SELECT id, imagem, idEvento FROM Imagem WHERE idEvento = ' + connection.escape(contexto.idEvento);
  return new Promise(function (resolve, reject) {
    try {
      connection.query(query, function (err, imgs) {
        if (err) erro('ao buscar imagens do Evento' + evento.nome, err, res);
        contexto.imgs = imgs;
        resolve(contexto);
      });
    } catch (err) {
      reject(err);
    }
  });
};

var tratarImagensBlob = function tratarImagensBlob(contexto) {
  var imgs = contexto.imgs;
  return new Promise(function (resolve, reject) {
    if (imgs && imgs.length) {
      try {
        var imagens = contexto.imgs.map(function (img) {
          return new Buffer(img.imagem, 'binary').toString('base64');
        });
        contexto.imagens = imagens;
        resolve(contexto);
      } catch (err) {
        reject(err);
      }
    } else {
      resolve(contexto);
    }
  });
};

var handleError = function handleError(err, res, mensagem) {
  console.log(err);
  var retornoErro = { mensagem: mensagem, serverError: err };
  return res.status(400).json(retornoErro);
};

module.exports = router;