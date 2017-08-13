App.controller('parametroCtrl', function($scope, $resource){
  var paramCtrl = this;

  var ParametrosService = $resource('/parametros/', null, {
    get : { method: 'GET', isArray:true },
    post: { method: 'POST' },
    delete: { method: 'DELETE' },
    put: {method: 'PUT' },
  });

  paramCtrl.mensagem = '';
  paramCtrl.parametro = {};
  paramCtrl.parametros = [];
  paramCtrl.isDetalhar = false;

  paramCtrl.iniciar = function(){
    paramCtrl.limpar();
  };

  paramCtrl.detalhar = function(parametro){
    paramCtrl.parametro = parametro;
    paramCtrl.isDetalhar = true;
  }

  paramCtrl.salvar = function(parametro){
    var parametroSalvar = parametro;

    if(paramCtrl.isValido()){
      if(parametroSalvar.id){
        CorretoresService.put(parametroSalvar, function(retorno) {
          if(retorno.erro) paramCtrl.mensagem = 'Erro ao atualizar informações de Parametros Bradesco';

          paramCtrl.mensagem = 'Atualizado com sucesso!';
        }, paramCtrl.tratarErro);
      }else{
        ParametrosService.post(parametroSalvar, function(retorno) {
          if(retorno.erro) paramCtrl.mensagem = 'Erro ao salvar Parametros Bradesco';

          parametroSalvar.id = retorno.id;
          paramCtrl.parametros.push(parametroSalvar);
          paramCtrl.mensagem = 'Salvo com sucesso!';
        }, paramCtrl.tratarErro);
      }
      paramCtrl.corretor = {};
    }
  };

  paramCtrl.editar = function(parametro){
    paramCtrl.parametro = parametro;
    paramCtrl.isDetalhar = false;
  }

  paramCtrl.buscar = function(){
    paramCtrl.parametros = [];
    paramCtrl.mensagem = '';
    var params = {
      codigoCorretorHomologacao : paramCtrl.parametro.codigoCorretorHomologacao,
      codigoCorretorProducao : paramCtrl.parametro.codigoCorretorProducao,
      codigoSucursalHomologacao : paramCtrl.parametro.codigoSucursalHomologacao,
      codigoSucursalProducao : paramCtrl.parametro.codigoSucursalProducao,
      loginHomologacao : paramCtrl.parametro.loginHomologacao,
      loginProducao : paramCtrl.parametro.loginProducao,
      percentualAcordoComercial : paramCtrl.parametro.percentualAcordoComercial,
      senhaHomologacao : paramCtrl.parametro.senhaHomologacao,
      percentualComissao : paramCtrl.parametro.percentualComissao,
      percentualDesconto : paramCtrl.parametro.percentualDesconto,
      codigoInspetoria : paramCtrl.parametro.codigoInspetoria,
      codigoTipoPessoaCorretor : paramCtrl.parametro.codigoTipoPessoaCorretor,
      cpfCnpjCorretor : paramCtrl.parametro.cpfCnpjCorretor,
      percentualComissaoAPP : paramCtrl.parametro.percentualComissaoAPP,
      flPessoaCorretor : paramCtrl.parametro.flPessoaCorretor,
      percentualComissaoRCF : paramCtrl.parametro.percentualComissaoRCF
    };

    ParametrosService.get(params, function(parametros) {
      paramCtrl.parametros = parametros;
    }, paramCtrl.tratarErro);
  };

  paramCtrl.listar = function(){
    paramCtrl.parametros = [];
    paramCtrl.mensagem = '';
    ParametrosService.query(function(retorno){
        paramCtrl.parametros = retorno;
    }, paramCtrl.tratarErro);
  };

  paramCtrl.deletar = function(parametro){
    ParametrosService.delete({id: corretor.id}, function(retorno){
      paramCtrl.mensagem = 'Excluído com suceso!';
      var index = paramCtrl.parametros.indexOf(parametro);
      paramCtrl.parametros.splice(index, 1);
    }, paramCtrl.tratarErro);
  };

  paramCtrl.isValido = function(){
    paramCtrl.mensagem = '';
    var retorno = true;
    // if(!paramCtrl.parametro.nome){
    //   paramCtrl.mensagem = 'Campo Nome é obrigatório';
    //   retorno = false;
    // }
    // if(!paramCtrl.parametro.alias){
    //   paramCtrl.mensagem = 'Campo Alias é obrigatório';
    //   retorno = false;
    // }
    return retorno;
  };

  paramCtrl.limpar = function(){
    paramCtrl.mensagem = '';
    paramCtrl.parametro = {};
    paramCtrl.isDetalhar = false;
    paramCtrl.listar();
  };

  paramCtrl.isBuscar = function(){
    return (paramCtrl.parametro.nome || paramCtrl.parametro.alias);
  }

  paramCtrl.tratarErro = function(error){
    paramCtrl.mensagem = 'Ocorreu um erro '+error.data.mensagem;
    console.log(error);
  };

});

 function iniciarParametro(){
   angular.element(document.getElementById('parametro')).scope().paramCtrl.iniciar();
 }
