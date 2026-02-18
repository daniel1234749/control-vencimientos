// Configuración de Supabase
const supabaseUrl = 'https://zjbvkduvuczfwrysmluu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqYnZrZHV2dWN6ZndyeXNtbHV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNzQ1NTAsImV4cCI6MjA4Njk1MDU1MH0.sWVoizuyBNJbtqZe5zza9wqTDpI8pkExhfvnC1nPhYw';
const dbClient = supabase.createClient(supabaseUrl, supabaseKey);

let sucursalActual = "";

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

    const matches = PRODUCTOS.filter(p => 
        p.productos && p.productos.toLowerCase().includes(query.toLowerCase()) || 
        p.codigos && p.codigos.toString().includes(query)
    ).slice(0, 10);

    if (matches.length > 0) {
        dropdown.innerHTML = matches.map(p => `
            <div class="dropdown-item" onclick="seleccionar('${p.codigos}', '${p.productos.replace(/'/g, "\\'")}')">
                <strong>${p.productos}</strong><br>
                <small>Código: ${p.codigos}</small>
            </div>
        `).join('');
        dropdown.style.display = 'block';
    } else {
        dropdown.style.display = 'none';
    }
}

// Cuando el usuario toca un producto de la lista
function seleccionar(codigo, nombre) {
    document.getElementById('formRegistro').classList.remove('hidden');
    document.getElementById('eanSeleccionado').innerText = "Código: " + codigo;
    document.getElementById('nombreSeleccionado').value = nombre;
    document.getElementById('searchDropdown').style.display = 'none';
    document.getElementById('searchInput').value = "";
}

// Guardar en la base de datos
async function guardar() {
    const ean = document.getElementById('eanSeleccionado').innerText.replace("Código: ", "");
    const nombre = document.getElementById('nombreSeleccionado').value;
    const fecha = document.getElementById('fechaVencimiento').value;

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
            fecha_registro: new Date().toISOString()
        }]);

    if (error) {
        console.error("Error de Supabase:", error);
        alert("❌ Error al guardar: " + error.message);
    } else {
        alert("✅ Registro guardado exitosamente en " + sucursalActual);
        document.getElementById('formRegistro').classList.add('hidden');
        document.getElementById('fechaVencimiento').value = "";
    }
}