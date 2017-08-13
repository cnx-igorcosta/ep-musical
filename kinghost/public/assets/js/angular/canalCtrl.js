App.controller('canalCtrl', function($scope, $resource){
  var cnlCtrl = this;

  var CanaisService = $resource('/canais/', null, {
    get : { method: 'GET', isArray:true },
    post: { method: 'POST' },
    delete: { method: 'DELETE' },
    put: {method: 'PUT' },
  });

  cnlCtrl.mensagem = '';
  cnlCtrl.canal = {};
  cnlCtrl.canais = [];
  //cnlCtrl.isDetalhar = false;

  cnlCtrl.iniciar = function(){
    cnlCtrl.limpar();
  };

  cnlCtrl.detalhar = function(canal){
    cnlCtrl.canal = canal;
    //cnlCtrl.isDetalhar = true;
  }

  cnlCtrl.salvar = function(canal){
    var canalSalvar = canal;

    if(cnlCtrl.isValido()){
      if(canalSalvar.id){
        CanaisService.put(canalSalvar, function(retorno) {
          if(retorno.erro) cnlCtrl.mensagem = 'Erro ao atualizar informações de Canal';

          cnlCtrl.mensagem = 'Atualizado com sucesso!';
        }, cnlCtrl.tratarErro);
      }else{
        CanaisService.post(canalSalvar, function(retorno) {
          if(retorno.erro) cnlCtrl.mensagem = 'Erro ao salvar Canal';

          canalSalvar.id = retorno.id;
          cnlCtrl.canais.push(canalSalvar);
          cnlCtrl.mensagem = 'Salvo com sucesso!';
        }, cnlCtrl.tratarErro);
      }
      cnlCtrl.canal = {};
    }
  };

  cnlCtrl.editar = function(canalSalvar){
    cnlCtrl.canal = canalSalvar;
    //cnlCtrl.isDetalhar = false;
  }

  cnlCtrl.listar = function(){
    cnlCtrl.canais = [];
    cnlCtrl.mensagem = '';
    CanaisService.query(function(retorno){
      cnlCtrl.canais = retorno;
    }, cnlCtrl.tratarErro);
  };

  cnlCtrl.buscar = function(){
    cnlCtrl.canais = [];
    cnlCtrl.mensagem = '';
    var params = {
      canal_id: cnlCtrl.canal.canal_id,
      corretor_id: cnlCtrl.canal.corretor_id,
      seguradora_id: cnlCtrl.canal.seguradora_id,
      parametros_id: cnlCtrl.canal.parametros_id,
      operacao: cnlCtrl.canal.operacao
    };

    CanaisService.get(params, function(canais) {
      cnlCtrl.canais = canais;
    }, cnlCtrl.tratarErro);
  };

  cnlCtrl.deletar = function(canal){
    CanaisService.delete({id: canal.id}, function(retorno){
      cnlCtrl.mensagem = 'Excluído com suceso!';
      var index = cnlCtrl.canais.indexOf(canal);
      cnlCtrl.canais.splice(index, 1);
    }, cnlCtrl.tratarErro);
  };

  cnlCtrl.isValido = function(){
    cnlCtrl.mensagem = '';
    var retorno = true;
    if(!cnlCtrl.canal.operacao
      || !cnlCtrl.canal.canal_id
      || !cnlCtrl.canal.corretor_id
      || !cnlCtrl.canal.parametros_id
      || !cnlCtrl.canal.seguradora_id){
        cnlCtrl.mensagem = 'Todos os campos são obrigatórios';
        retorno = false;
      }

    return retorno;
  };

  cnlCtrl.limpar = function(){
    cnlCtrl.mensagem = '';
    cnlCtrl.canal = {};
    //cnlCtrl.isDetalhar = false;
    cnlCtrl.listar();
  };

  cnlCtrl.tratarErro = function(error){
    cnlCtrl.mensagem = 'Ocorreu um erro '+error.data.mensagem;
    console.log(error);
  };

});

 function iniciarCanal(){
   angular.element(document.getElementById('canal')).scope().cnlCtrl.iniciar();
 }
