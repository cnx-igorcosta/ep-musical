App.controller('corretorCtrl', function($scope, $resource){
  var corrCtrl = this;

  var CorretoresService = $resource('/corretores/', null, {
    get : { method: 'GET', isArray:true },
    post: { method: 'POST' },
    delete: { method: 'DELETE' },
    put: {method: 'PUT' },
  });

  corrCtrl.mensagem = '';
  corrCtrl.corretor = {};
  corrCtrl.corretores = [];
  corrCtrl.isDetalhar = false;

  corrCtrl.iniciar = function(){
    corrCtrl.limpar();
  };

  corrCtrl.detalhar = function(corretor){
    corrCtrl.corretor = corretor;
    corrCtrl.isDetalhar = true;
  }

  corrCtrl.salvar = function(corretor){
    var corretorSalvar = corretor;

    if(corrCtrl.isValido()){
      if(corretorSalvar.id){
        CorretoresService.put(corretorSalvar, function(retorno) {
          if(retorno.erro) corrCtrl.mensagem = 'Erro ao atualizar informações de Corretor';

          corrCtrl.mensagem = 'Atualizado com sucesso!';
        }, corrCtrl.tratarErro);
      }else{
        CorretoresService.post(corretorSalvar, function(retorno) {
          if(retorno.erro) corrCtrl.mensagem = 'Erro ao salvar Corretor';

          corretorSalvar.id = retorno.id;
          corrCtrl.corretores.push(corretorSalvar);
          corrCtrl.mensagem = 'Salvo com sucesso!';
        }, corrCtrl.tratarErro);
      }
      corrCtrl.corretor = {};
    }
  };

  corrCtrl.editar = function(corretor){
    corrCtrl.corretor = corretor;
    corrCtrl.isDetalhar = false;
  }

  corrCtrl.buscar = function(){
    corrCtrl.corretores = [];
    corrCtrl.mensagem = '';
    var params = {
      nome: corrCtrl.corretor.nome,
      alias: corrCtrl.corretor.alias
    };

    CorretoresService.get(params, function(corretores) {
      corrCtrl.corretores = corretores;
    }, corrCtrl.tratarErro);
  };

  corrCtrl.listar = function(){
    corrCtrl.corretores = [];
    corrCtrl.mensagem = '';
    CorretoresService.query(function(retorno){
        corrCtrl.corretores = retorno;
    }, corrCtrl.tratarErro);
  };

  corrCtrl.deletar = function(corretor){
    CorretoresService.delete({id: corretor.id}, function(retorno){
      corrCtrl.mensagem = 'Excluído com suceso!';
      var index = corrCtrl.corretores.indexOf(corretor);
      corrCtrl.corretores.splice(index, 1);
    }, corrCtrl.tratarErro);
  };

  corrCtrl.isValido = function(){
    corrCtrl.mensagem = '';
    var retorno = true;
    if(!corrCtrl.corretor.nome){
      corrCtrl.mensagem = 'Campo Nome é obrigatório';
      retorno = false;
    }
    if(!corrCtrl.corretor.alias){
      corrCtrl.mensagem = 'Campo Alias é obrigatório';
      retorno = false;
    }
    return retorno;
  };

  corrCtrl.limpar = function(){
    corrCtrl.mensagem = '';
    corrCtrl.corretor = {};
    corrCtrl.isDetalhar = false;
    corrCtrl.listar();
  };

  corrCtrl.isBuscar = function(){
    return (corrCtrl.corretor.nome || corrCtrl.corretor.alias);
  }

  corrCtrl.tratarErro = function(error){
    corrCtrl.mensagem = 'Ocorreu um erro '+error.data.mensagem;
    console.log(error);
  };

});

 function iniciarCorretor(){
   angular.element(document.getElementById('corretor')).scope().corrCtrl.iniciar();
 }
