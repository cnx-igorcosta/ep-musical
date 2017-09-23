//https://github.com/dalelotts/angular-bootstrap-datetimepicker
App.controller('eventoCtrl', function($scope, $resource, $base64){
  var evCtrl = this;

  var ProgramacaoService = $resource('/evento/', null, {
    get : { method: 'GET', isArray:true },
    post: { method: 'POST' },
    delete: { method: 'DELETE' },
    put: {method: 'PUT' },
  });

  evCtrl.mensagem = '';
  evCtrl.logo = null;
  evCtrl.programa = {};
  evCtrl.uploaded = false;
  evCtrl.programa.dia_semana = 0;
  evCtrl.diaNav = 2;//SEGUNDA
  evCtrl.isDetalhar = false;
  evCtrl.isEdicao = false;
  evCtrl.logoRemovido = false;

  //evCtrl.isExclusao = false;
  evCtrl.programas = [
    {dia: 2, dia_nome: 'SEGUNDA', programas: []},
    {dia: 3, dia_nome: 'TERÇA', programas: []},
    {dia: 4, dia_nome: 'QUARTA', programas: []},
    {dia: 5, dia_nome: 'QUINTA', programas: []},
    {dia: 6, dia_nome: 'SEXTA', programas: []},
    {dia: 7, dia_nome: 'SÁBADO', programas: []},
    {dia: 1, dia_nome: 'DOMINGO', programas: []}
  ];
  evCtrl.diasSelect = [
    {"id": 0, "label": "Selecione o dia da semana"},
    {"id": 2, "label": "SEGUNDA"},
    {"id": 3, "label": "TERÇA"},
    {"id": 4, "label": "QUARTA"},
    {"id": 5, "label": "QUINTA"},
    {"id": 6, "label": "SEXTA"},
    {"id": 7, "label": "SÁBADO"},
    {"id": 1, "label": "DOMINGO"}
  ];
  evCtrl.diasSemanaNav = [
    {"id": 2, "label": "SEGUNDA"},
    {"id": 3, "label": "TERÇA"},
    {"id": 4, "label": "QUARTA"},
    {"id": 5, "label": "QUINTA"},
    {"id": 6, "label": "SEXTA"},
    {"id": 7, "label": "SÁBADO"},
    {"id": 1, "label": "DOMINGO"}
  ];

  evCtrl.iniciar = function(){
    evCtrl.limpar();
  };

  evCtrl.detalhar = function(programa){
    evCtrl.programa = programa;
    evCtrl.isDetalhar = true;
  }

  evCtrl.salvar = function(){
    var programaSalvar = evCtrl.programa;
    programaSalvar.logo = evCtrl.logo;
    //programaSalvar.descricao = programaSalvar.descricao.replace(/\r?\n/g, '<br />');

    if(evCtrl.isValido()){
      if(programaSalvar.id){
        ProgramacaoService.put(programaSalvar, function(retorno) {
          if(retorno.erro) evCtrl.mensagem = 'Erro ao atualizar informações de programa';
          evCtrl.limpar();
          evCtrl.mensagem = 'Atualizado com sucesso!';
        }, evCtrl.tratarErro);
      }else{
        ProgramacaoService.post(programaSalvar, function(retorno) {
          if(retorno.erro) evCtrl.mensagem = 'Erro ao salvar programa';
          evCtrl.limpar();
          evCtrl.mensagem = 'Salvo com sucesso!';
        }, evCtrl.tratarErro);''
      }
      evCtrl.programa = {};
    }
  };

  evCtrl.editar = function(programa){
    evCtrl.programa = programa;
    evCtrl.isEdicao = true;
    evCtrl.isDetalhar = false;
    evCtrl.logoRemovido = false;
    evCtrl.logo = programa.logo;
  }

  evCtrl.buscar = function(){
    evCtrl.programas = [];
    evCtrl.mensagem = '';
    var params = {
      nome: evCtrl.programa.nome,
      alias: evCtrl.programa.alias
    };

    ProgramacaoService.get(params, function(programas) {
      evCtrl.programas = programas;
    }, evCtrl.tratarErro);
  };

  evCtrl.listar = function(){
    evCtrl.programas = [];
    evCtrl.mensagem = '';
    ProgramacaoService.query(function(retorno){
        evCtrl.base64ToImage(retorno);
        var listaSemana = evCtrl.organizarProgramasPorDiaSemana(retorno);
        evCtrl.programas = evCtrl.organizarProgramasPorHora(listaSemana);
        evCtrl.preencherVazios();
    }, evCtrl.tratarErro);
  };

  evCtrl.organizarProgramasPorDiaSemana = function(listaPrograma) {
    var listaSemana = [
      {dia: 1, dia_nome: 'DOMINGO', programas: []},
      {dia: 2, dia_nome: 'SEGUNDA', programas: []},
      {dia: 3, dia_nome: 'TERÇA', programas: []},
      {dia: 4, dia_nome: 'QUARTA', programas: []},
      {dia: 5, dia_nome: 'QUINTA', programas: []},
      {dia: 6, dia_nome: 'SEXTA', programas: []},
      {dia: 7, dia_nome: 'SÁBADO', programas: []},
    ];

    for(var i = 0; i < listaPrograma.length; i++) {
      var prg = listaPrograma[i];
      for(var j = 0; j < listaSemana.length; j++) {
        var semana = listaSemana[j];
        if(prg.dia_semana == semana.dia && semana.programas.length < 6) {
          semana.programas.push(prg);
        }
      }
    }
    return listaSemana;
  };

  evCtrl.organizarProgramasPorHora = function(listaSemana) {
    var retorno = [];
    for(var i = 0; i < listaSemana.length; i++) {
      var semana = listaSemana[i];
      for(var j = 0; j < semana.programas.length; j++) {
        semana.programas.sort(function(a,b){
          if(a.hora_inicial && b.hora_inicial){
            var data_a = new Date('1970-01-01 '+a.hora_inicial);
            var data_b = new Date('1970-01-01 '+b.hora_inicial);
            return (data_a - data_b);
          }
        });
      }
    }
    return listaSemana;
  };


  evCtrl.base64ToImage = function(listaPrograma) {
    for(var i = 0; i <listaPrograma.length; i++) {
      var programa = listaPrograma[i];
      if(programa.logo) {
        if(programa.logo.indexOf('base64') != -1){
          programa.logo = programa.logo.replace(/data:?image\/(jpeg|png|jpg);?base64,?/,'data:image/jpeg;base64,');
        } else{
          programa.logo = 'data:image/jpeg;base64,'+ programa.logo;
        }
      } else{
          programa.logo = './images/default-programacao.jpg';
      }
    }
  };

  evCtrl.preencherVazios = function() {
    var quantMaxPrg = 6;
    for(var i = 0; i < 7; i++) {
      var semana = evCtrl.programas[i];
      if(semana.programas.length < quantMaxPrg) {
        var faltam =  quantMaxPrg - semana.programas.length;
        var progrmamaADefinir = {
          nome: 'EP Musical',
          hora_inicial: 'EM BREVE',
          descricao:'Em breve mais uma programação musical para você acompanhar!',
          logo: './images/default-programacao.jpg'
        };
        for(var j = 0; j < faltam; j++) {
          semana.programas.push(progrmamaADefinir);
        }
      }
    }
  };

  evCtrl.mostrarDia = function(idDia) {
    evCtrl.diaNav = idDia;
  }

  // evCtrl.excluirPrograma = function(idPrograma) {
  //   evCtrl.programa.id = idPrograma;
  //   evCtrl.isExclusao = true;
  // }

  evCtrl.deletar = function(id){
    evCtrl.mensagem = '';
    if (id && confirm("Deseja realmente deletar programação?")) {
      ProgramacaoService.delete({id: id}, function(retorno){
        alert('Excluído com sucesso');
        /*var index = evCtrl.programas.indexOf(programa);
        evCtrl.programas.splice(index, 1);*/
        evCtrl.limpar();
      }, evCtrl.tratarErro);
    }
  };

  evCtrl.isValido = function(){
    evCtrl.mensagem = '';
    var retorno = true;
    // if(!evCtrl.programa.nome){
    //   evCtrl.mensagem = 'Campo Nome é obrigatório';
    //   retorno = false;
    // }
    // if(!evCtrl.programa.alias){
    //   evCtrl.mensagem = 'Campo Alias é obrigatório';
    //   retorno = false;
    // }
    return retorno;
  };

  evCtrl.limpar = function(){
    evCtrl.mensagem = '';
    evCtrl.logo = null;
    evCtrl.programa = {};
    evCtrl.programa.dia_semana = 0;
    evCtrl.diaNav = 2
    evCtrl.isDetalhar = false;
    evCtrl.uploaded = false;
    evCtrl.isEdicao = false;
    evCtrl.logoRemovido = false;
    limparUploadFileLabel();
  //  evCtrl.isExclusao = false;
    evCtrl.listar();
  };

  evCtrl.isBuscar = function(){
    return (evCtrl.programa.nome || evCtrl.programa.alias);
  }

  evCtrl.tratarErro = function(error){
    evCtrl.mensagem = 'Ocorreu um erro '+error.data.mensagem;
    console.log(error);
  };

  evCtrl.uploadFile = function(files) {
    evCtrl.uploaded = false;
    evCtrl.logoRemovido = false;
    evCtrl.mensagem = '';
    var f = files[0];
    if(f.size > 1000000){
      evCtrl.mensagem = 'Tamanho máximo da imagem = 1Mb';
      //limparUploadFileLabel();
    }else {
      var r = new FileReader();
      evCtrl.uploaded = true;
      r.onloadend = function(e) {
        evCtrl.logo = e.target.result;
      }
      r.readAsDataURL(f); //once defined all callbacks, begin reading the file
    }
    $scope.$apply();
   };

   evCtrl.removerImagemEdicao = function(){
       evCtrl.logoRemovido = true;
   }

  //  evCtrl.formatTime = function(programaSalvar) {
  //    let hhmm_inicial = programaSalvar.hora_inicial.split(':');
  //    programaSalvar.hora_inicial = new Date('1970','01','01',hhmm_inicial[0], hhmm_inicial[1]);
   //
  //    let hhmm_final = programaSalvar.hora_final.split(':');
  //    programaSalvar.hora_final = new Date('1970','01','01',hhmm_final[0], hhmm_final[1]);
  //  }

   //evCtrl.preencherVazios();
   //evCtrl.iniciar();
});

function limparUploadFileLabel() {
  angular.element(document.getElementById('filename'))[0].innerHTML = '';
}

 // function iniciarPrograma(){
 //   angular.element(document.getElementById('programa')).scope().evCtrl.iniciar();
 // }
