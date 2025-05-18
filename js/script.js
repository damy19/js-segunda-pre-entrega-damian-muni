// Variables globales
let usuarios = [];
let usuarioActual = null;

// Función para cargar usuarios desde JSON
async function cargarUsuariosDesdeJSON() {
    try {
        const respuesta = await fetch("data/usuarios.json");
        const data = await respuesta.json();
        console.log("Usuarios cargados desde JSON:", data);
        return data;
    } catch (error) {
        console.error("Error al cargar usuarios.json:", error);
        return [];
    }
}

// DOM
const usuarioInput = document.getElementById("usuarioInput");
const passwordInput = document.getElementById("passwordInput");
const iniciarSesionBtn = document.getElementById("iniciarSesionBtn");
const montoInput = document.getElementById("montoInput");
const depositarBtn = document.getElementById("depositarBtn");
const retirarBtn = document.getElementById("retirarBtn");
const saldoSpan = document.getElementById("saldo");
const historialUl = document.getElementById("historial");
const bienvenida = document.getElementById("bienvenida");
const loginForm = document.getElementById("loginForm");
const appDiv = document.getElementById("app");

const registroForm = document.getElementById("registroForm");
const irRegistroLink = document.getElementById("irRegistroLink");
const volverLoginLink = document.getElementById("volverLoginLink");
const registroNombre = document.getElementById("registroNombre");
const registroUsuario = document.getElementById("registroUsuario");
const registroPassword = document.getElementById("registroPassword");
const registrarseBtn = document.getElementById("registrarseBtn");

// Esperar a que cargue el DOM
window.addEventListener("DOMContentLoaded", async () => {
    // Intentar cargar usuarios desde localStorage
    const usuariosEnStorage = JSON.parse(localStorage.getItem("usuarios"));
    if (!usuariosEnStorage || usuariosEnStorage.length === 0) {
        usuarios = await cargarUsuariosDesdeJSON();
        localStorage.setItem("usuarios", JSON.stringify(usuarios));
        console.log("Usuarios iniciales cargados desde JSON y guardados en localStorage.");
    } else {
        usuarios = usuariosEnStorage;
        console.log("Usuarios cargados desde localStorage.");
    }

    // Intentar cargar sesión anterior
    const usuarioGuardado = localStorage.getItem("usuarioActual");
    if (usuarioGuardado) {
        usuarioActual = JSON.parse(usuarioGuardado);
        mostrarApp();
        actualizarPantalla();
    }
});

// Función para mostrar la app con el usuario cargado
function mostrarApp() {
    bienvenida.textContent = `Hola, ${usuarioActual.nombre}`;
    montoInput.value = "";
    loginForm.classList.add("oculto");
    registroForm.classList.add("oculto");
    appDiv.classList.remove("oculto");
    actualizarPantalla();
}

// Función para actualizar saldo y movimientos en pantalla
function actualizarPantalla() {
    if (!usuarioActual || !usuarioActual.cuentas || usuarioActual.cuentas.length === 0) {
        saldoSpan.textContent = "$0.00";
        historialUl.innerHTML = "";
        return;
    }

    const cuenta = usuarioActual.cuentas[0]; // Primera cuenta
    saldoSpan.textContent = `$${cuenta.saldo.toFixed(2)}`;
    historialUl.innerHTML = "";

    cuenta.movimientos.forEach(mov => {
        const li = document.createElement("li");
        li.textContent = `${mov.fecha} - ${mov.descripcion}: $${mov.monto}`;
        historialUl.appendChild(li);
    });
}

// Evento para iniciar sesión
iniciarSesionBtn.addEventListener("click", () => {
    const usuarioTxt = usuarioInput.value.trim();
    const passwordTxt = passwordInput.value.trim();

    if (!usuarioTxt || !passwordTxt) {
        alert("Completa usuario y contraseña.");
        return;
    }

    const usuarioEncontrado = usuarios.find(u => u.usuario === usuarioTxt && u.password === passwordTxt);

    if (usuarioEncontrado) {
        usuarioActual = usuarioEncontrado;
        localStorage.setItem("usuarioActual", JSON.stringify(usuarioActual));
        mostrarApp();
    } else {
        alert("Usuario o contraseña incorrectos.");
    }
});

// Actualizar localStorage con los datos actuales
function actualizarStorage() {
    if (!usuarioActual) return;
    localStorage.setItem("usuarioActual", JSON.stringify(usuarioActual));

    const usuariosEnStorage = JSON.parse(localStorage.getItem("usuarios")) || [];
    const index = usuariosEnStorage.findIndex(u => u.usuario === usuarioActual.usuario);
    if (index !== -1) {
        usuariosEnStorage[index] = usuarioActual;
        localStorage.setItem("usuarios", JSON.stringify(usuariosEnStorage));
    }
}

// Evento para depósito
depositarBtn.addEventListener("click", () => {
    const monto = parseFloat(montoInput.value);
    if (!usuarioActual) return alert("No hay usuario activo.");
    if (isNaN(monto) || monto <= 0) return alert("Ingrese un monto válido.");

    const cuenta = usuarioActual.cuentas[0];
    cuenta.saldo += monto;
    cuenta.movimientos.push({
        fecha: new Date().toLocaleDateString(),
        descripcion: "Depósito",
        monto: monto
    });

    actualizarPantalla();
    actualizarStorage();
    montoInput.value = "";
});

// Evento para retiro
retirarBtn.addEventListener("click", () => {
    const monto = parseFloat(montoInput.value);
    if (!usuarioActual) return alert("No hay usuario activo.");
    if (isNaN(monto) || monto <= 0) return alert("Ingrese un monto válido.");

    const cuenta = usuarioActual.cuentas[0];
    if (monto > cuenta.saldo) {
        alert("Saldo insuficiente.");
        return;
    }

    cuenta.saldo -= monto;
    cuenta.movimientos.push({
        fecha: new Date().toLocaleDateString(),
        descripcion: "Retiro",
        monto: -monto
    });

    actualizarPantalla();
    actualizarStorage();
    montoInput.value = "";
});

// Cerrar sesión
document.getElementById("cerrarSesionBtn").addEventListener("click", () => {
    localStorage.removeItem("usuarioActual");
    usuarioActual = null;
    appDiv.classList.add("oculto");
    loginForm.classList.remove("oculto");
    registroForm.classList.add("oculto");
    historialUl.innerHTML = "";
    saldoSpan.textContent = "$0.00";
    usuarioInput.value = "";
    passwordInput.value = "";
    montoInput.value = "";
});

// Mostrar formulario de registro
irRegistroLink.addEventListener("click", () => {
  loginForm.classList.add("oculto");
  registroForm.classList.remove("oculto");
});

// Volver al login
volverLoginLink.addEventListener("click", () => {
  registroForm.classList.add("oculto");
  loginForm.classList.remove("oculto");
});

// Evento para registrar nuevo usuario
registrarseBtn.addEventListener("click", () => {
  const nombre = registroNombre.value.trim();
  const usuario = registroUsuario.value.trim();
  const password = registroPassword.value.trim();

  if (!nombre || !usuario || !password) {
    alert("Completá todos los campos.");
    return;
  }

  const existe = usuarios.some(u => u.usuario === usuario);
  if (existe) {
    alert("Ese nombre de usuario ya existe.");
    return;
  }

  const nuevoUsuario = {
    id: Date.now(),
    nombre,
    usuario,
    password,
    cuentas: [
      {
        saldo: 0,
        movimientos: []
      }
    ]
  };

  usuarios.push(nuevoUsuario);
  localStorage.setItem("usuarios", JSON.stringify(usuarios));

  // Loguear directamente al nuevo usuario
  usuarioActual = nuevoUsuario;
  localStorage.setItem("usuarioActual", JSON.stringify(usuarioActual));

  // Ocultar formularios y mostrar la app
  registroForm.classList.add("oculto");
  loginForm.classList.add("oculto");
  mostrarApp();
});






