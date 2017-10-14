//https://github.com/dalelotts/angular-bootstrap-datetimepicker
App.controller('eventoCtrl', function($scope, $resource, $base64){
  var evCtrl = this;

  var EventoService = $resource('/evento/', null, {
    get : { method: 'GET', isArray:true },
    post: { method: 'POST' },
    delete: { method: 'DELETE' },
    put: {method: 'PUT' },
  });

  evCtrl.mensagem = '';
  evCtrl.imagens = [];
  evCtrl.evento = {};
  evCtrl.eventos = [];
  evCtrl.uploaded = false;
  evCtrl.endereco = '';
  evCtrl.diaNav = 2;//SEGUNDA
  evCtrl.isDetalhar = false;
  evCtrl.isEdicao = false;
  evCtrl.logoRemovido = false;

  evCtrl.iniciar = function(){
    evCtrl.limpar();
  };

  evCtrl.detalhar = function(evento){
    evCtrl.evento = evento;
    evCtrl.isDetalhar = true;
  };

  evCtrl.getDataHora = function(){
    var dia = evCtrl.evento.data.substring(0,2);
    var mes = evCtrl.evento.data.substring(3,5);
    var ano = evCtrl.evento.data.substring(6,10);
    var hora = evCtrl.evento.hora ? evCtrl.evento.hora.substring(0,2) : 0;
    var minuto = evCtrl.evento.hora ? evCtrl.evento.hora.substring(3,4) : 0;

    return new Date(ano, mes, dia, hora, minuto, 0);
  };

  evCtrl.salvar = function(){
    var eventoSalvar = evCtrl.evento;
    if(evCtrl.isValido()){
      eventoSalvar.endereco = evCtrl.getEndereco();
      eventoSalvar.imagens = evCtrl.imagens;
      eventoSalvar.dataHora = evCtrl.getDataHora();
      if(eventoSalvar.id){
        EventoService.put(eventoSalvar, function(retorno) {
          if(retorno.erro) evCtrl.mensagem = 'Erro ao atualizar informações de programa';
          evCtrl.limpar();
          evCtrl.mensagem = 'Atualizado com sucesso!';
        }, evCtrl.tratarErro);
      }else{
        EventoService.post(eventoSalvar, function(retorno) {
          if(retorno.erro) evCtrl.mensagem = 'Erro ao salvar programa';
          evCtrl.limpar();
          evCtrl.mensagem = 'Salvo com sucesso!';
        }, evCtrl.tratarErro);''
      }
      evCtrl.evento = {};
    }
  };

  evCtrl.editar = function(programa){
    evCtrl.programa = programa;
    evCtrl.isEdicao = true;
    evCtrl.isDetalhar = false;
    evCtrl.logoRemovido = false;
    //evCtrl.logo = programa.logo;
  }

  evCtrl.buscar = function(){
    evCtrl.programas = [];
    evCtrl.mensagem = '';
    var params = {
      nome: evCtrl.programa.nome,
      alias: evCtrl.programa.alias
    };

    EventoService.get(params, function(programas) {
      evCtrl.programas = programas;
    }, evCtrl.tratarErro);
  };

  evCtrl.listar = function(){
    evCtrl.eventos = [];
    evCtrl.mensagem = '';
    EventoService.query(function(retorno){
        evCtrl.eventos = retorno;
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
      //TODO: logo to imagens
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
      EventoService.delete({id: id}, function(retorno){
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
    if(!evCtrl.evento.nome){
      evCtrl.mensagem = 'Campo Nome é obrigatório';
      retorno = false;
    }
    if(!evCtrl.endereco){
      evCtrl.mensagem = 'Campo Endereço é obrigatório';
      retorno = false;
    }
    if(!evCtrl.evento.data){
      evCtrl.mensagem = 'Campo Data é obrigatório';
      retorno = false;
    }
    else if(evCtrl.evento.data.length < 10){
      evCtrl.mensagem = 'Campo Data está inválido';
      retorno = false;
    }
    return retorno;
  };

  evCtrl.limpar = function(){
    evCtrl.mensagem = '';
    evCtrl.endereco = '';
    evCtrl.logo = [];
    evCtrl.evento = {};
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
    //var f = files[0];
    for(var i = 0; i < files.length; i++){
      var f = files[i];
      if(f.size > 1000000){
        evCtrl.mensagem = 'Tamanho máximo por imagem = 1Mb';
      }else {
        var r = new FileReader();
        evCtrl.uploaded = true;
        r.onloadend = function(e) {
          evCtrl.imagens.push(e.target.result);
        }
        r.readAsDataURL(f); //once defined all callbacks, begin reading the file
      }
    }
    $scope.$apply();
   };

   evCtrl.removerImagemEdicao = function(){
       evCtrl.logoRemovido = true;
   }

   evCtrl.getEndereco = function(){
     var end = evCtrl.endereco.formatted_address;
     return end ? end : evCtrl.endereco;
   }

  //  evCtrl.formatTime = function(programaSalvar) {
  //    let hhmm_inicial = programaSalvar.hora_inicial.split(':');
  //    programaSalvar.hora_inicial = new Date('1970','01','01',hhmm_inicial[0], hhmm_inicial[1]);
   //
  //    let hhmm_final = programaSalvar.hora_final.split(':');
  //    programaSalvar.hora_final = new Date('1970','01','01',hhmm_final[0], hhmm_final[1]);
  //  }

   //evCtrl.preencherVazios();
   evCtrl.iniciar();
});

function limparUploadFileLabel() {
  angular.element(document.getElementById('filename'))[0].innerHTML = '';
}

 // function iniciarPrograma(){
 //   angular.element(document.getElementById('programa')).scope().evCtrl.iniciar();
 // }
