// Generar automáticamente los productos desde productos.js
const gridUnas = document.querySelector("#productos-unas .products-grid");

if (gridUnas && typeof productos !== "undefined") {

    const productosUnas = productos.filter(function (producto) {
        return producto.categoria === "unas";
    });

    productosUnas.forEach(function (producto) {

        gridUnas.insertAdjacentHTML("beforeend", `
            <article class="product-card">

                <img
                    src="${producto.imagen}"
                    alt="${producto.nombre} ${producto.marca}"
                >

                <div class="product-info">

                    <p class="product-brand">${producto.marca}</p>

                    <h3>${producto.nombre}</h3>

                    <p class="product-detail">${producto.detalle}</p>

                    <p class="product-price">
                        US$ ${producto.precio.toFixed(2)}
                    </p>

                    <button
                        class="add-to-cart"
                        data-name="${producto.nombre} ${producto.marca}"
                        data-price="${producto.precio}">
                        Agregar al carrito
                    </button>

                    <a
                        class="whatsapp-button"
                        href="#"
                        data-producto="${producto.nombre} ${producto.marca}">
                        Consultar por WhatsApp
                    </a>

                </div>

            </article>
        `);
    });
}

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
});const cartButton = document.getElementById("cart-button");
const cartPanel = document.getElementById("cart-panel");
const closeCart = document.getElementById("close-cart");

cartButton.addEventListener("click", function () {
    cartPanel.classList.add("active");
});

closeCart.addEventListener("click", function () {
    cartPanel.classList.remove("active");
});let carrito = [];

const cartCount = document.getElementById("cart-count");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");

document.querySelectorAll(".add-to-cart").forEach(function (boton) {
    boton.addEventListener("click", function () {
        const nombre = boton.dataset.name;
        const precio = parseFloat(boton.dataset.price);

        const productoExistente = carrito.find(function (producto) {
            return producto.nombre === nombre;
        });

        if (productoExistente) {
            productoExistente.cantidad += 1;
        } else {
            carrito.push({
                nombre: nombre,
                precio: precio,
                cantidad: 1
            });
        }

        actualizarCarrito();
    });
});

function actualizarCarrito() {
    const totalProductos = carrito.reduce(function (total, producto) {
        return total + producto.cantidad;
    }, 0);

    cartCount.textContent = totalProductos;

    if (carrito.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
        cartTotal.textContent = "US$ 0.00";
        return;
    }

    cartItems.innerHTML = "";

    let total = 0;

    carrito.forEach(function (producto) {
        const subtotal = producto.precio * producto.cantidad;
        total += subtotal;

        cartItems.innerHTML += `
            <div class="cart-item">
                <strong>${producto.nombre}</strong>
                <p>US$ ${producto.precio.toFixed(2)}</p>

                <div class="cart-controls">
                    <button onclick="cambiarCantidad('${producto.nombre}', -1)">−</button>
                    <span>${producto.cantidad}</span>
                    <button onclick="cambiarCantidad('${producto.nombre}', 1)">+</button>
                    <button onclick="eliminarProducto('${producto.nombre}')">🗑️</button>
                </div>

                <p>Subtotal: US$ ${subtotal.toFixed(2)}</p>
            </div>
        `;
    });

    cartTotal.textContent = `US$ ${total.toFixed(2)}`;
}
function cambiarCantidad(nombre, cambio) {
    const producto = carrito.find(function (item) {
        return item.nombre === nombre;
    });

    if (!producto) return;

    producto.cantidad += cambio;

    if (producto.cantidad <= 0) {
        carrito = carrito.filter(function (item) {
            return item.nombre !== nombre;
        });
    }

    actualizarCarrito();
}

function eliminarProducto(nombre) {
    carrito = carrito.filter(function (item) {
        return item.nombre !== nombre;
    });

    actualizarCarrito();
}

document.getElementById("send-cart-whatsapp").addEventListener("click", function () {
    if (carrito.length === 0) {
        alert("Tu carrito está vacío. Agrega productos antes de enviar el pedido.");
        return;
    }

    let mensaje = "Hola, quiero realizar el siguiente pedido:%0A%0A";
    let total = 0;

    carrito.forEach(function (producto) {
        const subtotal = producto.precio * producto.cantidad;
        total += subtotal;

        mensaje += `• ${producto.cantidad} x ${producto.nombre} — US$ ${subtotal.toFixed(2)}%0A`;
    });

    mensaje += `%0A*Total referencial: US$ ${total.toFixed(2)}*`;
    mensaje += "%0A%0AQuedo atento(a) a disponibilidad y confirmación. Gracias.";

    const numeroWhatsApp = "584243256912";

    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensaje}`;

window.location.href = urlWhatsApp;
});

// Crear automáticamente el botón "Agregar al carrito"
// para todos los productos del catálogo
document.querySelectorAll(".product-card").forEach(function (card) {

    // Si ya tiene botón de carrito, no hacemos nada
    if (card.querySelector(".add-to-cart")) return;

    const nombre = card.querySelector("h3");
    const precio = card.querySelector(".product-price");
    const productInfo = card.querySelector(".product-info");

    if (!nombre || !precio || !productInfo) return;

    const precioNumero = precio.textContent
        .replace("US$", "")
        .trim();

    const boton = document.createElement("button");

    boton.className = "add-to-cart";
    boton.dataset.name = nombre.textContent.trim();
    boton.dataset.price = precioNumero;
    boton.textContent = "Agregar al carrito";

    const whatsappButton = productInfo.querySelector(".whatsapp-button");

    if (whatsappButton) {
        productInfo.insertBefore(boton, whatsappButton);
    } else {
        productInfo.appendChild(boton);
    }
});

// Crear automáticamente el botón "Consultar por WhatsApp"
document.querySelectorAll(".product-card").forEach(function (card) {

    // Si ya existe, no lo duplicamos
    if (card.querySelector(".whatsapp-button")) return;

    const productInfo = card.querySelector(".product-info");

    if (!productInfo) return;

    const whatsappButton = document.createElement("a");

    whatsappButton.className = "whatsapp-button";
    whatsappButton.textContent = "Consultar por WhatsApp";
    whatsappButton.href = "#";

    productInfo.appendChild(whatsappButton);
});
// Configurar automáticamente los botones de consulta por WhatsApp
document.querySelectorAll(".product-card").forEach(function (card) {
    const nombre = card.querySelector("h3");
    const precio = card.querySelector(".product-price");
    const imagen = card.querySelector("img");
    const whatsappButton = card.querySelector(".whatsapp-button");

    if (!nombre || !precio || !imagen || !whatsappButton) return;

    whatsappButton.addEventListener("click", function (event) {
        event.preventDefault();

        const nombreProducto = nombre.textContent.trim();
        const precioProducto = precio.textContent.trim();

        const urlImagen = new URL(
            imagen.getAttribute("src"),
            window.location.href
        ).href;
const urlProducto =
    `${window.location.origin}${window.location.pathname}?producto=${encodeURIComponent(nombreProducto)}`;
        const mensaje =
  `Hola, quisiera consultar por este producto:\n\n` +
  `*${nombreProducto}*\n` +
  `Precio: *${precioProducto}*\n\n` +
  `Ver producto:\n${urlProducto}`;

        const numeroWhatsApp = "584243256912";

        const urlWhatsApp =
            `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;

        window.location.href = urlWhatsApp;
    });
});

// Abrir directamente un producto desde un enlace compartido
const parametrosURL = new URLSearchParams(window.location.search);
const productoCompartido = parametrosURL.get("producto");

if (productoCompartido) {

    const tarjetas = document.querySelectorAll(".product-card");

    tarjetas.forEach(function (tarjeta) {

        const nombre = tarjeta.querySelector("h3");

        if (
            nombre &&
            nombre.textContent.trim().toLowerCase() ===
            productoCompartido.trim().toLowerCase()
        ) {
            tarjetas.forEach(function (otraTarjeta) {
    otraTarjeta.style.display = "none";
});

tarjeta.style.display = "block";

            const seccion = tarjeta.closest(".products-section");

            if (seccion) {
                abrirCategoria(seccion.id);

                setTimeout(function () {
                    tarjeta.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });
                }, 800);
            }
        }
    });
}