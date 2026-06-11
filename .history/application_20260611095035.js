let carrito = JSON.parse(localStorage.getItem("carrito_actual")) || [];

function mostrarSeccion(seccionId) {
    const secciones = ['landing', 'catalogo', 'auth-box', 'perfil-box', 'admin-box', 'carrito-box'];
    secciones.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    
    if (seccionId === 'admin-box') {
        const user = Auth.getUsuarioActivo();
        if (!user || user.rol !== 'Administrador') {
            mostrarSeccion('landing');
            alert("Acceso denegado. Solo administradores.");
            return;
        }
    }

    document.getElementById(seccionId).classList.remove('hidden');
    if (seccionId === 'catalogo') renderizarCatalogo();
    if (seccionId === 'admin-box') renderizarAdmin();
    if (seccionId === 'carrito-box') renderizarCarrito();
    if (seccionId === 'perfil-box') cargarDatosPerfil();
}

function inicializarTema() {
    const temaGuardado = localStorage.getItem("tema") || "light";
    if (temaGuardado === "dark") {
        document.documentElement.classList.add("dark");
    } else {
        document.documentElement.classList.remove("dark");
    }
}

function alternarTema() {
    if (document.documentElement.classList.contains("dark")) {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("tema", "light");
    } else {
        document.documentElement.classList.add("dark");
        localStorage.setItem("tema", "dark");
    }
}

function actualizarEstadoRed() {
    const indicador = document.getElementById("network-status");
    if (navigator.onLine) {
        indicador.textContent = "Online";
        indicador.className = "px-3 py-1 text-xs font-bold rounded-full bg-green-500 text-white";
        procesarColaOffline();
    } else {
        indicador.textContent = "Offline";
        indicador.className = "px-3 py-1 text-xs font-bold rounded-full bg-red-500 text-white";
    }
}

function procesarColaOffline() {
    let cola = JSON.parse(localStorage.getItem("cola_compras")) || [];
    if (cola.length > 0) {
        let ventas = JSON.parse(localStorage.getItem("ventas")) || [];
        ventas = [...ventas, ...cola];
        localStorage.setItem("ventas", JSON.stringify(ventas));
        localStorage.setItem("cola_compras", JSON.stringify([]));
        alert("¡Te has vuelto a conectar! Tus compras offline han sido sincronizadas.");
        if (document.getElementById("admin-box").classList.contains("hidden") === false) {
            renderizarAdmin();
        }
    }
}

function renderizarCatalogo() {
    const productos = JSON.parse(localStorage.getItem("productos")) || [];
    const contenedor = document.getElementById("grid-productos");
    const buscador = document.getElementById("search-input").value.toLowerCase();
    const categoryFilter = document.getElementById("category-filter");
    const priceFilter = document.getElementById("price-filter");
    
    const categoria = categoryFilter ? categoryFilter.value : "todos";
    const precioMax = priceFilter ? (parseFloat(priceFilter.value) || Infinity) : Infinity;

    const priceLabel = document.getElementById("price-label");
    if (priceLabel) {
        priceLabel.textContent = precioMax === Infinity ? "Cualquiera" : `$${precioMax}`;
    }

    if (!contenedor) return;
    contenedor.innerHTML = "";

    const productosFiltrados = productos.filter(p => {
        const cumpleTexto = p.title.toLowerCase().includes(buscador) || p.description.toLowerCase().includes(buscador);
        const cumpleCat = categoria === "todos" || p.category === categoria;
        const cumplePrecio = p.price <= precioMax;
        return cumpleTexto && cumpleCat && cumplePrecio;
    });

    if (productosFiltrados.length === 0) {
        contenedor.innerHTML = `<p class="text-center col-span-full text-gray-500 py-10">No se encontraron productos.</p>`;
        return;
    }

    productosFiltrados.forEach(p => {
        const div = document.createElement("div");
        div.className = "bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md flex flex-col justify-between";
        div.innerHTML = `
            <img src="${p.image}" class="h-40 object-contain w-full mb-4 bg-white p-2 rounded">
            <div>
                <h3 class="font-bold text-gray-900 dark:text-white line-clamp-2">${p.title}</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 capitalize">${p.category}</p>
                <div class="flex items-center my-2 text-yellow-500 text-sm">
                    ⭐ ${p.rating.rate} (${p.rating.count})
                </div>
                <p class="text-xl font-extrabold text-blue-600 dark:text-blue-400">$${p.price}</p>
                <p class="text-xs text-gray-400 mt-1">Stock disponible: ${p.stock}</p>
            </div>
            <div class="mt-4 space-y-2">
                <button onclick="agregarAlCarrito(${p.id})" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm transition cursor-pointer">
                    Añadir al Carrito
                </button>
                <button onclick="verDetalleProducto(${p.id})" class="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-1 rounded-lg text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer">
                    Ver Reseñas
                </button>
            </div>
        `;
        contenedor.appendChild(div);
    });
    actualizarDestacadosLanding();
}

function actualizarDestacadosLanding() {
    const productos = JSON.parse(localStorage.getItem("productos")) || [];
    const contenedor = document.getElementById("productos-destacados");
    if (!contenedor) return;

    const destacados = [...productos].sort((a, b) => b.rating.rate - a.rating.rate).slice(0, 3);
    contenedor.innerHTML = "";

    destacados.forEach(p => {
        contenedor.innerHTML += `
            <div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md flex flex-col items-center text-center">
                <img src="${p.image}" class="h-32 object-contain mb-2 bg-white p-2 rounded">
                <h4 class="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">${p.title}</h4>
                <p class="text-yellow-500 text-xs my-1">⭐ ${p.rating.rate}</p>
                <p class="text-blue-600 dark:text-blue-400 font-bold">$${p.price}</p>
            </div>
        `;
    });
}

function agregarAlCarrito(id) {
    const productos = JSON.parse(localStorage.getItem("productos")) || [];
    const prod = productos.find(p => p.id === id);
    if (!prod || prod.stock <= 0) {
        alert("Producto sin stock suficiente.");
        return;
    }

    const item = carrito.find(c => c.id === id);
    if (item) {
        if (item.cantidad < prod.stock) {
            item.cantidad++;
        } else {
            alert("No puedes agregar más de lo que hay en stock.");
            return;
        }
    } else {
        carrito.push({ ...prod, cantidad: 1 });
    }
    guardarCarrito();
}

function cambiarCantidadCarrito(id, delta) {
    const item = carrito.find(c => c.id === id);
    if (!item) return;
    const productos = JSON.parse(localStorage.getItem("productos")) || [];
    const original = productos.find(p => p.id === id);

    item.cantidad += delta;
    if (item.cantidad > original.stock) {
        alert("Máximo stock alcanzado.");
        item.cantidad = original.stock;
    }
    if (item.cantidad <= 0) {
        carrito = carrito.filter(c => c.id !== id);
    }
    guardarCarrito();
    renderizarCarrito();
}

const eliminarProductoCarrito = eliminarDelCarrito;

function eliminarDelCarrito(id) {
    carrito = carrito.filter(c => c.id !== id);
    guardarCarrito();
    renderizarCarrito();
}

function guardarCarrito() {
    localStorage.setItem("carrito_actual", JSON.stringify(carrito));
    const badge = document.getElementById("cart-count");
    if (badge) {
        badge.textContent = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    }
}

function renderizarCarrito() {
    const contenedor = document.getElementById("lista-carrito");
    if (!contenedor) return;
    contenedor.innerHTML = "";
    let subtotal = 0;

    if (carrito.length === 0) {
        contenedor.innerHTML = "<p class='text-gray-500 text-center py-4'>Tu carrito está vacío.</p>";
        document.getElementById("total-carrito").textContent = "$0.00";
        return;
    }

    carrito.forEach(item => {
        subtotal += item.price * item.cantidad;
        contenedor.innerHTML += `
            <div class="flex items-center justify-between border-b dark:border-gray-700 py-3">
                <div class="flex items-center space-x-3">
                    <img src="${item.image}" class="w-12 h-12 object-contain bg-white p-1 rounded">
                    <div>
                        <h4 class="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">${item.title}</h4>
                        <p class="text-xs text-blue-500">$${item.price}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <button onclick="cambiarCantidadCarrito(${item.id}, -1)" class="px-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded cursor-pointer">-</button>
                    <span class="text-sm font-semibold dark:text-white">${item.cantidad}</span>
                    <button onclick="cambiarCantidadCarrito(${item.id}, 1)" class="px-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded cursor-pointer">+</button>
                    <button onclick="eliminarDelCarrito(${item.id})" class="text-red-500 text-xs ml-2 cursor-pointer">Eliminar</button>
                </div>
            </div>
        `;
    });
    document.getElementById("total-carrito").textContent = `$${subtotal.toFixed(2)}`;
}

function procesarCheckout(e) {
    e.preventDefault();
    if (carrito.length === 0) return alert("El carrito está vacío");

    const nroTarjeta = e.target.querySelectorAll('input')[0].value.replace(/\s+/g, '');
    const fechaExp = e.target.querySelectorAll('input')[1].value.trim();
    const cvv = e.target.querySelectorAll('input')[2].value.trim();

    const regexTarjeta = /^[0-9]{16}$/;
    const regexFecha = /^(0[1-9]|1[0-2])\/[0-9]{2}$/;
    const regexCVV = /^[0-9]{3}$/;

    if (!regexTarjeta.test(nroTarjeta)) return alert("Error de Validación JS: El número de tarjeta debe poseer exactamente 16 dígitos numéricos.");
    if (!regexFecha.test(fechaExp)) return alert("Error de Validación JS: La fecha de expiración debe cumplir estrictamente con el formato MM/AA.");
    if (!regexCVV.test(cvv)) return alert("Error de Validación JS: El código de seguridad CVV debe poseer 3 dígitos numéricos.");

    const user = Auth.getUsuarioActivo();
    const nuevaOrden = {
        id: "ORD-" + Date.now(),
        usuario: user ? user.nombre : "Invitado",
        productos: [...carrito],
        total: carrito.reduce((sum, item) => sum + (item.price * item.cantidad), 0),
        estado: "Pendiente",
        fecha: new Date().toLocaleDateString()
    };

    const productos = JSON.parse(localStorage.getItem("productos")) || [];
    carrito.forEach(item => {
        const target = productos.find(p => p.id === item.id);
        if (target) target.stock = Math.max(0, target.stock - item.cantidad);
    });
    localStorage.setItem("productos", JSON.stringify(productos));

    if (navigator.onLine) {
        const ventas = JSON.parse(localStorage.getItem("ventas")) || [];
        ventas.push(nuevaOrden);
        localStorage.setItem("ventas", JSON.stringify(ventas));
        alert("¡Compra procesada con éxito!");
    } else {
        const cola = JSON.parse(localStorage.getItem("cola_compras")) || [];
        cola.push(nuevaOrden);
        localStorage.setItem("cola_compras", JSON.stringify(cola));
        alert("Compra guardada localmente. Se procesará cuando vuelvas a tener conexión.");
    }

    carrito = [];
    guardarCarrito();
    mostrarSeccion('catalogo');
}

let productoActualId = null;
function verDetalleProducto(id) {
    productoActualId = id;
    const productos = JSON.parse(localStorage.getItem("productos")) || [];
    const p = productos.find(prod => prod.id === id);
    if (!p) return;

    document.getElementById("modal-title").textContent = p.title;
    const lista = document.getElementById("modal-reviews-list");
    if (!lista) return;
    
    lista.innerHTML = `
        <div class="flex flex-col sm:flex-row gap-3 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mb-4 text-xs">
            <img src="${p.image}" class="w-20 h-20 object-contain bg-white p-1 rounded mx-auto sm:mx-0">
            <div>
                <p class="font-bold text-gray-900 dark:text-white mb-1">Descripción:</p>
                <p class="text-gray-600 dark:text-gray-300 line-clamp-3">${p.description}</p>
                <p class="text-blue-500 font-bold mt-1">Precio: $${p.price}</p>
            </div>
        </div>
        <h4 class="font-bold text-xs text-gray-400 uppercase tracking-wider mb-2">Comentarios de clientes:</h4>
    `;
    
    if (p.reviews.length === 0) {
        lista.innerHTML += "<p class='text-gray-400 text-xs italic p-2'>Sin reseñas aún. ¡Sé el primero en comentar!</p>";
    } else {
        p.reviews.forEach(r => {
            lista.innerHTML += `
                <div class="bg-gray-50 dark:bg-gray-600 p-2 rounded mb-2 text-xs border border-gray-100 dark:border-gray-700">
                    <span class="font-bold text-gray-800 dark:text-gray-200">${r.usuario}</span> (${"⭐".repeat(r.estrellas)})
                    <p class="text-gray-600 dark:text-gray-300 mt-1">${r.comentario}</p>
                </div>
            `;
        });
    }
    document.getElementById("review-modal").classList.remove("hidden");
}

function cerrarModal() {
    document.getElementById("review-modal").classList.add("hidden");
}

function guardarResena() {
    const user = Auth.getUsuarioActivo();
    const comentario = document.getElementById("review-text").value;
    const estrellas = parseInt(document.getElementById("review-stars").value);
    
    if (!comentario) return alert("Escribe un comentario.");

    const productos = JSON.parse(localStorage.getItem("productos")) || [];
    const index = productos.findIndex(p => p.id === productoActualId);

    if (index !== -1) {
        productos[index].reviews.push({
            usuario: user ? user.nombre : "Anónimo",
            comentario,
            estrellas
        });
        localStorage.setItem("productos", JSON.stringify(productos));
        document.getElementById("review-text").value = "";
        verDetalleProducto(productoActualId);
        renderizarCatalogo();
    }
}

function renderizarAdmin() {
    const productos = JSON.parse(localStorage.getItem("productos")) || [];
    const ventas = JSON.parse(localStorage.getItem("ventas")) || [];
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const sesionActiva = JSON.parse(sessionStorage.getItem("sesion_activa"));

    const ingresosTotales = ventas.reduce((sum, v) => sum + v.total, 0);
    document.getElementById("admin-ingresos").textContent = `$${ingresosTotales.toFixed(2)}`;
    
    const totalRegistrados = usuarios.length;
    const totalActivos = sesionActiva ? 1 : 0;
    document.getElementById("admin-usuarios").textContent = `${totalRegistrados} Registrados / ${totalActivos} Activo`;

    const conteoVentas = {};
    ventas.forEach(v => {
        v.productos.forEach(item => {
            conteoVentas[item.title] = (conteoVentas[item.title] || 0) + item.cantidad;
        });
    });

    const top3Productos = Object.entries(conteoVentas)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    const metricasBox = document.getElementById("admin-ingresos").parentElement.parentElement;
    const topViejo = document.getElementById("admin-top3-box");
    if (topViejo) topViejo.remove();

    if (metricasBox) {
        const topDiv = document.createElement("div");
        topDiv.id = "admin-top3-box";
        topDiv.className = "bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border-l-4 border-amber-500 sm:col-span-2 lg:col-span-1";
        topDiv.innerHTML = `<span class="text-xs font-bold text-gray-400 uppercase">Top 3 Productos Más Vendidos</span>`;
        
        if (top3Productos.length === 0) {
            topDiv.innerHTML += `<p class="text-sm text-gray-500 mt-2 italic">No se han registrado ventas aún.</p>`;
        } else {
            const listaTop = document.createElement("ol");
            listaTop.className = "list-decimal list-inside text-xs mt-2 space-y-1 font-semibold";
            top3Productos.forEach(([title, cant]) => {
                listaTop.innerHTML += `<li class="truncate text-gray-700 dark:text-gray-300">${title} <span class="text-amber-500">(${cant} u)</span></li>`;
            });
            topDiv.appendChild(listaTop);
        }
        metricasBox.appendChild(topDiv);
    }

    const tabla = document.getElementById("admin-tabla-productos");
    if (tabla) {
        tabla.innerHTML = "";
        productos.forEach(p => {
            tabla.innerHTML += `
                <tr class="border-b dark:border-gray-700 text-sm text-gray-900 dark:text-gray-200">
                    <td class="p-2">${p.id}</td>
                    <td class="p-2 truncate max-w-xs">${p.title}</td>
                    <td class="p-2">$${p.price}</td>
                    <td class="p-2">${p.stock} u</td>
                    <td class="p-2 space-x-2">
                        <button onclick="cargarFormularioEditar(${p.id})" class="text-yellow-500 hover:underline cursor-pointer">Editar</button>
                        <button onclick="eliminarProductoAdmin(${p.id})" class="text-red-500 hover:underline cursor-pointer">Eliminar</button>
                    </td>
                </tr>
            `;
        });
    }

    const historial = document.getElementById("admin-tabla-ventas");
    if (historial) {
        historial.innerHTML = "";
        ventas.forEach((v, index) => {
            historial.innerHTML += `
                <tr class="border-b dark:border-gray-700 text-xs text-gray-900 dark:text-gray-200">
                    <td class="p-2">${v.id}</td>
                    <td class="p-2">${v.usuario}</td>
                    <td class="p-2">$${v.total.toFixed(2)}</td>
                    <td class="p-2">
                        <select onchange="cambiarEstadoEnvio(${index}, this.value)" class="bg-gray-100 dark:bg-gray-700 rounded p-1 cursor-pointer">
                            <option value="Pendiente" ${v.estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                            <option value="Enviado" ${v.estado === 'Enviado' ? 'selected' : ''}>Enviado</option>
                            <option value="Entregado" ${v.estado === 'Entregado' ? 'selected' : ''}>Entregado</option>
                        </select>
                    </td>
                </tr>
            `;
        });
    }
}

function guardarProductoAdmin(e) {
    e.preventDefault();
    const id = document.getElementById("prod-id").value;
    const title = document.getElementById("prod-title").value;
    const price = parseFloat(document.getElementById("prod-price").value);
    const stock = parseInt(document.getElementById("prod-stock").value);
    const category = document.getElementById("prod-category").value;
    const image = document.getElementById("prod-image").value || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500";

    const productos = JSON.parse(localStorage.getItem("productos")) || [];

    if (id) {
        const index = productos.findIndex(p => p.id == id);
        if (index !== -1) {
            productos[index] = { ...productos[index], title, price, stock, category, image };
        }
    } else {
        const maxId = productos.reduce((max, p) => p.id > max ? p.id : max, 0);
        const nuevoId = maxId + 1;

        const nuevo = {
            id: nuevoId,
            title, price, stock, category, image,
            rating: { rate: 5, count: 1 },
            reviews: []
        };
        productos.unshift(nuevo);
    }

    localStorage.setItem("productos", JSON.stringify(productos));
    document.getElementById("form-producto").reset();
    document.getElementById("prod-id").value = "";
    renderizarAdmin();
}

function cargarFormularioEditar(id) {
    const productos = JSON.parse(localStorage.getItem("productos")) || [];
    const p = productos.find(prod => prod.id == id);
    if (!p) return;

    document.getElementById("prod-id").value = p.id;
    document.getElementById("prod-title").value = p.title;
    document.getElementById("prod-price").value = p.price;
    document.getElementById("prod-stock").value = p.stock;
    document.getElementById("prod-category").value = p.category;
    document.getElementById("prod-image").value = p.image;
}

function eliminarProductoAdmin(id) {
    if (!confirm("¿Seguro que quieres borrar este producto?")) return;
    let productos = JSON.parse(localStorage.getItem("productos")) || [];
    productos = productos.filter(p => p.id != id);
    localStorage.setItem("productos", JSON.stringify(productos));
    renderizarAdmin();
}

function cambiarEstadoEnvio(index, nuevoEstado) {
    const ventas = JSON.parse(localStorage.getItem("ventas")) || [];
    ventas[index].estado = nuevoEstado;
    localStorage.setItem("ventas", JSON.stringify(ventas));
    renderizarAdmin();
}

function cargarDatosPerfil() {
    const user = Auth.getUsuarioActivo();
    if (!user) return;
    document.getElementById("perf-nombre").value = user.nombre;
    document.getElementById("perf-avatar").value = user.avatar;
    document.getElementById("perf-direccion").value = user.direccion;
}

function guardarPerfil(e) {
    e.preventDefault();
    const nombre = document.getElementById("perf-nombre").value;
    const avatar = document.getElementById("perf-avatar").value;
    const direccion = document.getElementById("perf-direccion").value;
    
    if (Auth.actualizarPerfil(nombre, avatar, direccion)) {
        alert("Perfil actualizado correctamente");
        actualizarNavbar();
    }
}

function ejecutarLogin(e) {
    e.preventDefault();
    const u = document.getElementById("login-user").value;
    const p = document.getElementById("login-pass").value;
    const res = Auth.login(u, p);
    if (res.exito) {
        actualizarNavbar();
        if (res.usuario.rol === "Administrador") {
            mostrarSeccion('admin-box');
        } else {
            mostrarSeccion('landing');
        }
        document.getElementById("form-login").reset();
    } else {
        alert(res.mensaje);
    }
}

function ejecutarRegistro(e) {
    e.preventDefault();
    const u = document.getElementById("reg-user").value;
    const p = document.getElementById("reg-pass").value;
    const n = document.getElementById("reg-nombre").value;
    const res = Auth.registrar(u, p, n);
    if (res.exito) {
        alert("Registro completado. Ya puedes iniciar sesión.");
        document.getElementById("form-registro").reset();
    } else {
        alert(res.mensaje);
    }
}

function actualizarNavbar() {
    const user = Auth.getUsuarioActivo();
    const navAuth = document.getElementById("nav-auth-btn");
    const navUser = document.getElementById("nav-user-menu");
    const adminLink = document.getElementById("nav-admin-link");

    if (user) {
        if (navAuth) navAuth.classList.add("hidden");
        if (navUser) navUser.classList.remove("hidden");
        const usernameDisplay = document.getElementById("nav-username");
        if (usernameDisplay) usernameDisplay.textContent = user.nombre;
        
        if (user.rol === "Administrador") {
            if (adminLink) adminLink.classList.remove("hidden");
        } else {
            if (adminLink) adminLink.classList.add("hidden");
        }
    } else {
        if (navAuth) navAuth.classList.remove("hidden");
        if (navUser) navUser.classList.add("hidden");
        if (adminLink) adminLink.classList.add("hidden");
    }
}

function simularRecuperacion() {
    const user = prompt("Introduce tu nombre de usuario para recuperar la contraseña:");
    if (!user) return;

    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const encontrado = usuarios.find(u => u.username === user);

    if (encontrado) {
        const nuevaClave = prompt(`Usuario encontrado: ${encontrado.nombre}.\nIntroduce tu nueva contraseña:`);
        if (!nuevaClave) return alert("Operación cancelada.");

        encontrado.password = nuevaClave;
        localStorage.setItem("usuarios", JSON.stringify(usuarios));
        alert("¡Contraseña restablecida con éxito simulado! Ya puedes iniciar sesión.");
    } else {
        alert("El usuario no se encuentra registrado en el sistema local.");
    }
}

window.addEventListener("online", actualizarEstadoRed);
window.addEventListener("offline", actualizarEstadoRed);

document.addEventListener("DOMContentLoaded", () => {
    inicializarTema();
    actualizarEstadoRed();
    guardarCarrito();
    actualizarNavbar();

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js')
            .then(reg => console.log('¡Service Worker registrado con éxito!', reg))
            .catch(err => console.error('Error registrando el Service Worker:', err));
    }
});