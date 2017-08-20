App.controller('programacaoCtrl', function($scope, $resource){
  var prgCtrl = this;

  var ProgramacaoService = $resource('/programacao/', null, {
    get : { method: 'GET', isArray:true },
    post: { method: 'POST' },
    delete: { method: 'DELETE' },
    put: {method: 'PUT' },
  });

  prgCtrl.mensagem = '';
  prgCtrl.programa = {};
  prgCtrl.programas = [];
  prgCtrl.programa.dia_semana = 0;
  prgCtrl.dias = [
    {"id": 0, "label": "Selecione o dia da semana"},
    {"id": 1, "label": "Domingo"},
    {"id": 2, "label": "Segunda"},
    {"id": 3, "label": "Terça"},
    {"id": 4, "label": "Quarta"},
    {"id": 5, "label": "Quinta"},
    {"id": 6, "label": "Sexta"},
    {"id": 7, "label": "Sábado"}
  ];
  prgCtrl.isDetalhar = false;

  prgCtrl.iniciar = function(){
    prgCtrl.limpar();
  };

  prgCtrl.detalhar = function(programa){
    prgCtrl.programa = programa;
    prgCtrl.isDetalhar = true;
  }

  prgCtrl.salvar = function(programa){
    var programaSalvar = programa;

    if(prgCtrl.isValido()){
      if(programaSalvar.id){
        ProgramacaoService.put(programaSalvar, function(retorno) {
          if(retorno.erro) prgCtrl.mensagem = 'Erro ao atualizar informações de programa';

          prgCtrl.mensagem = 'Atualizado com sucesso!';
        }, prgCtrl.tratarErro);
      }else{
        ProgramacaoService.post(programaSalvar, function(retorno) {
          if(retorno.erro) prgCtrl.mensagem = 'Erro ao salvar programa';

          programaSalvar.id = retorno.id;
          prgCtrl.programas.push(programaSalvar);
          prgCtrl.mensagem = 'Salvo com sucesso!';
        }, prgCtrl.tratarErro);
      }
      prgCtrl.programa = {};
    }
  };

  prgCtrl.editar = function(programa){
    prgCtrl.programa = programa;
    prgCtrl.isDetalhar = false;
  }

  prgCtrl.buscar = function(){
    prgCtrl.programas = [];
    prgCtrl.mensagem = '';
    var params = {
      nome: prgCtrl.programa.nome,
      alias: prgCtrl.programa.alias
    };

    ProgramacaoService.get(params, function(programas) {
      prgCtrl.programas = programas;
    }, prgCtrl.tratarErro);
  };

  prgCtrl.listar = function(){
    prgCtrl.programas = [];
    prgCtrl.mensagem = '';
    ProgramacaoService.query(function(retorno){
        prgCtrl.programas = retorno;
    }, prgCtrl.tratarErro);
  };

  prgCtrl.deletar = function(programa){
    ProgramacaoService.delete({id: programa.id}, function(retorno){
      prgCtrl.mensagem = 'Excluído com suceso!';
      var index = prgCtrl.programas.indexOf(programa);
      prgCtrl.programas.splice(index, 1);
    }, prgCtrl.tratarErro);
  };

  prgCtrl.isValido = function(){
    prgCtrl.mensagem = '';
    var retorno = true;
    if(!prgCtrl.programa.nome){
      prgCtrl.mensagem = 'Campo Nome é obrigatório';
      retorno = false;
    }
    if(!prgCtrl.programa.alias){
      prgCtrl.mensagem = 'Campo Alias é obrigatório';
      retorno = false;
    }
    return retorno;
  };

  prgCtrl.limpar = function(){
    prgCtrl.mensagem = '';
    prgCtrl.programa = {};
    prgCtrl.programa.dia_semana = 0;
    prgCtrl.isDetalhar = false;
    prgCtrl.listar();
  };

  prgCtrl.isBuscar = function(){
    return (prgCtrl.programa.nome || prgCtrl.programa.alias);
  }

  prgCtrl.tratarErro = function(error){
    prgCtrl.mensagem = 'Ocorreu um erro '+error.data.mensagem;
    console.log(error);
  };

  prgCtrl.uploadFile = function(files) {
    //var fd = new FormData();
    //Take the first selected file
    //fd.append("file", files[0]);
    prgCtrl.programa.logo = files[0];
    console.log(prgCtrl.programa);

    // $http.post(uploadUrl, fd, {
    //     withCredentials: true,
    //     headers: {'Content-Type': undefined },
    //     transformRequest: angular.identity
    // }).success( ...all right!... ).error( ..damn!... );
};

});

 function iniciarPrograma(){
   angular.element(document.getElementById('programa')).scope().prgCtrl.iniciar();
 }
