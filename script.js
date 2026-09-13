// El catálogo público lee los productos y su disponibilidad desde Supabase.
const tiendaSolicitada = new URLSearchParams(window.location.search).get("tienda");
let tiendaActual = Object.hasOwn(TIENDAS, tiendaSolicitada) ? tiendaSolicitada : "inversiones";
function actualizarTienda() {
    const tienda = TIENDAS[tiendaActual];
    document.title = tienda.nombre;
    const logo = document.querySelector(".logo");
    logo.src = tienda.logo;
    logo.alt = tienda.nombre;
    document.getElementById("tienda").value = tiendaActual;
    document.getElementById("estado-tienda").textContent = tienda.whatsapp
        ? "Pedidos y consultas con " + tienda.nombre
        : "Próximamente: pedidos por WhatsApp de Mariales. Puedes explorar nuestro catálogo.";
    document.getElementById("tienda-pedido").textContent = tienda.nombre;
    const enviar = document.getElementById("send-cart-whatsapp");
    enviar.disabled = !tienda.whatsapp;
    enviar.textContent = tienda.whatsapp ? "Enviar pedido por WhatsApp" : "WhatsApp de Mariales próximamente";
    document.querySelectorAll(".whatsapp-button").forEach(function (boton) {
        if (!tienda.whatsapp) {
            boton.removeAttribute("href");
            boton.setAttribute("aria-disabled", "true");
            boton.textContent = "WhatsApp próximamente";
            return;
        }
        const tarjeta = boton.closest(".product-card");
        const url = new URL(window.location.href);
        url.search = "";
        url.hash = "";
        url.searchParams.set("tienda", tiendaActual);
        url.searchParams.set("producto", tarjeta.querySelector("h3").textContent);
        url.searchParams.set("id", tarjeta.dataset.id);
        const mensaje = `Hola, quisiera consultar con ${tienda.nombre} por este producto:\n\n*${tarjeta.querySelector("h3").textContent}*\nPrecio: *${tarjeta.querySelector(".product-price").textContent}*\n\nVer producto:\n${url.href}`;
        boton.href = enlaceWhatsApp(mensaje);
        boton.removeAttribute("aria-disabled");
        boton.textContent = "Consultar por WhatsApp";
    });
}
document.getElementById("tienda").addEventListener("change", function (event) {
    if (!Object.hasOwn(TIENDAS, event.target.value)) return;
    tiendaActual = event.target.value;
    const url = new URL(window.location.href);
    url.searchParams.set("tienda", tiendaActual);
    window.history.replaceState(null, "", url);
    actualizarTienda();
});
actualizarTienda();

function escaparHTML(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, function (caracter) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[caracter];
    });
}

function enlaceWhatsApp(mensaje) {
    const numero = TIENDAS[tiendaActual].whatsapp;
    return numero ? `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}` : null;
}

async function iniciarCatalogo() {
let catalogo;
const estadoCarga = document.getElementById("estado-catalogo");
try {
    const respuesta = await fetch(`${CATALOGO_CONFIG.url}/rest/v1/productos?select=*&activo=eq.true&order=created_at.asc`, {headers: {apikey: CATALOGO_CONFIG.key}, signal: AbortSignal.timeout(8000)});
    if (!respuesta.ok) throw new Error("Catálogo remoto no disponible");
    catalogo = await respuesta.json();
} catch (error) {
    estadoCarga.textContent = "No pudimos cargar los productos. Revisa tu conexión y recarga la página.";
    return;
}

estadoCarga.hidden = true;
document.querySelectorAll(".category-card").forEach(boton => boton.disabled = false);
document.querySelectorAll(".products-section").forEach(function (seccion) {
    const categoria = seccion.id.replace("productos-", "");
    const grid = seccion.querySelector(".products-grid");
    const lista = catalogo.filter(function (producto) {
        return producto.categoria === categoria;
    });

    grid.innerHTML = lista.map(function (producto) {
        const nombreCompleto = `${producto.nombre} ${producto.marca}`;
        const precio = `US$ ${producto.precio.toFixed(2)}`;

        return `
            <article class="product-card" data-id="${escaparHTML(producto.id)}">
                <img src="${escaparHTML(producto.imagen)}" alt="${escaparHTML(nombreCompleto)}">
                <div class="product-info">
                    <p class="product-brand">${escaparHTML(producto.marca)}</p>
                    <h3>${escaparHTML(producto.nombre)}</h3>
                    <p class="product-detail">${escaparHTML(producto.detalle)}</p>
                    <p class="product-price">${precio}</p>
                    <button class="add-to-cart" data-id="${escaparHTML(producto.id)}" data-name="${escaparHTML(nombreCompleto)}" data-price="${producto.precio}" ${producto.disponible === false ? "disabled" : ""}>${producto.disponible === false ? "Agotado" : "Agregar al carrito"}</button>
                    <a class="whatsapp-button" aria-disabled="true">Consultar por WhatsApp</a>
                </div>
            </article>`;
    }).join("");

    if (lista.length === 0) {
        const aviso = document.createElement("p");
        aviso.className = "empty-category";
        aviso.textContent = "Aún no hay productos en esta categoría.";
        grid.after(aviso);
    }
});

actualizarTienda();

const categorias = document.querySelector(".categories-section");
const seccionesProductos = document.querySelectorAll(".products-section");

function ocultarTodasLasSecciones() {
    seccionesProductos.forEach(function (seccion) {
        seccion.style.display = "none";
    });
}

function mostrarCategorias() {
    ocultarTodasLasSecciones();
    restablecerProductos();
    categorias.style.display = "block";
}

function abrirCategoria(idSeccion) {
    if (!document.getElementById(idSeccion)) return;
    restablecerProductos();
    categorias.style.display = "none";
    ocultarTodasLasSecciones();

    const seccion = document.getElementById(idSeccion);

    if (seccion) {
        seccion.style.display = "block";
    }
}

ocultarTodasLasSecciones();

document.querySelectorAll(".category-card").forEach(function (boton) {
    boton.addEventListener("click", function () {
        abrirCategoria(boton.id.replace("btn-", "productos-"));
    });
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

function restablecerProductos() {
    buscador.value = "";
    document.querySelectorAll(".product-card").forEach(function (tarjeta) {
        tarjeta.style.display = "";
    });
}

const cartButton = document.getElementById("cart-button");
const cartPanel = document.getElementById("cart-panel");
const closeCart = document.getElementById("close-cart");

cartButton.addEventListener("click", function () {
    cartPanel.classList.add("active");
});

closeCart.addEventListener("click", function () {
    cartPanel.classList.remove("active");
});

let carrito = [];

const cartCount = document.getElementById("cart-count");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");

document.querySelectorAll(".add-to-cart").forEach(function (boton) {
    boton.addEventListener("click", function () {
        const nombre = boton.dataset.name;
        const id = boton.dataset.id;
        const precio = parseFloat(boton.dataset.price);

        const productoExistente = carrito.find(function (producto) {
            return producto.id === id;
        });

        if (productoExistente) {
            productoExistente.cantidad += 1;
        } else {
            carrito.push({
                id: id,
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

    carrito.forEach(function (producto, indice) {
        const subtotal = producto.precio * producto.cantidad;
        total += subtotal;

        cartItems.innerHTML += `
            <div class="cart-item">
                <strong>${escaparHTML(producto.nombre)}</strong>
                <p>US$ ${producto.precio.toFixed(2)}</p>

                <div class="cart-controls">
                    <button data-indice="${indice}" data-cambio="-1">−</button>
                    <span>${producto.cantidad}</span>
                    <button data-indice="${indice}" data-cambio="1">+</button>
                    <button data-indice="${indice}" data-eliminar="true">🗑️</button>
                </div>

                <p>Subtotal: US$ ${subtotal.toFixed(2)}</p>
            </div>
        `;
    });

    cartTotal.textContent = `US$ ${total.toFixed(2)}`;
}
cartItems.addEventListener("click", function (event) {
    const boton = event.target.closest("button[data-indice]");
    if (!boton) return;
    const producto = carrito[Number(boton.dataset.indice)];
    if (!producto) return;
    if (boton.dataset.eliminar) eliminarProducto(producto.id);
    else cambiarCantidad(producto.id, Number(boton.dataset.cambio));
});

function cambiarCantidad(id, cambio) {
    const producto = carrito.find(function (item) {
        return item.id === id;
    });

    if (!producto) return;

    producto.cantidad += cambio;

    if (producto.cantidad <= 0) {
        carrito = carrito.filter(function (item) {
            return item.id !== id;
        });
    }

    actualizarCarrito();
}

function eliminarProducto(id) {
    carrito = carrito.filter(function (item) {
        return item.id !== id;
    });

    actualizarCarrito();
}

document.getElementById("send-cart-whatsapp").addEventListener("click", function () {
    if (!TIENDAS[tiendaActual].whatsapp) return;
    if (carrito.length === 0) {
        alert("Tu carrito está vacío. Agrega productos antes de enviar el pedido.");
        return;
    }

    let mensaje = `Hola, quiero realizar el siguiente pedido con ${TIENDAS[tiendaActual].nombre}:\n\n`;
    let total = 0;

    carrito.forEach(function (producto) {
        const subtotal = producto.precio * producto.cantidad;
        total += subtotal;

        mensaje += `• ${producto.cantidad} x ${producto.nombre} — US$ ${subtotal.toFixed(2)}\n`;
    });

    mensaje += `\n*Total referencial: US$ ${total.toFixed(2)}*`;
    mensaje += "\n\nQuedo atento(a) a disponibilidad y confirmación. Gracias.";

    window.location.href = enlaceWhatsApp(mensaje);
});

// Los enlaces existentes por nombre siguen abriendo un solo producto.
const productoCompartido = new URLSearchParams(window.location.search).get("producto");
const idCompartido = new URLSearchParams(window.location.search).get("id");
if (productoCompartido || idCompartido) {
    const tarjetas = Array.from(document.querySelectorAll(".product-card"));
    const tarjeta = tarjetas.find(function (item) {
        if (idCompartido) return item.dataset.id === idCompartido;
        return item.querySelector("h3").textContent.trim().toLowerCase() ===
            productoCompartido.trim().toLowerCase();
    });
    if (tarjeta) {
        abrirCategoria(tarjeta.closest(".products-section").id);
        tarjetas.forEach(function (item) {
            item.style.display = item === tarjeta ? "" : "none";
        });
        setTimeout(function () {
            tarjeta.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 800);
    }
}

}
iniciarCatalogo();
