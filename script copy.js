// Función constructora de Usuario 
function Usuario(nombre) {
    this.nombre = nombre;
    this.saldo = 0;
    this.movimientos = [];
}

// Función constructora de Movimiento
function Movimiento(tipo, monto) {
    this.tipo = tipo;
    this.monto = monto;
    this.fecha = new Date().toLocaleString();
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

// Cargar usuario si existe
window.addEventListener("DOMContentLoaded", () => {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
        usuarioActual = JSON.parse(usuarioGuardado);
        mostrarApp();
    }
});

// Iniciar sesión o crear cuenta
iniciarSesionBtn.addEventListener("click", () => {
    const nombre = nombreInput.value.trim();

    if (nombre === "") return;

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    let usuarioExistente = usuarios.find(u => u.nombre === nombre);

    if (usuarioExistente) {
        usuarioActual = new Usuario(usuarioExistente.nombre);
        usuarioActual.saldo = usuarioExistente.saldo;
        usuarioActual.movimientos = usuarioExistente.movimientos;
    } else {
        usuarioActual = new Usuario(nombre);
        usuarios.push(usuarioActual);
        localStorage.setItem("usuarios", JSON.stringify(usuarios));
    }

    localStorage.setItem("usuarioActual", JSON.stringify(usuarioActual));
    loginForm.classList.add("oculto");
    appDiv.classList.remove("oculto");
    mostrarUsuario();
    actualizarPantalla(); // Asegurarse de actualizar la pantalla con los datos del nuevo usuario
});


// Actualiza los datos en localStorage
function actualizarStorage() {
    localStorage.setItem("usuarioActual", JSON.stringify(usuarioActual));

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    let index = usuarios.findIndex(u => u.nombre === usuarioActual.nombre);
    if (index !== -1) {
        usuarios[index] = usuarioActual;
        localStorage.setItem("usuarios", JSON.stringify(usuarios));
    }
}

// Realizar un depósito
depositarBtn.addEventListener("click", () => {
    const monto = parseFloat(montoInput.value);
    if (monto > 0) {
        usuarioActual.saldo += monto;
        usuarioActual.movimientos.push(new Movimiento("Depósito", monto));
        actualizarPantalla();
        actualizarStorage();
    }
});

// Realizar un retiro
retirarBtn.addEventListener("click", () => {
    const monto = parseFloat(montoInput.value);
    if (monto > 0 && monto <= usuarioActual.saldo) {
        usuarioActual.saldo -= monto;
        usuarioActual.movimientos.push(new Movimiento("Retiro", monto));
        actualizarPantalla();
        actualizarStorage();
    } else {
        alert("Saldo insuficiente o monto inválido.");
    }
});

// Mostrar datos en pantalla
function mostrarApp() {
    bienvenida.textContent = `Hola, ${usuarioActual.nombre}`;
    actualizarPantalla();
}

// Actualiza el saldo y los movimientos
function actualizarPantalla() {
    saldoSpan.textContent = usuarioActual.saldo.toFixed(2);
    historialUl.innerHTML = "";
    usuarioActual.movimientos.forEach((mov) => {
        const li = document.createElement("li");
        li.textContent = `${mov.fecha} - ${mov.tipo}: $${mov.monto}`;
        historialUl.appendChild(li);
    });
}

// Cerrar sesión
document.getElementById("cerrarSesionBtn").addEventListener("click", () => {
    localStorage.removeItem("usuarioActual");
    usuarioActual = null; 
    appDiv.classList.add("oculto");
    loginForm.classList.remove("oculto");
    historialUl.innerHTML = ""; 
    saldoSpan.textContent = "$0.00"; 
});

