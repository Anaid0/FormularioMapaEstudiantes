let map; //se almacena el mapa de google
let geocoder; //se añ,acema eñ pbjeto de geocoder para las direcciones en coordenadas y viceversa 
let currentMarkerCasa, currentMarkerTrabajo; //se guarda el marcador de la casa y del trabajo
let line = null;  //guarda la linea de los dos marcadores
let puntosSeleccionados = [];  // es un array para almacenar los puntos seleccionados
let infoWindow = null; //muestra la información de la distancia en tre los puntos seleccionados


function iniciarMap() { //se crea una función llamada iniciarMap
    const coord = { lat: 4.632539102166865, lng: -74.08081778835967 }; //se establecen las coordenadas predeterminadas
    map = new google.maps.Map(document.getElementById('map'), { //se crea una variable map y con el google maps se trae el id map
        zoom: 10, // se realiiza el map con un zoom 10
        center: coord, //se centra el mapa en las coordenadas dadas
    });

    geocoder = new google.maps.Geocoder(); //se crea la variable geocoder donde se incializa

    const direccionCasa = document.getElementById("direccionCasa"); //se configura un campo dirección casa y se llama desde un id
    const autocompleteCasa = new google.maps.places.Autocomplete(direccionCasa); //se crea una variable para cuando se vaya a completar la dirección
    autocompleteCasa.addListener("place_changed", function () { //a la hora de escribir la dirección da la sugerencia para autocompletar la dirección
        obtenerCoordenadas(autocompleteCasa, 'latitudCasa', 'longitudCasa', 'direccionCasa');
    });

    const direccionTrabajo = document.getElementById("direccionTrabajo");//se configura un campo dirección trabajo y se llama desde un id
    const autocompleteTrabajo = new google.maps.places.Autocomplete(direccionTrabajo); //se crea una variable para cuando se vaya a completar la dirección
    autocompleteTrabajo.addListener("place_changed", function () {//a la hora de escribir la dirección da la sugerencia para autocompletar la dirección
        obtenerCoordenadas(autocompleteTrabajo, 'latitudTrabajo', 'longitudTrabajo', 'direccionTrabajo');
    });

    map.addListener("click", function(event) { //se realiza un evento
        if (puntosSeleccionados.length === 2) { //si hay más de 2 marcadores se borra 
            limpiarMarcadores(); 
        }

        if (puntosSeleccionados.length < 2) {//se pueden seleccionar solo 2 puntos
            if (puntosSeleccionados.length === 0) {
                colocarMarcador(event.latLng, 'latitudCasa', 'longitudCasa', 'direccionCasa', currentMarkerCasa);
                puntosSeleccionados.push({lat: event.latLng.lat(), lng: event.latLng.lng(), tipo: 'casa'});
            } else {
                colocarMarcador(event.latLng, 'latitudTrabajo', 'longitudTrabajo', 'direccionTrabajo', currentMarkerTrabajo);
                puntosSeleccionados.push({lat: event.latLng.lat(), lng: event.latLng.lng(), tipo: 'trabajo'});
                calcularDistancia(); 
            }
        }
    });

    document.getElementById("latitudCasa").addEventListener("change", function() { 
        verificarYCalcular();
    });
    document.getElementById("longitudCasa").addEventListener("change", function() {
        verificarYCalcular();
    });
    document.getElementById("latitudTrabajo").addEventListener("change", function() {
        verificarYCalcular();
    });
    document.getElementById("longitudTrabajo").addEventListener("change", function() {
        verificarYCalcular();
    });
}


function colocarMarcador(location, latInputId, lngInputId, addressInputId, marker) { //Se crea una función para colocar el marcador
    
    document.getElementById(latInputId).value = location.lat();//se asigna la latitud
    document.getElementById(lngInputId).value = location.lng(); // se asigna la longitud

    if (marker) {
        marker.setMap(null);
    } //si ya existe el marcador en esa ubicación se elimina para evitar duplicados

    marker = new google.maps.Marker({
        position: location,
        map: map
    }); // se crea un nuevo marcador en otra posición en el mapa

    map.setCenter(location);  // el mapa se centra según la nueva ubicación

    geocoder.geocode({ location: location }, (results, status) => { //se obtienen la ubicación segun el location
        if (status === "OK" && results[0]) {
            document.getElementById(addressInputId).value = results[0].formatted_address; //si sale existoso se realiza en la dirección correspondiente
            
            if (addressInputId === 'direccionCasa') {
                currentMarkerCasa = marker; //se asigna el marcador para casa
            } else {
                currentMarkerTrabajo = marker; //si no se asigna al trabajo
            }

            if (document.getElementById("latitudCasa").value && document.getElementById("latitudTrabajo").value) {
                calcularDistancia(); //si casa y trabaho tienen coordenandas se calcula la distancia
            }
        } else {
            alert("No se pudo encontrar la dirección."); //si no se manda mensaje de no encontro ubicación
        }
    });
}

function obtenerCoordenadas(autocomplete, latInputId, lngInputId, addressInputId) { //se crea una función para obtener coordenadas
    const place = autocomplete.getPlace(); //se asigna un atributo place donde se autocomplete a la hora de darlo
    if (place.geometry) { //si la geometria de place es correcta se asigna la latitud y longitud correspontiende
        const location = place.geometry.location;
        document.getElementById(latInputId).value = location.lat();
        document.getElementById(lngInputId).value = location.lng();

        map.setCenter(location); //se centra el mapa en la locación dada

        const marker = new google.maps.Marker({
            position: location,
            map: map
        }); //se crea un nuevo marcador en la ubicación

        if (addressInputId === 'direccionCasa') {
            currentMarkerCasa = marker; //se asigna el marcador a casa
        } else {
            currentMarkerTrabajo = marker; //si no se asigna al trabajo
        }

        if (document.getElementById("latitudCasa").value && document.getElementById("latitudTrabajo").value) {
            calcularDistancia();
        }//se mira si los dos puntos tienen coordenadas para calcular la distancia
    } else {
        alert("Por favor, selecciona una dirección válida."); //se manda un mensaje si hay una dirección inválida
    }
}

function verificarYCalcular() {// se crea una función llamada verificar y calcular
    const latCasa = parseFloat(document.getElementById("latitudCasa").value); //trae latitud casa y lo convierte en valor
    const lngCasa = parseFloat(document.getElementById("longitudCasa").value); //trae longitud en casa y lo convierte en valor
    const latTrabajo = parseFloat(document.getElementById("latitudTrabajo").value); //trae la latitud trabajo y lo convierte en valor
    const lngTrabajo = parseFloat(document.getElementById("longitudTrabajo").value); //trae la longitud trabajo y lo convierte en valor

    if (latCasa && lngCasa && latTrabajo && lngTrabajo) { //si todos los campos estan completos
        if (currentMarkerCasa) {
            currentMarkerCasa.setMap(null); //se elimina
        }
        if (currentMarkerTrabajo) {
            currentMarkerTrabajo.setMap(null);  //se elimina
        }
        colocarMarcador(new google.maps.LatLng(latCasa, lngCasa), 'latitudCasa', 'longitudCasa', 'direccionCasa', currentMarkerCasa); //se añade nuevo marcador
        colocarMarcador(new google.maps.LatLng(latTrabajo, lngTrabajo), 'latitudTrabajo', 'longitudTrabajo', 'direccionTrabajo', currentMarkerTrabajo); //se añade nuevo marcador
        calcularDistancia();  //se calcula la distancia
    }
}

function calcularDistancia() { // se crea una función calcular Distancia
    const latCasa = parseFloat(document.getElementById("latitudCasa").value); //convierte latitud casa en valor
    const lngCasa = parseFloat(document.getElementById("longitudCasa").value); //convierte longitud casa en valor
    const latTrabajo = parseFloat(document.getElementById("latitudTrabajo").value); //convierte latitud trabajo en valor
    const lngTrabajo = parseFloat(document.getElementById("longitudTrabajo").value); //convierte longitud trabajo en valor

    if (!latCasa || !lngCasa || !latTrabajo || !lngTrabajo) { //si falta alguna cordenada
        alert("Ambos puntos deben estar completos."); //se manda una alerta de campo incompleto
        return;
    }

    if (infoWindow) {
        infoWindow.close(); //se cierra la venta si existe
    }

    const distancia = google.maps.geometry.spherical.computeDistanceBetween( //se crea la distancia basado en la geometría de google maps
        new google.maps.LatLng(latCasa, lngCasa), //se crea un punto para casa
        new google.maps.LatLng(latTrabajo, lngTrabajo) //se crea un punto para trabajo
    );

    infoWindow = new google.maps.InfoWindow({
        content: `Distancia: ${distancia.toFixed(2)} metros`, // la ventana muestra la información de la distancia
        position: { lat: (latCasa + latTrabajo) / 2, lng: (lngCasa + lngTrabajo) / 2 }
    });
    infoWindow.open(map); //se abre la ventana de información

    trazarLinea(latCasa, lngCasa, latTrabajo, lngTrabajo); //se dibuja una linea entre los dos puntos
}

function trazarLinea(latCasa, lngCasa, latTrabajo, lngTrabajo) { //se crea una función trazar linea
    if (line) {
        line.setMap(null); //se elimina la linea anterior
    }

    const linePath = [
        new google.maps.LatLng(latCasa, lngCasa),
        new google.maps.LatLng(latTrabajo, lngTrabajo)
    ]; //se define la linea con la latitud y longitud de cada punto

    line = new google.maps.Polyline({
        path: linePath,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
    }); //se crea una linea en el mapa de color rojo 

    line.setMap(map);  //se agrega la linea en el mapa
}

function limpiarMarcadores() { //se crea función limpiar marcador
    
    if (currentMarkerCasa) {
        currentMarkerCasa.setMap(null); 
        currentMarkerCasa = null;//se elimina el marcador
        document.getElementById("direccionCasa").value = ''; //se limpia el campo
        document.getElementById("latitudCasa").value = ''; //se limpia el campo
        document.getElementById("longitudCasa").value = ''; //se limpia el campo
    }

    if (currentMarkerTrabajo) {
        currentMarkerTrabajo.setMap(null);
        currentMarkerTrabajo = null;//se elimina el marcador
        document.getElementById("direccionTrabajo").value = '';//se limpia el campo
        document.getElementById("latitudTrabajo").value = '';//se limpia el campo
        document.getElementById("longitudTrabajo").value = '';//se limpia el campo
    }

    puntosSeleccionados = [];  //se crea un array para almacenar los puntos seleccionados
    if (line) {
        line.setMap(null);  //si hay una linea el mapa la elimina
    }
}

function agregarUsuario() { //se crea una función agregar usuario
    const documento = document.getElementById("documento").value; //se obtiene un valor en el campo
    const nombres = document.getElementById("nombres").value;//se obtiene un valor en el campo
    const apellidos = document.getElementById("apellidos").value;//se obtiene un valor en el campo
    const direccionCasa = document.getElementById("direccionCasa").value;//se obtiene un valor en el campo
    const latitudCasa = document.getElementById("latitudCasa").value;//se obtiene un valor en el campo
    const longitudCasa = document.getElementById("longitudCasa").value;//se obtiene un valor en el campo
    const direccionTrabajo = document.getElementById("direccionTrabajo").value;//se obtiene un valor en el campo
    const latitudTrabajo = document.getElementById("latitudTrabajo").value;//se obtiene un valor en el campo
    const longitudTrabajo = document.getElementById("longitudTrabajo").value;//se obtiene un valor en el campo

    fetch('http://localhost:5000/submit', { //se trae la url para el metodo post
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded' // los datos se envian en formaro url encoded
        },
        body: new URLSearchParams({
            'documento': documento,
            'nombres': nombres,
            'apellidos': apellidos,
            'direccionCasa': direccionCasa,
            'latitudCasa': latitudCasa,
            'longitudCasa': longitudCasa,
            'direccionTrabajo': direccionTrabajo,
            'latitudTrabajo': latitudTrabajo,
            'longitudTrabajo': longitudTrabajo
        })
    })
    .then(response => response.json()) //la respuesta se convierte en formato JSON
    .then(data => {
        if (data.message === "Usuario guardado exitosamente") {
            alert("Usuario agregado correctamente"); //si el usuario es agregado se envia una alerta
            limpiarMarcadores();  //se usa para eliminar los marcadores del mapa
            document.getElementById("registroForm").reset(); //se reinicia el formulario
        } else {
            alert("Error al agregar el usuario");
        }
    })
    .catch(error => {
        console.error('Error:', error);//si captura un error lo manda a la consola
        alert("Error en la conexión con el servidor");  //se envia una alerta indicando error en la conexión con el servidor
        });
}