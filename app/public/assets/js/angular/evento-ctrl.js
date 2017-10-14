//https://github.com/dalelotts/angular-bootstrap-datetimepicker
App.controller('eventoCtrl', function($scope, $resource, $base64){
  var evCtrl = this;

  var EventoService = $resource('/evento/', null, {
    get : { method: 'GET', isArray:true },
    post: { method: 'POST' },
    delete: { method: 'DELETE' },
    put: {method: 'PUT' },
  });

  var ImagensService = $resource('/imagem/', null, {
    get : { method: 'GET', isArray:true }
  })

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
    var mes = evCtrl.evento.data.substring(3,5) -1;
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

  evCtrl.editar = function(evento){
    evCtrl.mensagem = '';
    var params = {
      idEvento: evento.id
    };
    ImagensService.query(params, function(imagens) {
      evCtrl.endereco = evento.endereco;
      evCtrl.evento = evento;
      evCtrl.evento.imagens = evCtrl.base64ToImage(imagens);
      //evCtrl.evento.imagens = imagens;
      evCtrl.formatarDataHora();
      evCtrl.isEdicao = true;
      evCtrl.isDetalhar = false;
    })
  }

  evCtrl.formatarDataHora = function() {
    var dh = new Date(evCtrl.evento.dataHora);
    evCtrl.evento.data = dh.getDate() + '/' + (dh.getMonth()+1) + '/' + dh.getFullYear();
    evCtrl.evento.hora = leftPad(dh.getHours()) + ':' + leftPad(dh.getMinutes());
  }

  function leftPad(str) {
    var pad = '00';
    str += '';
    return pad.substring(0, pad.length - str.length) + str;
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


  evCtrl.base64ToImage = function(imagens) {
    var imgs = [];
    for(var i = 0; i <imagens.length; i++) {
      var img = imagens[i];
      if(img) {
        if(img.indexOf('base64') != -1){
          imgs.push(img.replace(/data:?image\/(jpeg|png|jpg);?base64,?/,'data:image/jpeg;base64,'));
        } else{
          imgs.push('data:image/jpeg;base64,'+ img);
        }
      }
    }
    return imgs;
  };

  evCtrl.mostrarDia = function(idDia) {
    evCtrl.diaNav = idDia;
  }

  evCtrl.deletar = function(id, nome){
    evCtrl.mensagem = '';
    if (id && confirm('Deseja realmente deletar o evento '+nome+'?')) {
      EventoService.delete({id: id}, function(retorno){
        alert('Excluído com sucesso');
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
    evCtrl.evento = {};
    evCtrl.eventos = [];
    //evCtrl.isDetalhar = false;
    evCtrl.uploaded = false;
    //evCtrl.isEdicao = false;
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
