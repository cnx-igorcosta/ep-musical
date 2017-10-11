var map;
var infowindow;
var directionsService;
var directionsDisplay;

function initMap() {
	  var map = new google.maps.Map(document.getElementById('map'), {
	    center: {lat: -34.397, lng: 150.644},
	    zoom: 6
	  });
		getGeolocationUsuario(map);
	}

	function getGeolocationUsuario(map){
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				var pos = {
					lat: position.coords.latitude,
					lng: position.coords.longitude
				};
				var infoWindow = new google.maps.InfoWindow({map: map});
				infoWindow.setPosition(pos);
				infoWindow.setContent('Location found.');
				map.setCenter(pos);
			}, function() {
				handleLocationError(true, infoWindow, map.getCenter());
			});
		} else {
			handleLocationError(false, infoWindow, map.getCenter());
		}
	}

	function handleLocationError(browserHasGeolocation, infoWindow, pos) {
	  infoWindow.setPosition(pos);
	  infoWindow.setContent(browserHasGeolocation ?
	                        'Error: The Geolocation service failed.' :
	                        'Error: Your browser doesn\'t support geolocation.');
	}

// function initMap(address, callback){
// 	directionsService = new google.maps.DirectionsService;
//   directionsDisplay = new google.maps.DirectionsRenderer;
//   var geocoder = new google.maps.Geocoder();
//     // if(!address){
//     // 	address = 'Brasil';
//     // }
//     geocoder.geocode( { 'address': 'ESTRADA INTENDENTE MAGALHÃES 1064, VILA VALQUEIRE - RIO DE JANEIRO - RJ'}, function(results, status) {
//
//         if (status == google.maps.GeocoderStatus.OK) {
//             var location = {
//                     lat: results[0].geometry.location.lat(),
//                     lng: results[0].geometry.location.lng()
//                 };
//             map = new google.maps.Map(document.getElementById('map'), {
//                 center: location,
//                 zoom: 15
//             });
//             directionsDisplay.setMap(map);
//             infowindow = new google.maps.InfoWindow();
// 						buscarLocalizacaoUsuario(map, infoWindow);
//
// 						/*var windowLatLng = new google.maps.LatLng(results[0].geometry.location.lat(),results[0].geometry.location.lng());
// 						infowindow.setOptions({
// 				        content: 'ESTRADA INTENDENTE MAGALHÃES 1064, VILA VALQUEIRE - RIO DE JANEIRO - RJ',
// 				        position: windowLatLng,
// 				    });
// 						infowindow.open(map);*/
//
// 						if(callback){
//             	callback();
//             }
//         }
//     });
// }

function initMapDirection(){
	var address =  'ESTRADA INTENDENTE MAGALHÃES 1064, VILA VALQUEIRE - RIO DE JANEIRO - RJ'
	var location = {lat:0, lng:0};
	var request = {
			location: location,
			radius: '1000',
			query: address
	};

	initMap(address, function(){
		var service = new google.maps.places.PlacesService(map);
		service.textSearch(request, callbackMarker);

		// var input = document.getElementById('origem_rota');
		// if(input){
		// 	var autocomplete = new google.maps.places.Autocomplete(input, {types: ['address']});
		// }
	});
}

function tracarRota(){
	var origem = $('#origem_rota').val();
	var destino = 'ESTRADA INTENDENTE MAGALHÃES 1064, VILA VALQUEIRE - RIO DE JANEIRO - RJ';

	var directionRequest = {
            origin: origem,
            destination: destino,
            travelMode: google.maps.TravelMode.DRIVING,
            	//travelMode: google.maps.TravelMode.TRANSIT,
            transitOptions: {modes: [google.maps.TransitMode.SUBWAY, google.maps.TransitMode.TRAIN, google.maps.TransitMode.BUS]},
            optimizeWaypoints: true,
            provideRouteAlternatives: true
            //unitSystem: google.maps.UnitSystem.METRIC
        };

    directionsService.route(directionRequest, function(result, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(result);
        }
    });
}

function marcarUnidadesMapa(lista){
	var estado = $('#estado').val();
	var cidade = $('#cidade').val();
	var address = estado+' - '+cidade;

	initMap(address, function(){
		var service = new google.maps.places.PlacesService(map);

		$(lista).each(function(index, unidade){
			var localidade = {
				location: {lat:0, lng:0},
		        radius: '1000',
		        query: unidade.enderecoCompleto
			};
			service.textSearch(localidade, function(results, status) {
				if (status === google.maps.places.PlacesServiceStatus.OK) {
					$(results).each(function(index, result){
						createMarker(result, unidade);
					});
				}
			});
		});
	});
}

function callbackMarker(results, status) {
	if (status === google.maps.places.PlacesServiceStatus.OK) {
		$(results).each(function(index, result){
			createMarker(result);
		});
	}
}

function createMarker(place, unidade) {
	var numero = undefined;
	var nome = undefined;
	if(unidade){
		numero = unidade.numero.toString();
		nome = unidade.nome +' - ';
	}
    var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location,
        title: place.name,
        label: numero
    });

		infowindow.setOptions({
				// content: 'ESTRADA INTENDENTE MAGALHÃES 1064, VILA VALQUEIRE',
				content: 'Espaço Golden Palace',
				position: place.geometry.location,
		});
		infowindow.open(map, marker);

    google.maps.event.addListener(marker, 'click', function() {
    	if(nome){
    		infowindow.setContent(nome+place.name);
    	} else{
    		infowindow.setContent(place.name);
    	}
        infowindow.open(map, this);
    });
}




// $(document).ready(function(){
//
// 	$('#tracarRota').click(function(){
// 		tracarRota();
// 	});
//
// });
