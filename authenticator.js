const Auth = {
    getUsuarioActivo() {
        return JSON.parse(sessionStorage.getItem("sesion_activa")) || null;
    },
    
    login(username, password) {
        const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
        const usuario = usuarios.find(u => u.username === username && u.password === password);
        if (usuario) {
            sessionStorage.setItem("sesion_activa", JSON.stringify(usuario));
            return { exito: true, usuario };
        }
        return { exito: false, mensaje: "Credenciales incorrectas" };
    },

    logout() {
        sessionStorage.removeItem("sesion_activa");
        window.location.reload();
    },

    registrar(username, password, nombre) {
        const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
        if (usuarios.some(u => u.username === username)) {
            return { exito: false, mensaje: "El usuario ya existe" };
        }
        const nuevoUsuario = {
            id: 'usr-' + Date.now(),
            username,
            password,
            nombre,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
            direccion: "Dirección no especificada",
            rol: "Cliente"
        };
        usuarios.push(nuevoUsuario);
        localStorage.setItem("usuarios", JSON.stringify(usuarios));
        return { exito: true };
    },

    actualizarPerfil(nombre, avatar, direccion) {
        const usuarioActivo = this.getUsuarioActivo();
        if (!usuarioActivo) return false;

        const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
        const index = usuarios.findIndex(u => u.id === usuarioActivo.id);

        if (index !== -1) {
            usuarios[index].nombre = nombre;
            usuarios[index].avatar = avatar;
            usuarios[index].direccion = direccion;
            localStorage.setItem("usuarios", JSON.stringify(usuarios));
            sessionStorage.setItem("sesion_activa", JSON.stringify(usuarios[index]));
            return true;
        }
        return false;
    }
};