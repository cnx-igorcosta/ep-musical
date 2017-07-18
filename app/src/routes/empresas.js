import express from 'express';
import nextIdModule from '../util/next-id';
//import debug from 'debug'
const router = express.Router();
const nextId = nextIdModule('Empresa');

router.get('/', (req, res, next) => {
  req.getConnection((err, connection) => {
    if(err) erro('na conexao com o banco', err, res);

    const query = 'SELECT * FROM Empresa';
    connection.query(query, [], (err, result) => {
      if(err) erro('ao listar Empresa ', err, res);

      return res.status(200).json(result);
    });
  });
});

router.get('/:nome', (req, res, next) => {
  const nome = req.params.nome.toUpperCase();

  req.getConnection((err, connection) => {
    if(err) erro('na conexao com o banco', err, res);

    const query = 'SELECT * FROM Empresa WHERE nome LIKE '+connection.escape('%'+nome+'%');
    connection.query(query, (err, result) => {
      if(err) erro('ao buscar Empresa de nome: '+nome, err, res);

      return res.status(200).json(result);
    });
  });
});

router.post('/', (req, res, next) => {
  const params = req.body;

  req.getConnection((err, connection) => {
    if(err) erro('na conexao com o banco', err, res);

    nextId.get(connection, (err, id) => {
      if(err) erro('ao gerar Id', err, res);

      const query = 'INSERT INTO Empresa (id, nome) VALUES (?, ?)';
      const params = [id, nome];
      connection.query(query, params, (err, result) => {
          if(err) erro('ao inserir Empresa', err, res);

          return res.status(200).json({id: result.insertId});
        });
    });
  });
});

router.put('/:id/:nome', (req, res, next) => {
  req.getConnection((err, connection) => {
    if(err) erro('na conexao com o banco', err, res);

    const query = 'UPDATE Empresa SET nome = ? WHERE id = ?';
    const params = [req.body.nome, req.params.id];
    connection.query(query, params, (err, result) => {
        if(err) erro('ao atualizar Empresa', err, res);

        return res.status(200).json(result);
    });
  });
});

router.delete('/:id', (req, res, next) => {

  req.getConnection((err, connection) => {
    if(err) erro('na conexao com o banco', err, res);

    const query = 'DELETE FROM Empresa WHERE id = ?';
    const id = req.params.id;
    connection.query(query, id, (err, result) => {
        if(err) erro('ao deletar Empresa', err, res);

        return res.status(200).json(result);
    });
  });
});


function erro(mensagem, err, res){
  console.log('Erro ' + mensagem, err);
  var retornoErro = {
    mensagem,
    serverError: err
  };
  res.status(400).json(retornoErro);
}

module.exports = router;
