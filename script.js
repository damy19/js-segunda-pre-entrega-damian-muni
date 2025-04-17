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
        usuarioActual = JSON.parse(usuarioGuardado);
        mostrarApp();
        actualizarPantalla();
    }
});

// Iniciar sesión o crear cuenta
iniciarSesionBtn.addEventListener("click", () => {
    const nombre = nombreInput.value.trim();
    if (nombre === "") return;

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    // Buscar si el usuario ya existe
    let usuarioExistente = usuarios.find(u => u.nombre === nombre);

    if (usuarioExistente) {
        usuarioActual = usuarioExistente;
    } else {
        usuarioActual = new Usuario(nombre);
        usuarios.push(usuarioActual);
        localStorage.setItem("usuarios", JSON.stringify(usuarios));
    }

    localStorage.setItem("usuarioActual", JSON.stringify(usuarioActual));
    loginForm.classList.add("oculto");
    appDiv.classList.remove("oculto");

    mostrarApp();
    actualizarPantalla();
});

// Actualizar los datos en localStorage
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
        montoInput.value = ""; //  limpiar después del depósito
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
        montoInput.value = "";
    } else {
        alert("Saldo insuficiente o monto inválido.");
    }
});

// Mostrar la aplicación con el usuario cargado
function mostrarApp() {
    bienvenida.textContent = `Hola, ${usuarioActual.nombre}`;
    montoInput.value = ""; // 🔹 Limpiar input de monto al iniciar sesión
    actualizarPantalla();
}


// Actualizar el saldo y el historial de movimientos
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



