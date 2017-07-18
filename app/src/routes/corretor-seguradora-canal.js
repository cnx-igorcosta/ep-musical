import express from 'express';
import nextIdModule from '../util/next-id';
//import debug from 'debug'
const router = express.Router();
const nextId = nextIdModule('CorretorSeguradoraCanal');

router.get('/:canal_id?/:corretor_id?/:seguradora_id?/:parametros_id?/:operacao?',(req, res, next) => {

  const canal_id = req.query.canal_id;
  const corretor_id = req.query.corretor_id;
  const seguradora_id = req.query.seguradora_id;
  const parametros_id = req.query.parametros_id;
  const operacao = req.query.operacao;

  req.getConnection((err, connection) => {
    if(err) erro('na conexao com o banco', err, res);

    let query = 'SELECT * FROM CorretorSeguradoraCanal WHERE 0 = 0 ';
    if(canal_id){
      query += 'AND canal_id LIKE '+connection.escape('%'+canal_id+'%');
    }
    if(corretor_id){
      query += 'AND corretor_id = '+connection.escape(corretor_id);
    }
    if(seguradora_id){
      query += 'AND seguradora_id LIKE '+connection.escape('%'+seguradora_id+'%');
    }
    if(parametros_id){
      query += 'AND parametros_id = '+connection.escape(parametros_id);
    }
    if(operacao){
      query += 'AND operacao LIKE '+connection.escape('%'+operacao+'%');
    }
    connection.query(query, (err, result) => {
      if(err) erro('ao buscar Corretor Seguradora Canal', err, res);

      return res.status(200).json(result);
    });
  });
});

router.post('/', (req, res, next) => {
  const canal = req.body;

  req.getConnection((err, connection) => {
    if(err) erro('na conexao com o banco', err, res);

    nextId.get(connection, (err, id) => {
      if(err) erro('ao gerar Id', err, res);

      const query = 'INSERT INTO CorretorSeguradoraCanal (id, canal_id, corretor_id, seguradora_id, parametros_id, operacao) VALUES (?, ?, ?, ?, ?, ?)';
      const params = [
        id,
        canal.canal_id,
        canal.corretor_id,
        canal.seguradora_id,
        canal.parametros_id,
        canal.operacao,
      ];
      console.log(params);
      connection.query(query, params, (err, result) => {
          if(err) erro('ao inserir Corretor Seguradora Canal', err, res);

          return res.status(200).json({id: result.insertId});
        });
    });
  });
});

router.put('/', (req, res, next) => {
  const canal = req.body;

  req.getConnection((err, connection) => {
    if(err) erro('na conexao com o banco', err, res);

    const query = 'UPDATE CorretorSeguradoraCanal SET canal_id = ?, corretor_id = ?, seguradora_id = ?, parametros_id = ?, operacao = ? WHERE id = ?';
    const params = [
      canal.canal_id,
      canal.corretor_id,
      canal.seguradora_id,
      canal.parametros_id,
      canal.operacao,
      canal.id
    ];

    connection.query(query, params, (err, result) => {
        if(err) erro('ao atualizar Corretor Seguradora Canal', err, res);

        return res.status(200).json(result);
    });
  });
});

router.delete('/', (req, res, next) => {
  const id = req.query.id;
  req.getConnection((err, connection) => {
    if(err) erro('na conexao com o banco', err, res);

    connection.query('DELETE FROM CorretorSeguradoraCanal WHERE id = ?', id, (err, result) => {
        if(err) erro('ao deletar Corretor Seguradora Canal', err, res);

        return res.status(200).json(result);
    });
  });
});

function erro(mensagem, err, res){
  //debug('Erro ' + mensagem, err);
  console.log('Erro ' + mensagem, err);
  var retornoErro = {
    mensagem: mensagem,
    serverError: err
  };
  res.status(400).json(retornoErro);
}

module.exports = router;
