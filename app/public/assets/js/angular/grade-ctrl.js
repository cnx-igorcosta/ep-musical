App.controller('programacaoCtrl', function($scope, $resource, $base64){
  var prgCtrl = this;

  var ProgramacaoService = $resource('/programacao/', {
    get : { method: 'GET', isArray:true }
  });

  prgCtrl.logo = null;
  prgCtrl.programa = {};
  prgCtrl.diaNav = getDiaSemanaAtual();
  prgCtrl.isDetalhar = false;

  //prgCtrl.isExclusao = false;
  prgCtrl.programas = [
    {dia: 2, dia_nome: 'SEGUNDA', programas: []},
    {dia: 3, dia_nome: 'TERÇA', programas: []},
    {dia: 4, dia_nome: 'QUARTA', programas: []},
    {dia: 5, dia_nome: 'QUINTA', programas: []},
    {dia: 6, dia_nome: 'SEXTA', programas: []},
    {dia: 7, dia_nome: 'SÁBADO', programas: []},
    {dia: 1, dia_nome: 'DOMINGO', programas: []}
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

  prgCtrl.iniciar = function(){
    prgCtrl.listar();
  };

  prgCtrl.detalhar = function(programa){
    if(programa.id){
      for(var i=0;i<prgCtrl.diasSemanaNav.length;i++){
        if(prgCtrl.diasSemanaNav[i].id === programa.dia_semana) {
          programa.label_semana = prgCtrl.diasSemanaNav[i].label;
        }
      }
      prgCtrl.programa = programa;
      prgCtrl.isDetalhar = true;
    }
  }

  prgCtrl.listar = function(){
    prgCtrl.programas = [];
    ProgramacaoService.query({},function(retorno){
        prgCtrl.base64ToImage(retorno);
        var listaSemana = prgCtrl.organizarProgramasPorDiaSemana(retorno);
        prgCtrl.programas = prgCtrl.organizarProgramasPorHora(listaSemana);
        prgCtrl.preencherVazios();
    }, prgCtrl.tratarErro);
  };

  prgCtrl.organizarProgramasPorDiaSemana = function(listaPrograma) {
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

  prgCtrl.organizarProgramasPorHora = function(listaSemana) {
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


  prgCtrl.base64ToImage = function(listaPrograma) {
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

  prgCtrl.preencherVazios = function() {
    var quantMaxPrg = 6;
    for(var i = 0; i < 7; i++) {
      var semana = prgCtrl.programas[i];
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

  prgCtrl.mostrarDia = function(idDia) {
    prgCtrl.diaNav = idDia;
  }

  prgCtrl.limpar = function(){
    prgCtrl.isDetalhar = false;
  };

   prgCtrl.preencherVazios();
   prgCtrl.iniciar();
});


function getDiaSemanaAtual() {
  return new Date().getDay()+1;
}
