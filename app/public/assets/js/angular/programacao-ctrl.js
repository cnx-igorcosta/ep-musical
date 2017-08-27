App.controller('programacaoCtrl', function($scope, $resource, $base64){
  var prgCtrl = this;

  var ProgramacaoService = $resource('/programacao/', null, {
    get : { method: 'GET', isArray:true },
    post: { method: 'POST' },
    delete: { method: 'DELETE' },
    put: {method: 'PUT' },
  });

  prgCtrl.mensagem = '';
  prgCtrl.logo = null;
  prgCtrl.programa = {};
  prgCtrl.programas = [
    {dia: 2, dia_nome: 'SEGUNDA', programas: []},
    {dia: 3, dia_nome: 'TERÇA', programas: []},
    {dia: 4, dia_nome: 'QUARTA', programas: []},
    {dia: 5, dia_nome: 'QUINTA', programas: []},
    {dia: 6, dia_nome: 'SEXTA', programas: []},
    {dia: 7, dia_nome: 'SÁBADO', programas: []},
    {dia: 1, dia_nome: 'DOMINGO', programas: []}
  ];
  prgCtrl.programa.dia_semana = 0;
  prgCtrl.diasSelect = [
    {"id": 0, "label": "Selecione o dia da semana"},
    {"id": 2, "label": "Segunda"},
    {"id": 3, "label": "Terça"},
    {"id": 4, "label": "Quarta"},
    {"id": 5, "label": "Quinta"},
    {"id": 6, "label": "Sexta"},
    {"id": 7, "label": "Sábado"},
    {"id": 1, "label": "Domingo"}
  ];
  prgCtrl.diasSemanaNav = [
    {"id": 2, "label": "SEGUNDA"},
    {"id": 3, "label": "TERÇA"},
    {"id": 4, "label": "QUARTA"},
    {"id": 5, "label": "QUINTA"},
    {"id": 6, "label": "SEXTA"},
    {"id": 7, "label": "SÁBADO"},
    {"id": 1, "label": "DOMINGO"}
  ];
  prgCtrl.diaNav = 2;//SEGUNDAs
  prgCtrl.isDetalhar = false;

  prgCtrl.iniciar = function(){
    prgCtrl.limpar();
  };

  prgCtrl.detalhar = function(programa){
    prgCtrl.programa = programa;
    prgCtrl.isDetalhar = true;
  }

  prgCtrl.salvar = function(){
    var programaSalvar = prgCtrl.programa;
    programaSalvar.logo = prgCtrl.logo;

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
        prgCtrl.base64ToImage(retorno);
        prgCtrl.programas = prgCtrl.organizarProgramasPorDiaHora(retorno);
        prgCtrl.preencherVazios();
    }, prgCtrl.tratarErro);
  };

  prgCtrl.organizarProgramasPorDiaHora = function(listaPrograma) {
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
        if(prg.dia_semana == semana.dia) {
          semana.programas.push(prg);
        }
      }
    }
    return listaSemana;
  };

  prgCtrl.base64ToImage = function(listaPrograma) {
    for(var i = 0; i <listaPrograma.length; i++) {
      var programa = listaPrograma[i];
      if(programa.logo) {
        programa.logo = programa.logo.replace(/data:?image\/(jpeg|png|jpg);?base64,?/,'data:image/jpeg;base64,');
      } else{
          programa.logo = './images/default-programacao.jpg';
      }
    }
  };

  prgCtrl.preencherVazios = function() {
    var quantMaxPrg = 6;
    for(var i = 0; i < prgCtrl.programas.length; i++) {
      var semana = prgCtrl.programas[i];
      if(semana.programas.length < quantMaxPrg) {
        var faltam =  quantMaxPrg - semana.programas.length;
        var progrmamaADefinir = {
          nome: '',
          hora_inicial: 'A DEFINIR',
          descricao:'',
          logo: './images/default-programacao.jpg'
        };
        for(var j = 0; j < faltam; j++) {
          semana.programas.push(progrmamaADefinir);
        }
      }
    }
  };

  prgCtrl.mostrarDia = function(idDia) {
    prgCtrl.diaNav = idDia;
  }

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
    // if(!prgCtrl.programa.nome){
    //   prgCtrl.mensagem = 'Campo Nome é obrigatório';
    //   retorno = false;
    // }
    // if(!prgCtrl.programa.alias){
    //   prgCtrl.mensagem = 'Campo Alias é obrigatório';
    //   retorno = false;
    // }
    return retorno;
  };

  prgCtrl.limpar = function(){
    prgCtrl.mensagem = '';
    prgCtrl.logo = null;
    prgCtrl.programa = {};
    prgCtrl.programa.dia_semana = 0;
    prgCtrl.diaNav = 2
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
    var f = files[0];
    console.log(f.size);
    var r = new FileReader();
    r.onloadend = function(e) {
       prgCtrl.logo = e.target.result;
     }
     r.readAsDataURL(f); //once defined all callbacks, begin reading the file
   };

   prgCtrl.preencherVazios();
   prgCtrl.iniciar();
});

 function iniciarPrograma(){
   angular.element(document.getElementById('programa')).scope().prgCtrl.iniciar();
 }
