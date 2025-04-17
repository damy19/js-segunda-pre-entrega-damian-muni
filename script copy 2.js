// Función constructora de Usuario 
function Usuario(nombre) {
    this.nombre = nombre;
    this.saldo = 0; // Saldo inicial es 0
    this.movimientos = []; // No hay movimientos inicialmente
}

// Función constructora de Movimiento
function Movimiento(tipo, monto) {
    this.tipo = tipo;
    this.monto = monto;
    this.fecha = new Date().toLocaleString(); // Fecha del movimiento
}

// DOM
const nombreInput = document.getElementById("nombreInput");
const iniciarSesionBtn = document.getElementById("iniciarSesionBtn");
const montoInput = document.getElementById("montoInput");
const depositarBtn = document.getElementById("depositarBtn");
const retirarBtn = document.getElementById("retirarBtn");
const saldoSpan = document.getElementById("saldo");
const historialUl = document.getElementById("historial");
const bienvenida = document.getElementById("bienvenida");
const loginForm = document.getElementById("loginForm");
const appDiv = document.getElementById("app");

let usuarioActual = null;

// Cargar usuario si existe en localStorage
window.addEventListener("DOMContentLoaded", () => {
    const usuarioGuardado = localStorage.getItem("usuarioActual");
    if (usuarioGuardado) {
        // Si el usuario existe en el localStorage, lo cargamos
        usuarioActual = JSON.parse(usuarioGuardado);
        mostrarApp();  // Mostrar la aplicación con los datos cargados
        actualizarPantalla();  // Actualizar la pantalla con saldo y movimientos
    }
});

// Iniciar sesión o crear cuenta
iniciarSesionBtn.addEventListener("click", () => {
    const nombre = nombreInput.value.trim();

    if (nombre === "") return;  // Validación para que no quede vacío

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    // Buscar si el usuario ya existe
    let usuarioExistente = usuarios.find(u => u.nombre === nombre);

    if (usuarioExistente) {
        // Si existe, usamos los datos guardados
        usuarioActual = new Usuario(usuarioExistente.nombre);
        usuarioActual.saldo = usuarioExistente.saldo;
        usuarioActual.movimientos = usuarioExistente.movimientos;
    } else {
        // Si no existe, creamos un nuevo usuario
        usuarioActual = new Usuario(nombre);
        usuarios.push(usuarioActual);
        localStorage.setItem("usuarios", JSON.stringify(usuarios));  // Guardar usuario nuevo
    }

    // Guardamos el usuario actual en el localStorage
    localStorage.setItem("usuarioActual", JSON.stringify(usuarioActual));

    // Cambiar a la vista de la app
    loginForm.classList.add("oculto");
    appDiv.classList.remove("oculto");

    // Actualizar pantalla con la información del usuario
    mostrarUsuario();
    actualizarPantalla();
});

// Actualizar los datos en localStorage
function actualizarStorage() {
    localStorage.setItem("usuarioActual", JSON.stringify(usuarioActual));

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    let index = usuarios.findIndex(u => u.nombre === usuarioActual.nombre);
    if (index !== -1) {
        usuarios[index] = usuarioActual;  // Actualizamos la información del usuario
        localStorage.setItem("usuarios", JSON.stringify(usuarios));  // Guardar los cambios
    }
}

// Realizar un depósito
depositarBtn.addEventListener("click", () => {
    const monto = parseFloat(montoInput.value);
    if (monto > 0) {
        usuarioActual.saldo += monto;  // Sumar el monto al saldo
        usuarioActual.movimientos.push(new Movimiento("Depósito", monto));  // Agregar movimiento
        actualizarPantalla();  // Actualizar la pantalla
        actualizarStorage();  // Guardar los cambios en localStorage
    }
});

// Realizar un retiro
retirarBtn.addEventListener("click", () => {
    const monto = parseFloat(montoInput.value);
    if (monto > 0 && monto <= usuarioActual.saldo) {
        usuarioActual.saldo -= monto;  // Restar el monto al saldo
        usuarioActual.movimientos.push(new Movimiento("Retiro", monto));  // Agregar movimiento
        actualizarPantalla();  // Actualizar la pantalla
        actualizarStorage();  // Guardar los cambios en localStorage
    } else {
        alert("Saldo insuficiente o monto inválido.");
    }
});

// Mostrar la aplicación con el usuario cargado
function mostrarApp() {
    bienvenida.textContent = `Hola, ${usuarioActual.nombre}`;  // Saludo con el nombre del usuario
    actualizarPantalla();  // Actualizar la pantalla con el saldo y el historial
}

// Actualizar el saldo y el historial de movimientos
function actualizarPantalla() {
    saldoSpan.textContent = usuarioActual.saldo.toFixed(2);  // Mostrar el saldo actual formateado
    historialUl.innerHTML = "";  // Limpiar historial actual
    usuarioActual.movimientos.forEach((mov) => {
        const li = document.createElement("li");
        li.textContent = `${mov.fecha} - ${mov.tipo}: $${mov.monto}`;  // Mostrar el tipo de movimiento, la fecha y el monto
        historialUl.appendChild(li);
    });
}

// Cerrar sesión
document.getElementById("cerrarSesionBtn").addEventListener("click", () => {
    localStorage.removeItem("usuarioActual");  // Eliminar al usuario de localStorage
    usuarioActual = null;  // Limpiar el usuario actual
    appDiv.classList.add("oculto");  // Ocultar la vista de la app
    loginForm.classList.remove("oculto");  // Mostrar el formulario de login
    historialUl.innerHTML = "";  // Limpiar el historial
    saldoSpan.textContent = "$0.00";  // Resetear saldo a 0
});


