// -----------------------------------------------------------------
// 1. CONFIGURACIÓN INICIAL
// -----------------------------------------------------------------

// CAMBIO IMPORTANTE: Ahora apuntamos a RENDER (La Nube)
const API_URL = 'https://api-autos-pedro.onrender.com/api/autos';

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
  // IMPORTANTE: Render tarda 1 minuto en despertar si está dormido.
  // Mostramos un mensaje en consola para saber que está intentando conectar.
  console.log("Intentando conectar con Render...");

  fetch(API_URL)
    .then(respuesta => {
      if (!respuesta.ok) throw new Error("Error en la respuesta del servidor");
      return respuesta.json();
    })
    .then(autos => {
      console.log("¡Conectado! Autos recibidos:", autos);
      dibujarTabla(autos);
    })
    .catch(error => {
      console.error('Error al obtener autos:', error);
      // Si falla, es probable que Render esté "despertando"
      // No mostramos alert cada vez para no molestar, pero sí en consola
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
  })
    .then(respuesta => respuesta.json())
    .then(nuevoAuto => {
      console.log('Auto creado:', nuevoAuto);
      resetearFormulario();
      obtenerAutos();
    })
    .catch(error => {
      console.error('Error al crear auto:', error);
      alert("Error al crear. Revisa la consola.");
    });
}

/**
 * U: ACTUALIZAR (Update)
 * Envía los datos actualizados de un auto a la API.
 */
function actualizarAuto(id, datosAuto) {
  fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datosAuto)
  })
    .then(respuesta => respuesta.json())
    .then(autoActualizado => {
      console.log('Auto actualizado:', autoActualizado);
      resetearFormulario();
      obtenerAutos();
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
    return;
  }

  fetch(`${API_URL}/${id}`, {
    method: 'DELETE'
  })
    .then(respuesta => respuesta.json())
    .then(resultado => {
      console.log(resultado.msg);
      obtenerAutos();
    })
    .catch(error => {
      console.error('Error al eliminar auto:', error);
    });
}

// -----------------------------------------------------------------
// 3. FUNCIONES AUXILIARES (Lógica del Frontend)
// -----------------------------------------------------------------

function dibujarTabla(autos) {
  tablaAutosBody.innerHTML = '';

  if (autos.length === 0) {
    tablaAutosBody.innerHTML = '<tr><td colspan="6" class="text-center">No hay autos registrados o Render está despertando...</td></tr>';
    return;
  }

  autos.forEach(auto => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${auto.marca}</td>
      <td>${auto.modelo}</td>
      <td>${auto.anio}</td>
      <td>$${Number(auto.precio).toLocaleString()}</td>
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

function manejarSubmit(e) {
  e.preventDefault();

  if (!autoForm.checkValidity()) {
    return;
  }

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

  const id = editAutoId.value;

  if (id) {
    actualizarAuto(id, datosAuto);
  } else {
    crearAuto(datosAuto);
  }
}

function manejarClicsTabla(e) {
  if (e.target.classList.contains('btn-editar') || e.target.closest('.btn-editar')) {
    const id = e.target.dataset.id || e.target.closest('.btn-editar').dataset.id;
    prepararEdicion(id);
  }

  if (e.target.classList.contains('btn-eliminar') || e.target.closest('.btn-eliminar')) {
    const id = e.target.dataset.id || e.target.closest('.btn-eliminar').dataset.id;
    eliminarAuto(id);
  }
}

function prepararEdicion(id) {
  // OJO: Esta función requiere que tu backend en Render tenga la ruta GET /:id
  fetch(`${API_URL}/${id}`)
    .then(res => res.json())
    .then(auto => {
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

      editAutoId.value = auto._id;

      submitButton.textContent = 'Actualizar Auto';
      cancelButton.classList.remove('d-none');
      autoForm.classList.remove('was-validated');
      autoForm.scrollIntoView({ behavior: 'smooth' });
    })
    .catch(err => console.error('Error al cargar auto para editar:', err));
}

function resetearFormulario() {
  autoForm.reset();
  autoForm.classList.remove('was-validated');
  editAutoId.value = '';
  submitButton.textContent = 'Agregar Auto';
  cancelButton.classList.add('d-none');
}

// -----------------------------------------------------------------
// 4. EVENT LISTENERS
// -----------------------------------------------------------------
document.addEventListener('DOMContentLoaded', obtenerAutos);
autoForm.addEventListener('submit', manejarSubmit);
cancelButton.addEventListener('click', resetearFormulario);
tablaAutosBody.addEventListener('click', manejarClicsTabla);