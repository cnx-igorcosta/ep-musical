import expressPromiseRouter from 'express-promise-router'
import fs from 'fs';
import pngToJpeg from 'png-to-jpeg';
import moment from 'moment';
import nextIdModule from '../util/next-id';

const router = expressPromiseRouter();
const nextIdEvento = nextIdModule('evento');
const nextIdImagem = nextIdModule('imagem');

//GET
router.get('/:nome?/:endereco?', (req, res, next) => {
  const evento = { nome: req.query.nome, endereco: req.query.endereco }
  const contexto = { evento , req }
  return Promise.resolve(contexto)
    .then(connect)
    .then(listarEventos)
    .then(contexto => res.status(200).json(contexto.eventos))
    .catch(err => handleError(err, res, 'Erro ao buscar eventos'))
})
//POST
router.post('/', (req, res, next) => {
  const contexto = { evento: req.body, req }
  return Promise.resolve(contexto)
    .then(tratarDataHora)
    .then(limitarDescricao)
    .then(connect)
    .then(gerarIdEvento)
    .then(inserirEvento)
    .then(tratarImagensBase64)
    .then(salvarImagens)
    .then(contexto => res.status(200).json({result: contexto.result}))
    .catch(err => handleError(err, res, 'Erro ao salvar evento'))
})
//PUT
router.put('/', (req, res, next) => {
  //TODO: EXCLUIR IMAGENS AO ATUALIZAR
  const contexto = { evento: req.body, req }
  return Promise.resolve(contexto)
    .then(tratarDataHora)
    .then(limitarDescricao)
    .then(connect)
    .then(atualizarEvento)
    .then(tratarImagensBase64)
    .then(atualizarImagens)
    .then(contexto => res.status(200).json({result: contexto.result}))
    .catch(err => handleError(err, res, 'Erro ao salvar evento'))
})
//DELETE
router.delete('/', (req, res, next) => {
  const contexto = { id: req.query.id , req }
  return Promise.resolve(contexto)
    .then(connect)
    .then(deletarImagens)
    .then(deletarEvento)
    .then(contexto => res.status(200).json({}))
    .catch(err => handleError(err, res, 'Erro ao salvar evento'))
})

const atualizarImagens = contexto => {
  const query = `UPDATE Imagem SET imagem = ? WHERE id= ?`
  return new Promise((resolve, reject) => {
    contexto.imagens.map(img => {
      const params = [ img.blob, img.id ]
      contexto.connection.query(query, params, (err, result) => {
        if(err) reject(err)
      })
    })
    resolve(contexto)
  })
}

const atualizarEvento = contexto => {
  const evento = contexto.evento
  const query = `UPDATE Evento SET
  nome = ?, dataHora = ?, endereco = ?, preco = ?, musicas = ?, descricao = ?
  WHERE id = ?`
  const params = [
    evento.nome,
    evento.dataHora,
    evento.endereco,
    evento.preco,
    evento.musicas,
    evento.descricao,
    evento.id,
  ]
  return new Promise((resolve, reject) => {
    contexto.connection.query(query, params, (err, result) => {
      if(err) reject(err)
      contexto.result = result
      resolve(contexto)
    })
  })
}

const deletarImagens = contexto => {
  return new Promise((resolve, reject) => {
    contexto.connection.query('DELETE FROM Imagem WHERE idEvento = ?', contexto.id, (err, result) => {
      if(err) reject(err)
      resolve(contexto)
    })
  })
}

const deletarEvento = contexto => {
  return new Promise((resolve, reject) => {
    contexto.connection.query('DELETE FROM Evento WHERE id = ?', contexto.id, (err, result) => {
      if(err) reject(err)
      resolve(contexto)
    })
  })
}

const listarEventos = contexto => {
  const evento = contexto.evento
  return new Promise((resolve, reject) => {
    let query = `SELECT id, nome, dataHora, endereco, preco, musicas, descricao
    FROM Evento WHERE 0 = 0`
    if(evento.nome) query += ` AND nome LIKE ${connection.escape('%'+evento.nome+'%')}`
    if(evento.endereco) query += ` AND endereco LIKE ${connection.escape('%'+evento.endereco+'%')}`
    query += ` ORDER BY dataHora desc`
    try{
      contexto.connection.query(query, (err, eventos) => {
        if(err) reject(err)
        contexto.eventos = eventos
        resolve(contexto)
      })
    } catch(err) { reject(err) }
  })
}

const salvarImagens = contexto => {
  return new Promise((resolve, reject) => {
    if(contexto.imagens && contexto.imagens.length) {
      nextIdImagem.get(contexto.connection, (err, id) => {
        if(err) reject(err)
        contexto.imagens.map(img => {
          img.id = id
          salvarImagem(img, contexto.connection)
          id++
        })
        resolve(contexto)
      })
    } else { resolve(contexto) }
  })
}

const salvarImagem = (img, connection) => {
  const query = `INSERT INTO Imagem (id, imagem, idEvento) VALUES (?, ?, ?)`
  const params = [img.id, img.blob, img.idEvento]
  connection.query(query, params, (err, result) => {
    if(err) erro('ao inserir Evento', err, res)
  })
}

const tratarImagensBase64 = contexto => {
  const evento = contexto.evento
  return new Promise((resolve, reject) => {
    try{
      if(evento.imagens && evento.imagens.length) {
        contexto.imagens = evento.imagens.map(img =>{
            return {
              id: img.id,
              blob: tratarImagem(img),
              idEvento: evento.id
            }
          })
        resolve(contexto)
      } else { resolve(contexto) }
    } catch(err) { reject(err) }
  })
}

const tratarImagem = img => {
    if(img.indexOf('image/png') != -1){
      const buffer = new Buffer(img.split(/,\s*/)[1],'base64')
      pngToJpeg({quality: 90})(buffer).
        then(tratada => tratada);
    }else {
      const buffer = new Buffer(img, 'base64')
      return (buffer);
    }
}

const inserirEvento = contexto => {
  return new Promise((resolve, reject) => {
    const evento = contexto.evento
    const query = `INSERT INTO Evento
                  (id, nome, dataHora, endereco, preco, musicas, descricao)
                   VALUES (?, ?, ?, ?, ?, ?, ?)`
    const params = [
      evento.id,
      evento.nome,
      evento.dataHora,
      evento.endereco,
      evento.preco,
      evento.musicas,
      evento.descricao,
    ]
    contexto.connection.query(query, params, (err, result) => {
      if(err) reject(err)
      contexto.result = result
      resolve(contexto)
    })
  })
}

const gerarIdEvento = contexto => {
  return new Promise((resolve, reject) => {
    nextIdEvento.get(contexto.connection, (err, id) => {
      if(err) reject(err)
      contexto.evento.id = id
      resolve(contexto)
    })
  })
}

const connect = contexto => {
  return new Promise((resolve, reject) => {
    contexto.req.getConnection((err, connection) => {
      if(err) reject(err)
      contexto.connection = connection
      resolve(contexto)
    })
  })
}

const tratarDataHora = contexto => {
  return new Promise((resolve, reject) =>{
    try{
      contexto.evento.dataHora = moment(contexto.evento.dataHora).format("YYYY-MM-DD HH:mm:ss")
      resolve(contexto)
    } catch(err) {
      console.log(`Erro ao tratar dataHora ${contexto.evento.dataHora} do evento`)
      contexto.err = err
      reject(contexto)
    }
  })
}

const limitarDescricao = (contexto) => {
  return new Promise((resolve, reject) => {
    const descricao = contexto.evento.descricao
    if(descricao && descricao.length > 500) {
      contexto.evento.descricao = descricao.substring(0,499)
    }
    resolve(contexto)
  })
}

const handleError = (err, res, mensagem) => {
    console.log(err);
    var retornoErro = { mensagem, serverError: err };
    return res.status(400).json(retornoErro);
}

module.exports = router;
