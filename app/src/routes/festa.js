import express from 'express';
import nextIdModule from '../util/next-id';
//import debug from 'debug'
const router = express.Router();
const nextId = nextIdModule('Corretor');

router.get('/:nome?',(req, res, next) => {
  const nome = req.query.nome;

  req.getConnection((err, connection) => {
    if(err) erro('na conexao com o banco', err, res);

    let query = 'SELECT nome FROM Festa ';
    if(nome) {
      query += 'WHERE nome LIKE '+connection.escape('%'+nome+'%');
    }
    connection.query(query, (err, result) => {
      if(err) erro('ao buscar Festa', err, res);

      return res.status(200).json(result);
    });
  });
});

router.post('/', (req, res, next) => {
  const corretor = req.body;

  req.getConnection((err, connection) => {
    if(err) erro('na conexao com o banco', err, res);

    nextId.get(connection, (err, id) => {
      if(err) erro('ao gerar Id', err, res);

      const query = 'INSERT INTO Corretor (id, alias, email, nome, telefone, cpfCnpjCorretor, visivelAlteracaoComissao) VALUES (?, ?, ?, ?, ?, ?, ?)';
      const params = [
        id,
        corretor.alias,
        corretor.email,
        corretor.nome,
        corretor.telefone,
        corretor.cpfCnpjCorretor,
        (corretor.visivelAlteracaoComissao ? 1 : 0)
      ];
      connection.query(query, params, (err, result) => {
          if(err) erro('ao inserir Corretor', err, res);

          return res.status(200).json({id: result.insertId});
        });
    });
  });
});

router.put('/', (req, res, next) => {
  const corretor = req.body;

  req.getConnection((err, connection) => {
    if(err) erro('na conexao com o banco', err, res);

    const query = 'UPDATE Corretor SET alias = ?, email = ?, nome = ?, telefone = ?, cpfCnpjCorretor = ?, visivelAlteracaoComissao = ?  WHERE id = ?';
    const params = [
      corretor.alias,
      corretor.email,
      corretor.nome,
      corretor.telefone,
      corretor.cpfCnpjCorretor,
      (corretor.visivelAlteracaoComissao ? 1 : 0),
      corretor.id
    ];

    connection.query(query, params, (err, result) => {
        if(err) erro('ao atualizar Corretor', err, res);

        return res.status(200).json(result);
    });
  });
});

router.delete('/', (req, res, next) => {
  const id = req.query.id;
  req.getConnection((err, connection) => {
    if(err) erro('na conexao com o banco', err, res);

    connection.query('DELETE FROM Corretor WHERE id = ?', id, (err, result) => {
        if(err) erro('ao deletar Corretor', err, res);

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

function modificarVisibilidade(corretores) {
  for(var i = 0; i < corretores.length; i++){
    if(corretores[i].visivelAlteracaoComissao && corretores[i].visivelAlteracaoComissao == 1){
      corretores[i].visivelAlteracaoComissao = true;
    }else{
      corretores[i].visivelAlteracaoComissao = false;
    }
  }
}


module.exports = router;
