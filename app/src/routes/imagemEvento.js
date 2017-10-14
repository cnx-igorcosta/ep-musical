import expressPromiseRouter from 'express-promise-router'
const router = expressPromiseRouter();

//GET IMAGENS EVENTO
router.get('/:idEvento', (req, res, next) => {
  const idEvento = req.params.idEvento
  const contexto = { idEvento, req }
  return Promise.resolve(contexto)
  .then(connect)
  .then(listarImagensEvento)
  .then(tratarImagensBlob)
  .then(contexto => res.status(200).json(contexto.imagens))
  .catch(err => handleError(err, res, 'Erro ao buscar imagens do evento'))
})

const connect = contexto => {
  return new Promise((resolve, reject) => {
    contexto.req.getConnection((err, connection) => {
      if(err) reject(err)
      contexto.connection = connection
      resolve(contexto)
    })
  })
}

const listarImagensEvento = contexto => {
  const connection = contexto.connection
  const query = `SELECT id, imagem, idEvento FROM Imagem WHERE idEvento = ${connection.escape(contexto.idEvento)}`
  return new Promise((resolve, reject) => {
     try{
      connection.query(query, (err, imgs) => {
        if(err) erro('ao buscar imagens do Evento' + evento.nome, err, res)
        contexto.imgs = imgs
        resolve(contexto)
      })
    } catch(err) { reject(err) }
  })
}

const tratarImagensBlob = contexto => {
  const imgs = contexto.imgs
  return new Promise((resolve, reject) => {
    if(imgs && imgs.length) {
      try{
        const imagens = contexto.imgs.map(img => new Buffer(img.imagem, 'binary').toString('base64'))
        contexto.imagens = imagens
        resolve(contexto)
      }catch(err) {
        reject(err)
      }
    }
  })
}

const handleError = (err, res, mensagem) => {
    console.log(err);
    var retornoErro = { mensagem, serverError: err }
    return res.status(400).json(retornoErro)
}

module.exports = router
