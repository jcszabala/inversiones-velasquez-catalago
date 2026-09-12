const categorias = document.querySelector(".categories-section");
const seccionesProductos = document.querySelectorAll(".products-section");

function ocultarTodasLasSecciones() {
    seccionesProductos.forEach(function (seccion) {
        seccion.style.display = "none";
    });
}

function mostrarCategorias() {
    ocultarTodasLasSecciones();
    categorias.style.display = "block";
}

function abrirCategoria(idSeccion) {
    categorias.style.display = "none";
    ocultarTodasLasSecciones();

    const seccion = document.getElementById(idSeccion);

    if (seccion) {
        seccion.style.display = "block";
    }
}

ocultarTodasLasSecciones();

document.getElementById("btn-unas").addEventListener("click", function () {
    abrirCategoria("productos-unas");
});

document.getElementById("btn-pestanas").addEventListener("click", function () {
    abrirCategoria("productos-pestanas");
});

document.getElementById("btn-maquinaria").addEventListener("click", function () {
    abrirCategoria("productos-maquinaria");
});

document.getElementById("btn-peluqueria").addEventListener("click", function () {
    abrirCategoria("productos-peluqueria");
});

document.getElementById("btn-barberia").addEventListener("click", function () {
    abrirCategoria("productos-barberia");
});

document.getElementById("btn-maquillaje").addEventListener("click", function () {
    abrirCategoria("productos-maquillaje");
});

document.querySelectorAll(".volver-categorias").forEach(function (boton) {
    boton.addEventListener("click", mostrarCategorias);
});

const buscador = document.querySelector(".search-box input");

buscador.addEventListener("input", function () {
    const texto = buscador.value.toLowerCase().trim();
    const productos = document.querySelectorAll(".product-card");

    productos.forEach(function (producto) {
        const contenido = producto.textContent.toLowerCase();

        if (contenido.includes(texto)) {
            producto.style.display = "block";
        } else {
            producto.style.display = "none";
        }
    });
});

const numeroWhatsApp = "584243256912";

document.querySelectorAll(".whatsapp-button").forEach(function (boton) {
    const producto = boton.dataset.producto;

    if (producto) {
        const mensaje = `Hola 👋 Estoy interesado(a) en ${producto}`;
        const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;

        boton.href = url;
        boton.target = "_blank";
    }
});