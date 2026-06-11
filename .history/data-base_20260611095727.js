const DEFAULT_USERS = [
    {
        id: "admin-1",
        username: "admin",
        password: "admin123",
        nombre: "Profesor de Web",
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
    if (!localStorage.getItem("usuarios")) {
        localStorage.setItem("usuarios", JSON.stringify(DEFAULT_USERS));
    }
    if (!localStorage.getItem("ventas")) {
        localStorage.setItem("ventas", JSON.stringify([]));
    }
    if (!localStorage.getItem("cola_compras")) {
        localStorage.setItem("cola_compras", JSON.stringify([]));
    }

    if (!localStorage.getItem("productos")) {
        try {
            const respuesta = await fetch("https://fakestoreapi.com/products");
            if (!respuesta.ok) throw new Error("Error al conectar con FakeStoreAPI");
            const productosAPI = await respuesta.json();
            
            const productosProcesados = productosAPI.map(prod => ({
                id: prod.id,
                title: prod.title,
                price: prod.price,
                description: prod.description,
                category: prod.category,
                image: prod.image,
                rating: {
                    rate: prod.rating?.rate || 4,
                    count: prod.rating?.count || 10
                },
                reviews: [
                    { usuario: "María F.", comentario: "Excelente producto, recomendado!", estrellas: 5 }
                ],
                stock: 15
            }));

            localStorage.setItem("productos", JSON.stringify(productosProcesados));
            console.log("Base de datos local synchronized con el API.");

            if (typeof renderizarCatalogo === 'function') renderizarCatalogo();
        } catch (error) {
            console.error("Error cargando API, usando array vacío temporal:", error);
            localStorage.setItem("productos", JSON.stringify([]));
        }
    }
}

document.addEventListener("DOMContentLoaded", inicializarBaseDeDatos);