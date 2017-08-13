// import express from 'express';
// import nextIdModule from '../util/next-id';
// //import debug from 'debug'
// const router = express.Router();
// const nextId = nextIdModule('ParametrosBradesco');
//
// router.get('/:codigoCorretorHomologacao?/:codigoCorretorProducao?/:codigoSucursalHomologacao?/:codigoSucursalProducao?/:loginHomologacao?/:loginProdução?/:senhaHomologacao?/:senhaProducao?/:percentualAcordoComercial?/:percentualComissao?/:percentualDesconto?/:codigoInspetoria?/:codigoTipoPessoaCorretor?/:cpfCnpjCorretor?/:percentualComissaoAPP?/:flPessoaCorretor?/:percentualComissaoRCF?',(req, res, next) => {
//
//   const codigoCorretorHomologacao = req.query.codigoCorretorHomologacao;
//   const codigoCorretorProducao = req.query.codigoCorretorProducao;
//   const codigoSucursalHomologacao = req.query.codigoSucursalHomologacao;
//   const codigoSucursalProducao = req.query.codigoSucursalProducao;
//   const loginHomologacao = req.query.loginHomologacao;
//   const loginProducao = req.query.loginProducao;
//   const percentualAcordoComercial = req.query.percentualAcordoComercial;
//   const senhaHomologacao = req.query.senhaHomologacao;
//   const percentualComissao = req.query.percentualComissao;
//   const percentualDesconto = req.query.percentualDesconto;
//   const codigoInspetoria = req.query.codigoInspetoria;
//   const codigoTipoPessoaCorretor = req.query.codigoTipoPessoaCorretor;
//   const cpfCnpjCorretor = req.query.cpfCnpjCorretor;
//   const percentualComissaoAPP = req.query.percentualComissaoAPP;
//   const flPessoaCorretor = req.query.flPessoaCorretor;
//   const percentualComissaoRCF = req.query.percentualComissaoRCF;
//
//   req.getConnection((err, connection) => {
//     if(err) erro('na conexao com o banco', err, res);
//
//     let query = 'SELECT * FROM ParametrosBradesco WHERE 0 = 0 ';
//     if(codigoCorretorHomologacao) query += ' AND codigoCorretorHomologacao = '+connection.escape(codigoCorretorHomologacao);
//     if(codigoCorretorProducao) query += ' AND codigoCorretorProducao = '+connection.escape(codigoCorretorProducao);
//     if(codigoSucursalHomologacao) query += ' AND codigoSucursalHomologacao = '+connection.escape(codigoSucursalHomologacao);
//     if(codigoSucursalProducao){ query += ' AND codigoSucursalProducao = '+connection.escape(codigoSucursalProducao);
//     if(loginHomologacao){ query += ' AND loginHomologacao = '+connection.escape(loginHomologacao);
//     if(loginProducao){ query += ' AND loginProducao = '+connection.escape(loginProducao);
//     if(percentualAcordoComercial){ query += ' AND percentualAcordoComercial = '+connection.escape(percentualAcordoComercial);
//     if(senhaHomologacao){ query += ' AND senhaHomologacao = '+connection.escape(senhaHomologacao);
//     if(percentualComissao){ query += ' AND percentualComissao = '+connection.escape(percentualComissao);
//     if(percentualDesconto){ query += ' AND percentualDesconto = '+connection.escape(percentualDesconto);
//     if(codigoInspetoria){ query += ' AND codigoInspetoria = '+connection.escape(codigoInspetoria);
//     if(codigoInspetoria){ query += ' AND codigoInspetoria = '+connection.escape(codigoInspetoria);
//     if(codigoTipoPessoaCorretor){ query += ' AND codigoTipoPessoaCorretor = '+connection.escape(codigoTipoPessoaCorretor);
//     if(cpfCnpjCorretor){ query += ' AND cpfCnpjCorretor = '+connection.escape(cpfCnpjCorretor);
//     if(percentualComissaoAPP){ query += ' AND percentualComissaoAPP = '+connection.escape(percentualComissaoAPP);
//     if(flPessoaCorretor){ query += ' AND flPessoaCorretor = '+connection.escape(flPessoaCorretor);
//     if(percentualComissaoRCF){ query += ' AND percentualComissaoRCF = '+connection.escape(percentualComissaoRCF);
//
//     connection.query(query, (err, result) => {
//       if(err) erro('ao buscar Parametros Bradesco', err, res);
//
//       return res.status(200).json(result);
//     });
//   });
// });
//
// router.post('/', (req, res, next) => {
//   const canal = req.body;
//
//   req.getConnection((err, connection) => {
//     if(err) erro('na conexao com o banco', err, res);
//
//     nextId.get(connection, (err, id) => {
//       if(err) erro('ao gerar Id', err, res);
//
//       const query = 'INSERT INTO ParametrosBradesco (id, canal_id, corretor_id, seguradora_id, parametros_id, operacao) VALUES (?, ?, ?, ?, ?, ?)';
//       const params = [
//         id,
//         canal.canal_id,
//         canal.corretor_id,
//         canal.seguradora_id,
//         canal.parametros_id,
//         canal.operacao,
//       ];
//       console.log(params);
//       connection.query(query, params, (err, result) => {
//           if(err) erro('ao inserir Corretor Seguradora Canal', err, res);
//
//           return res.status(200).json({id: result.insertId});
//         });
//     });
//   });
// });
//
// router.put('/', (req, res, next) => {
//   const canal = req.body;
//
//   req.getConnection((err, connection) => {
//     if(err) erro('na conexao com o banco', err, res);
//
//     const query = 'UPDATE ParametrosBradesco SET canal_id = ?, corretor_id = ?, seguradora_id = ?, parametros_id = ?, operacao = ? WHERE id = ?';
//     const params = [
//       canal.canal_id,
//       canal.corretor_id,
//       canal.seguradora_id,
//       canal.parametros_id,
//       canal.operacao,
//       canal.id
//     ];
//
//     connection.query(query, params, (err, result) => {
//         if(err) erro('ao atualizar Corretor Seguradora Canal', err, res);
//
//         return res.status(200).json(result);
//     });
//   });
// });
//
// router.delete('/', (req, res, next) => {
//   const id = req.query.id;
//   req.getConnection((err, connection) => {
//     if(err) erro('na conexao com o banco', err, res);
//
//     connection.query('DELETE FROM ParametrosBradesco WHERE id = ?', id, (err, result) => {
//         if(err) erro('ao deletar Corretor Seguradora Canal', err, res);
//
//         return res.status(200).json(result);
//     });
//   });
// });
//
// function erro(mensagem, err, res){
//   //debug('Erro ' + mensagem, err);
//   console.log('Erro ' + mensagem, err);
//   var retornoErro = {
//     mensagem: mensagem,
//     serverError: err
//   };
//   res.status(400).json(retornoErro);
// }
//
// module.exports = router;
"use strict";