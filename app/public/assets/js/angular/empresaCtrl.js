App.controller('empresaCtrl', function($scope, $resource){
  var empCtrl = this;

  var EmpresasService = $resource('/empresas/:id/:nome', {id: '@id', nome:'@nome'}, {
    get : { method: 'GET', isArray:true},
    delete: { method: 'DELETE'},
    put: {method: 'PUT'},
  });

  var EmpresaService = $resource('/empresas/', null, {
    post: {method: 'POST'}
  });

  empCtrl.mensagem = '';
  empCtrl.empresa = {};
  empCtrl.empresas = [];

  empCtrl.iniciar = function(){
    empCtrl.limpar();
  };

  empCtrl.salvar = function(empresa){
    var empresaSalvar = empresa;

    if(empCtrl.isValido()){
      if(empresaSalvar.id){

        EmpresasService.put({id: empresaSalvar.id, nome: empresaSalvar.nome}, function(retorno) {
          if(retorno.erro) empCtrl.mensagem = 'Erro ao atualizar informações de Empresa';

          empCtrl.mensagem = 'Atualizado com sucesso!';
        }, empCtrl.tratarErro);
      }else{
        EmpresaService.post({nome: empresaSalvar.nome}, function(retorno) {
          if(retorno.erro) empCtrl.mensagem = 'Erro ao salvar Empresa';

          empresaSalvar.id = retorno.id;
          empCtrl.empresas.push(empresaSalvar);
          empCtrl.mensagem = 'Salvo com sucesso!';
        }, empCtrl.tratarErro);
      }
      empCtrl.empresa = {};
    }
  };

  empCtrl.editar = function(empresa){
    empCtrl.empresa = empresa;
  }

  empCtrl.buscar = function(){
    empCtrl.empresas = [];
    empCtrl.mensagem = '';
    var nome = empCtrl.empresa.nome;
    if(nome){
      EmpresasService.get({nome: nome}, function(empresas) {
        empCtrl.empresas = empresas;
      }, empCtrl.tratarErro);
    }else{
      empCtrl.listar();
    }
  };

  empCtrl.listar = function(){
    empCtrl.empresas = [];
    empCtrl.mensagem = '';
    EmpresasService.query(function(retorno){
        empCtrl.empresas = retorno;
    }, empCtrl.tratarErro);
  };

  empCtrl.deletar = function(empresa){
    EmpresasService.delete({id: empresa.id}, function(retorno){
      empCtrl.mensagem = 'Excluído com suceso!';
      var index = empCtrl.empresas.indexOf(empresa);
      empCtrl.empresas.splice(index, 1);
    }, empCtrl.tratarErro);
  }

  empCtrl.isValido = function(){
    empCtrl.mensagem = '';
    if(!empCtrl.empresa.nome){
      empCtrl.mensagem = 'Campo Nome é obrigatório';
      return false;
    }
    return true;
  };

  empCtrl.limpar = function(){
    empCtrl.mensagem = '';
    empCtrl.empresa = {};
    empCtrl.listar();
  };

  empCtrl.tratarErro = function(error){
    empCtrl.mensagem = 'Ocorreu um erro '+error.data.mensagem;
    console.log(error);
  };

});

 function iniciarEmpresa(){
   angular.element(document.getElementById('empresa')).scope().empCtrl.iniciar();
 }
