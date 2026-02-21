// Configuración de Supabase
const supabaseUrl = 'https://zjbvkduvuczfwrysmluu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqYnZrZHV2dWN6ZndyeXNtbHV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNzQ1NTAsImV4cCI6MjA4Njk1MDU1MH0.sWVoizuyBNJbtqZe5zza9wqTDpI8pkExhfvnC1nPhYw';
const dbClient = supabase.createClient(supabaseUrl, supabaseKey);

// Verificar que productos.js se cargó correctamente
document.addEventListener('DOMContentLoaded', () => {
    if (typeof PRODUCTOS !== 'undefined') {
        console.log(`✅ productos.js cargado correctamente: ${PRODUCTOS.length} productos disponibles`);
    } else {
        console.error('❌ ERROR: productos.js no se cargó. Verifica que el archivo esté en la misma carpeta que index.html');
    }
});

let sucursalActual = "";
let uxbActual = 1;

// Función para elegir sucursal
function selectBranch(name) {
    sucursalActual = name;
    document.getElementById('branchDisplay').innerText = "Sucursal: " + name;
    document.getElementById('branchModal').style.display = 'none';
}

// Buscador en tiempo real
function filtrarProductos(query) {
    const dropdown = document.getElementById('searchDropdown');
    
    if (query.length < 2) { 
        dropdown.style.display = 'none'; 
        return; 
    }

    // Verificar que PRODUCTOS esté definido
    if (typeof PRODUCTOS === 'undefined') {
        console.error('❌ ERROR: PRODUCTOS no está definido. Verifica que productos.js esté cargado correctamente.');
        dropdown.innerHTML = '<div style="padding: 12px; color: #ff4444;">Error: productos.js no cargado</div>';
        dropdown.style.display = 'block';
        return;
    }

    const queryLower = query.toLowerCase();
    
    const matches = PRODUCTOS.filter(p => {
        // Buscar en nombre de producto
        const nombreMatch = p.productos && p.productos.toLowerCase().includes(queryLower);
        
        // Buscar en código (convertir a string para comparar)
        const codigoStr = p.codigos ? p.codigos.toString() : '';
        const codigoMatch = codigoStr.includes(query);
        
        return nombreMatch || codigoMatch;
    }).slice(0, 10);

    if (matches.length > 0) {
        dropdown.innerHTML = matches.map(p => `
            <div class="dropdown-item" onclick="seleccionar('${p.codigos}', '${p.productos.replace(/'/g, "\\'")}', ${p.uxb || 1})">
                <strong>${p.productos}</strong><br>
                <small>Código: ${p.codigos} · Bulto: ${p.uxb || 1} un.</small>
            </div>
        `).join('');
        dropdown.style.display = 'block';
    } else {
        dropdown.innerHTML = '<div style="padding: 12px; color: #888;">No se encontraron resultados</div>';
        dropdown.style.display = 'block';
    }
}

// Cuando el usuario toca un producto de la lista
function seleccionar(codigo, nombre, uxb) {
    uxbActual = uxb;
    document.getElementById('formRegistro').classList.remove('hidden');
    document.getElementById('eanSeleccionado').innerText = "Código: " + codigo;
    document.getElementById('nombreSeleccionado').value = nombre;
    document.getElementById('uxbSeleccionado').innerText = "Unidades por bulto: " + uxb;
    document.getElementById('searchDropdown').style.display = 'none';
    document.getElementById('searchInput').value = "";
    document.getElementById('cantidad').value = 1;
    document.getElementById('tipoCantidad').value = 'bulto';
    actualizarTotal();
}

// Calcula y muestra el total de unidades en tiempo real
function actualizarTotal() {
    const tipo = document.getElementById('tipoCantidad').value;
    const cantidad = parseInt(document.getElementById('cantidad').value) || 1;
    const total = tipo === 'bulto' ? cantidad * uxbActual : cantidad;
    document.getElementById('totalUnidades').innerText = 
        `Total unidades: ${total} (${cantidad} ${tipo === 'bulto' ? 'bulto/s x ' + uxbActual + ' un.' : 'unidad/es'})`;
}

// Guardar en la base de datos
async function guardar() {
    const ean = document.getElementById('eanSeleccionado').innerText.replace("Código: ", "");
    const nombre = document.getElementById('nombreSeleccionado').value;
    const fecha = document.getElementById('fechaVencimiento').value;
    const tipo = document.getElementById('tipoCantidad').value;
    const cantidad = parseInt(document.getElementById('cantidad').value) || 1;
    const totalUnidades = tipo === 'bulto' ? cantidad * uxbActual : cantidad;

    if (!fecha) {
        alert("⚠️ Por favor selecciona una fecha de vencimiento.");
        return;
    }

    if (!sucursalActual) {
        alert("⚠️ Por favor selecciona una sucursal.");
        return;
    }

    const { error } = await dbClient
        .from('vencimientos_registrados') 
        .insert([{ 
            ean: ean, 
            nombre: nombre, 
            fecha_vencimiento: fecha, 
            sucursal: sucursalActual,
            fecha_registro: new Date().toISOString(),
            unidades_por_bulto: uxbActual,
            tipo_cantidad: tipo,
            cantidad: cantidad,
            total_unidades: totalUnidades
        }]);

    if (error) {
        console.error("Error de Supabase:", error);
        alert("❌ Error al guardar: " + error.message);
    } else {
        alert("✅ Registro guardado: " + cantidad + " " + (tipo === 'bulto' ? 'bulto/s' : 'unidad/es') + " = " + totalUnidades + " unidades totales");
        document.getElementById('formRegistro').classList.add('hidden');
        document.getElementById('fechaVencimiento').value = "";
        document.getElementById('cantidad').value = 1;
        uxbActual = 1;
    }
}
