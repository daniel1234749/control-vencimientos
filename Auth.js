// Sistema de Autenticación y Control de Sesión
// Este archivo se incluye en todas las páginas protegidas

(function() {
    'use strict';

    // Verificar sesión
    function verificarSesion() {
        const session = localStorage.getItem('session');
        
        if (!session) {
            // No hay sesión - redirigir a login
            window.location.href = 'login.html';
            return null;
        }

        try {
            const userData = JSON.parse(session);
            
            // Validar que tenga los campos necesarios
            if (!userData.usuario || !userData.rol) {
                throw new Error('Sesión inválida');
            }

            return userData;
        } catch (error) {
            console.error('Error al leer sesión:', error);
            cerrarSesion();
            return null;
        }
    }

    // Cerrar sesión
    function cerrarSesion() {
        localStorage.removeItem('session');
        window.location.href = 'login.html';
    }

    // Obtener datos de sesión
    function obtenerSesion() {
        const session = localStorage.getItem('session');
        if (!session) return null;
        
        try {
            return JSON.parse(session);
        } catch {
            return null;
        }
    }

    // Verificar si es admin
    function esAdmin() {
        const session = obtenerSesion();
        return session && session.rol === 'admin';
    }

    // Obtener sucursal del usuario
    function obtenerSucursal() {
        const session = obtenerSesion();
        return session ? session.sucursal : null;
    }

    // Verificar si tiene acceso a una sucursal específica
    function tieneAccesoASucursal(sucursal) {
        const session = obtenerSesion();
        if (!session) return false;
        
        // Admin tiene acceso a todo
        if (session.rol === 'admin') return true;
        
        // Repositor solo a su sucursal
        return session.sucursal === sucursal;
    }

    // Exponer funciones globalmente
    window.Auth = {
        verificarSesion,
        cerrarSesion,
        obtenerSesion,
        esAdmin,
        obtenerSucursal,
        tieneAccesoASucursal
    };

    // Verificar sesión al cargar la página
    const sessionData = verificarSesion();
    
    if (sessionData) {
        console.log(`✅ Sesión activa: ${sessionData.nombre} (${sessionData.rol})`);
    }

})();