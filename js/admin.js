document.addEventListener('DOMContentLoaded', obtenerUsuarios); // Cuando el HTML esta completamente cargado se llama una función obtenerUsuarios el cual recupera los datos de estos

let usuarios = []; //se define un array vacio donde se almacenara los datos de los usuarios

function obtenerUsuarios() { //se define una función obtenerUsuarios
    fetch('http://localhost:5000/usuarios') //se usa un fetch para realizar la solicitud de GET a la api
        .then(response => response.json())
        .then(data => {
            usuarios = data;  //Se guardan los usuarios en el array
            mostrarUsuarios(usuarios);  //Se muestran los datos de los usuarios
        })
        .catch(error => console.error('Error al obtener usuarios:', error)); //si hay un error en consola se manda un mensaje
}

function mostrarUsuarios(usuarios) { //se define una función mostrarUsuarios
    const usuariosBody = document.getElementById('usuariosBody'); //se selecciona el elemento del HTML con el id usuarios body esto ya que contiene las filas de datos del usuario
    usuariosBody.innerHTML = ''; //Se vacia el contenido de usuariosBody esto con el fin de evitar que se dupliquen filas de usuarios

    usuarios.forEach(usuario => {
        const row = document.createElement('tr'); //Para cada usuario se crea una fila tr para la tabla con sus datos td
        row.innerHTML = `
            <td>${usuario.documento}</td>
            <td>${usuario.nombres}</td>
            <td>${usuario.apellidos}</td>
            <td>${usuario.direccionCasa}</td>
            <td>${usuario.latitudCasa}</td>
            <td>${usuario.longitudCasa}</td>
            <td>${usuario.direccionTrabajo}</td>
            <td>${usuario.latitudTrabajo}</td>
            <td>${usuario.longitudTrabajo}</td>
            <td>${usuario.distancia_km.toFixed(2)} km</td>
            <td>
                <button onclick="eliminarUsuario(${usuario.documento})">Eliminar</button> 
            </td> 
        `//Se agrega un boton en cada fila para realizar la eliminación de usuario cuando le den clic;
        usuariosBody.appendChild(row); // La fila se añade a usuariosBody
    });
}

function ordenarMenorAMayor() { //se define una función para ordenar de menor a mayor
    const usuariosOrdenados = [...usuarios].sort((a, b) => a.distancia_km - b.distancia_km); //se ordena los usuarios de menor a mayor según la distancia
    mostrarUsuarios(usuariosOrdenados); //se actualiza la tabla con el nuevo orden
}

function ordenarMayorAMenor() { //se define una función para ordenar de mayor a menor
    const usuariosOrdenados = [...usuarios].sort((a, b) => b.distancia_km - a.distancia_km); //se ordena los usuarios de mayor a menor según la distancia
    mostrarUsuarios(usuariosOrdenados); //Se actualiza la tabla con el nuevo orden
}

function eliminarUsuario(documento) { //se define la función eliminarUsuario con el parametro documento del suario
    if (confirm("¿Estás seguro de que quieres eliminar este usuario?")) { // a la hora de eliminar manda un mensaje si se desea eliminar el usuario
        fetch(`http://localhost:5000/delete/${documento}`, { method: 'DELETE' }) //se envia la solicitud a la api con la url
            .then(response => response.json()) //se procesa la respuesta con formato JSON
            .then(data => {
                console.log(data.message);
                obtenerUsuarios(); // al ser existoso se llama a obtener usuario para actualizar la lista
            })
            .catch(error => console.error('Error al eliminar usuario:', error)); //si hay error al eliminar el usuario la consola manda un mensaje
    }
}
