const DEFAULT_USERS = [
    {
        id: "admin-1",
        username: "admin",
        password: "admin123",
        nombre: "Administrador del Sistema",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=admin",
        direccion: "Sede UCAB Montalbán",
        rol: "Administrador"
    },
    {
        id: "client-1",
        username: "cliente",
        password: "user123",
        nombre: "Sebastián Pérez",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sebastian",
        direccion: "La Guaira, Venezuela",
        rol: "Cliente"
    }
];

async function inicializarBaseDeDatos() {
    console.log("Comprobando persistencia local...");

    if (!localStorage.getItem("usuarios")) {
        localStorage.setItem("usuarios", JSON.stringify(DEFAULT_USERS));
        console.log("➔ Usuarios base cargados en localStorage.");
    }

    if (!localStorage.getItem("ventas")) {
        localStorage.setItem("ventas", JSON.stringify([]));
        console.log("➔ Historial de ventas inicializado vacío.");
    }

    if (!localStorage.getItem("cola_compras")) {
        localStorage.setItem("cola_compras", JSON.stringify([]));
        console.log("➔ Cola de espera offline inicializada.");
    }

    if (!localStorage.getItem("productos")) {
        console.log("Catálogo local vacío. Solicitando datos a FakeStoreAPI...");
        try {
            const respuesta = await fetch("https://fakestoreapi.com/products");
            
            if (!respuesta.ok) {
                throw new Error(`Error en la API: ${respuesta.status}`);
            }
            
            const productosAPI = await respuesta.json();
            
            const productosProcesados = productosAPI.map(prod => ({
                id: prod.id,
                title: prod.title,
                price: prod.price,
                description: prod.description,
                category: prod.category,
                image: prod.image,
                rating: {
                    rate: prod.rating?.rate || 0,
                    count: prod.rating?.count || 0
                },
                reviews: [],
                stock: 10 
            }));

            localStorage.setItem("productos", JSON.stringify(productosProcesados));
            console.log("➔ ¡Catálogo inicial guardado exitosamente en localStorage! El sistema ya es independiente de la API.");

        } catch (error) {
            console.error("Error cargando la API externa:", error);
            localStorage.setItem("productos", JSON.stringify([]));
        }
    } else {
        console.log("➔ Catálogo de productos detectado. Usando almacenamiento local (Modo Autónomo).");
    }
}

document.addEventListener("DOMContentLoaded", inicializarBaseDeDatos);