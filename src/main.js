// -----------------------------------------------------------------
// 1. CONFIGURACIÓN INICIAL
// -----------------------------------------------------------------

// URL de nuestra API en el backend
// (Asegúrate de que tu backend 'node index.js' esté corriendo)
const API_URL = 'http://localhost:9000/api/autos';

// Referencias a los elementos del DOM (nuestro HTML)
const autoForm = document.getElementById('autoForm');
const tablaAutosBody = document.getElementById('tablaAutosBody');
const submitButton = document.getElementById('submitButton');
const cancelButton = document.getElementById('cancelButton');
const editAutoId = document.getElementById('editAutoId'); // El input oculto

// Validaciones de Bootstrap
(function () {
  'use strict';
  autoForm.addEventListener('submit', function (event) {
    if (!autoForm.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
    }
    autoForm.classList.add('was-validated');
  }, false);
})();

// -----------------------------------------------------------------
// 2. OPERACIONES CRUD (AQUÍ USAMOS PROMISES)
// -----------------------------------------------------------------

/**
 * R: LEER (Read)
 * Obtiene todos los autos de la API y los dibuja en la tabla.
 */
function obtenerAutos() {
  fetch(API_URL) // fetch() DEVUELVE UNA PROMISE

    // .then() para manejar el 'resolve' (éxito)
    .then(respuesta => {
      // La primera promise de fetch solo da la respuesta HTTP.
      // Necesitamos .json() para obtener los datos, que DEVUELVE OTRA PROMISE.
      return respuesta.json();
    })
    .then(autos => {
      // Este .then() recibe el resultado del .json() anterior
      dibujarTabla(autos);
    })

    // .catch() para manejar el 'reject' (error)
    .catch(error => {
      console.error('Error al obtener autos:', error);
      alert('No se pudieron cargar los autos. ¿El backend está corriendo?');
    });
}

/**
 * C: CREAR (Create)
 * Envía un nuevo auto a la API.
 */
function crearAuto(datosAuto) {
  fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datosAuto)
  }) // fetch() DEVUELVE UNA PROMISE

    .then(respuesta => respuesta.json())
    .then(nuevoAuto => {
      // Éxito:
      console.log('Auto creado:', nuevoAuto);
      resetearFormulario();
      obtenerAutos(); // Recargamos la tabla
    })
    .catch(error => {
      console.error('Error al crear auto:', error);
    });
}

/**
 * U: ACTUALIZAR (Update)
 * Envía los datos actualizados de un auto a la API.
 */
function actualizarAuto(id, datosAuto) {
  fetch(`${API_URL}/${id}`, { // Agregamos el ID a la URL
    method: 'PUT', // Usamos el método PUT
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datosAuto)
  }) // fetch() DEVUELVE UNA PROMISE

    .then(respuesta => respuesta.json())
    .then(autoActualizado => {
      // Éxito:
      console.log('Auto actualizado:', autoActualizado);
      resetearFormulario();
      obtenerAutos(); // Recargamos la tabla
    })
    .catch(error => {
      console.error('Error al actualizar auto:', error);
    });
}

/**
 * D: ELIMINAR (Delete)
 * Pide a la API que elimine un auto por su ID.
 */
function eliminarAuto(id) {
  if (!confirm('¿Estás seguro de que quieres eliminar este auto?')) {
    return; // Si el usuario cancela, no hacemos nada
  }

  fetch(`${API_URL}/${id}`, {
    method: 'DELETE'
  }) // fetch() DEVUELVE UNA PROMISE

    .then(respuesta => respuesta.json())
    .then(resultado => {
      // Éxito:
      console.log(resultado.msg); // Muestra "Auto eliminado"
      obtenerAutos(); // Recargamos la tabla
    })
    .catch(error => {
      console.error('Error al eliminar auto:', error);
    });
}

// -----------------------------------------------------------------
// 3. FUNCIONES AUXILIARES (Lógica del Frontend)
// -----------------------------------------------------------------

/**
 * Dibuja las filas en la tabla con los datos de los autos.
 */
function dibujarTabla(autos) {
  tablaAutosBody.innerHTML = ''; // Limpia la tabla

  if (autos.length === 0) {
    tablaAutosBody.innerHTML = '<tr><td colspan="6" class="text-center">No hay autos registrados.</td></tr>';
    return;
  }

  autos.forEach(auto => {
    const fila = document.createElement('tr');

    // Usamos 'auto._id' que es como Mongo llama al ID
    fila.innerHTML = `
      <td>${auto.marca}</td>
      <td>${auto.modelo}</td>
      <td>${auto.anio}</td>
      <td>$${auto.precio.toLocaleString()}</td>
      <td>${auto.transmision}</td>
      <td class="text-end">
        <button class="btn btn-warning btn-sm btn-editar" data-id="${auto._id}">
          <i class="bi bi-pencil-fill"></i>
        </button>
        <button class="btn btn-danger btn-sm btn-eliminar" data-id="${auto._id}">
          <i class="bi bi-trash-fill"></i>
        </button>
      </td>
    `;
    tablaAutosBody.appendChild(fila);
  });
}

/**
 * Maneja el envío del formulario (ya sea para Crear o Actualizar).
 */
function manejarSubmit(e) {
  e.preventDefault(); // Evita que la página se recargue

  if (!autoForm.checkValidity()) {
    // Si el formulario no es válido (campos requeridos faltantes),
    // Bootstrap mostrará los mensajes de error y no hacemos nada.
    return;
  }

  // Recolectamos todos los datos del formulario
  const datosAuto = {
    marca: document.getElementById('id_marca').value,
    modelo: document.getElementById('id_modelo').value,
    anio: document.getElementById('id_anio').value,
    precio: document.getElementById('id_precio').value,
    kilometraje: document.getElementById('id_kilometraje').value,
    color: document.getElementById('id_color').value,
    transmision: document.getElementById('id_transmision').value,
    combustible: document.getElementById('id_combustible').value,
    imagenUrl: document.getElementById('id_imagenUrl').value,
    descripcion: document.getElementById('id_descripcion').value
  };

  const id = editAutoId.value; // Leemos el ID del input oculto

  if (id) {
    // Si hay un ID, es una ACTUALIZACIÓN (Update)
    actualizarAuto(id, datosAuto);
  } else {
    // Si no hay ID, es una CREACIÓN (Create)
    crearAuto(datosAuto);
  }
}

/**
 * Maneja los clics en la tabla (para Editar y Eliminar).
 * Usamos "delegación de eventos".
 */
function manejarClicsTabla(e) {
  // Verificamos si el clic fue en un botón de editar
  if (e.target.classList.contains('btn-editar') || e.target.closest('.btn-editar')) {
    const id = e.target.dataset.id || e.target.closest('.btn-editar').dataset.id;
    prepararEdicion(id);
  }

  // Verificamos si el clic fue en un botón de eliminar
  if (e.target.classList.contains('btn-eliminar') || e.target.closest('.btn-eliminar')) {
    const id = e.target.dataset.id || e.target.closest('.btn-eliminar').dataset.id;
    eliminarAuto(id);
  }
}

/**
 * Prepara el formulario para editar un auto.
 * Busca el auto por ID y rellena el formulario con sus datos.
 */
function prepararEdicion(id) {
  // Hacemos un fetch para obtener los datos de ESE auto en específico
  fetch(`${API_URL}/${id}`) // Esto no existe... ¡Error!
  // CORRECCIÓN: No necesitamos hacer un fetch. Ya tenemos los datos...
  // Ah, no, no los tenemos. Un fetch es la forma más limpia.

  // ¡MI ERROR! No hemos creado la ruta "GET /api/autos/:id" en el backend.
  // ¡Vamos a agregarla! Es un segundo.
  // ...
  // NO, no la compliquemos. Es más fácil:
  // Cuando cargamos los datos para editar, buscamos el auto en la API
  // ¡Momento! La ruta para "obtener un auto" no está en el backend.

  // ---
  // CORRECCIÓN IMPORTANTE:
  // Para que "Editar" funcione, necesitamos una ruta en el backend
  // que nos dé los datos de UN SOLO auto.
  //
  // Ve a tu archivo `crud-backend/routes/autos.js`
  // Y AÑADE este código (antes del `module.exports`):
  /*
    // --- R: LEER (Consultar UNO) ---
    router.get('/:id', async (req, res) => {
      try {
        const auto = await Auto.findById(req.params.id);
        if (!auto) {
          return res.status(404).json({ msg: 'Auto no encontrado' });
        }
        res.json(auto);
      } catch (error) {
        res.status(500).json({ msg: 'Error al buscar el auto' });
      }
    });
  */
  // ---
  // ¡Ahora sí! Con esa ruta añadida en el backend (y reiniciándolo),
  // este código JS del frontend funcionará:

  fetch(`${API_URL}/${id}`) // Pedimos el auto por ID (PROMISE)
    .then(res => res.json())
    .then(auto => {
      // Rellenamos el formulario
      document.getElementById('id_marca').value = auto.marca;
      document.getElementById('id_modelo').value = auto.modelo;
      document.getElementById('id_anio').value = auto.anio;
      document.getElementById('id_precio').value = auto.precio;
      document.getElementById('id_kilometraje').value = auto.kilometraje;
      document.getElementById('id_color').value = auto.color;
      document.getElementById('id_transmision').value = auto.transmision;
      document.getElementById('id_combustible').value = auto.combustible;
      document.getElementById('id_imagenUrl').value = auto.imagenUrl;
      document.getElementById('id_descripcion').value = auto.descripcion;

      // Guardamos el ID en el input oculto
      editAutoId.value = auto._id;

      // Cambiamos el botón
      submitButton.textContent = 'Actualizar Auto';
      cancelButton.classList.remove('d-none'); // Mostramos el botón "Cancelar"
      autoForm.classList.remove('was-validated'); // Limpia validaciones

      // Mueve la pantalla al formulario
      autoForm.scrollIntoView({ behavior: 'smooth' });
    })
    .catch(err => console.error('Error al cargar auto para editar:', err));
}


/**
 * Limpia el formulario y lo resetea a su estado original.
 */
function resetearFormulario() {
  autoForm.reset(); // Limpia todos los inputs
  autoForm.classList.remove('was-validated'); // Quita los mensajes de validación

  editAutoId.value = ''; // Limpia el ID oculto

  submitButton.textContent = 'Agregar Auto'; // Resetea el botón
  cancelButton.classList.add('d-none'); // Oculta el botón "Cancelar"
}


// -----------------------------------------------------------------
// 4. EVENT LISTENERS (Los "oídos" de la app)
// -----------------------------------------------------------------

// 1. Cuando el contenido de la página cargue, busca los autos.
document.addEventListener('DOMContentLoaded', obtenerAutos);

// 2. Cuando se envíe el formulario, llama a 'manejarSubmit'.
autoForm.addEventListener('submit', manejarSubmit);

// 3. Cuando se haga clic en el botón "Cancelar", resetea el formulario.
cancelButton.addEventListener('click', resetearFormulario);

// 4. Cuando se haga clic EN CUALQUIER LUGAR de la tabla, llama a 'manejarClicsTabla'.
tablaAutosBody.addEventListener('click', manejarClicsTabla);


