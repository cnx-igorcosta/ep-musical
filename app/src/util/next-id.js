const nextId = tabela => {
  return {
    get: (connection, callback)  => {
      connection.query('SELECT MAX(id) as id FROM '+ tabela, (err, retorno) => {
          if(err) callback(err);

          let id = retorno[0].id;
          callback(null, ++id);
        });
      }
    }
  }

module.exports = nextId;
