'use strict';
const estado = document.getElementById('estado');
const login = document.getElementById('login');
const panel = document.getElementById('panel');
const editor = document.getElementById('editor');
const foto = document.getElementById('foto');
const preview = document.getElementById('preview');
const modoVistaPrevia = ['localhost','127.0.0.1'].includes(location.hostname);
let cliente, registros = [], imagenActual = '', vistaTemporal = null, ocupado = false;
function mensaje(texto, error = false) { estado.textContent = texto; estado.classList.toggle('error', error); }
function campo(nombre) { return editor.elements.namedItem(nombre); }
function limpiar() {
    editor.reset(); document.getElementById('oferta-field').hidden = true; campo('precio_oferta').required = false; campo('id').value = ''; imagenActual = '';
    if (vistaTemporal) URL.revokeObjectURL(vistaTemporal);
    vistaTemporal = null; preview.hidden = true; preview.removeAttribute('src');
    document.getElementById('titulo-editor').textContent = 'Nuevo producto';
}
function bloquear(valor) {
    ocupado = valor;
    document.querySelectorAll('#panel button, #editor input, #editor select, #editor textarea').forEach(e => e.disabled = valor);
}
function texto(tag, contenido) { const e = document.createElement(tag); e.textContent = contenido; return e; }
async function listar() {
    const {data, error} = await cliente.from('productos').select('*').order('created_at', {ascending: false});
    if (error) throw error;
    registros = data;
    const lista = document.getElementById('lista'); lista.replaceChildren();
    document.getElementById('lista-estado').textContent = `${data.length} productos`;
    for (const p of data) {
        const fila = document.createElement('article'); fila.className = 'item';
        const img = document.createElement('img'); img.src = p.imagen; img.alt = p.nombre;
        const detalles = document.createElement('div');
        detalles.append(texto('h3', p.nombre), texto('p', `${p.marca} · US$ ${Number(p.precio).toFixed(2)}`), texto('p', !p.activo ? 'Oculto' : p.disponible ? 'Disponible' : 'Agotado'));
        const boton = texto('button', 'Editar'); boton.type = 'button';
        boton.addEventListener('click', () => {
            if (ocupado) return;
            limpiar();
            for (const n of ['id','nombre','marca','precio','categoria','detalle']) campo(n).value = p[n];
            campo('nuevo').checked = p.nuevo === true; campo('destacado').checked = p.destacado === true; campo('en_oferta').checked = p.precio_oferta != null; campo('precio_oferta').value = p.precio_oferta ?? ''; document.getElementById('oferta-field').hidden = p.precio_oferta == null; campo('precio_oferta').required = p.precio_oferta != null;
            campo('activo').checked = p.activo; campo('disponible').checked = p.disponible;
            imagenActual = p.imagen; preview.src = p.imagen; preview.hidden = false;
            document.getElementById('titulo-editor').textContent = 'Editar producto';
            editor.scrollIntoView({behavior:'smooth'});
        });
        fila.append(img,detalles,boton); lista.append(fila);
    }
}
async function sesion() {
    const {data, error} = await cliente.auth.getSession();
    if (error) throw error;
    if (!data.session) { panel.hidden = true; login.hidden = false; mensaje('Entra con tu cuenta de administrador.'); return; }
    const permiso = await cliente.from('catalogo_admins').select('user_id').eq('user_id',data.session.user.id).maybeSingle();
    if (permiso.error || !permiso.data) {
        await cliente.auth.signOut(); panel.hidden = true; login.hidden = false;
        mensaje('Esta cuenta todavía no tiene permiso para administrar el catálogo.', true); return;
    }
    login.hidden = true; panel.hidden = false;
    await listar(); mensaje(modoVistaPrevia ? 'Vista previa: puedes explorar el formulario, pero aquí no se guardan cambios.' : 'Listo para administrar tus productos.');
}
campo('en_oferta').addEventListener('change', () => { document.getElementById('oferta-field').hidden = !campo('en_oferta').checked; campo('precio_oferta').required = campo('en_oferta').checked; });
foto.addEventListener('change', () => {
    if (vistaTemporal) URL.revokeObjectURL(vistaTemporal);
    vistaTemporal = null;
    const file = foto.files[0];
    if (file && (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024)) {
        foto.value = ''; mensaje('Elige una imagen JPG, PNG o WebP de hasta 10 MB.',true);
        preview.src = imagenActual; preview.hidden = !imagenActual; return;
    }
    if (file) vistaTemporal = URL.createObjectURL(file);
    preview.src = vistaTemporal || imagenActual; preview.hidden = !(vistaTemporal || imagenActual);
});
async function comprimir(file) {
    const imagen = await createImageBitmap(file);
    const escala = Math.min(1,1600 / Math.max(imagen.width,imagen.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1,Math.round(imagen.width * escala)); canvas.height = Math.max(1,Math.round(imagen.height * escala));
    const ctx = canvas.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.drawImage(imagen,0,0,canvas.width,canvas.height); imagen.close();
    return new Promise((resolve,reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('No se pudo preparar la foto.')), 'image/jpeg',0.85));
}
editor.addEventListener('submit', async e => {
    e.preventDefault(); if (ocupado) return;
    const id = campo('id').value || crypto.randomUUID();
    const existente = Boolean(campo('id').value);
    const p = {id,nombre:campo('nombre').value.trim(),marca:campo('marca').value.trim(),precio:Number(campo('precio').value),categoria:campo('categoria').value,detalle:campo('detalle').value.trim(),activo:campo('activo').checked,disponible:campo('disponible').checked,imagen:imagenActual,nuevo:campo('nuevo').checked,destacado:campo('destacado').checked,precio_oferta:campo('en_oferta').checked ? Number(campo('precio_oferta').value) : null};
    if (!p.nombre || !p.marca || !Number.isFinite(p.precio) || p.precio < 0) { mensaje('Revisa nombre, marca y precio.',true); return; }
    if (!foto.files[0] && !p.imagen) { mensaje('Agrega una foto para este producto.',true); return; }
    if (p.precio_oferta !== null && (campo('precio_oferta').value === '' || !Number.isFinite(p.precio_oferta) || p.precio_oferta < 0 || p.precio_oferta >= p.precio)) { mensaje('El precio de oferta debe ser menor que el precio habitual.',true); return; }
    if (modoVistaPrevia) { mensaje('Vista previa: formulario validado. No se guardó ningún cambio en el catálogo real.'); return; }
    bloquear(true); mensaje('Guardando producto…');
    let subida = null, guardado = false;
    try {
        if (foto.files[0]) {
            const blob = await comprimir(foto.files[0]);
            subida = `${id}/${crypto.randomUUID()}.jpg`;
            const upload = await cliente.storage.from('productos').upload(subida,blob,{contentType:'image/jpeg',upsert:false});
            if (upload.error) throw upload.error;
            p.imagen = cliente.storage.from('productos').getPublicUrl(subida).data.publicUrl;
        }
        const result = existente ? await cliente.from('productos').update(p).eq('id',id).select('id').single() : await cliente.from('productos').insert(p).select('id').single();
        if (result.error) throw result.error;
        guardado = true; limpiar(); await listar(); mensaje('Producto guardado. Ya está actualizado en el catálogo.');
    } catch (error) {
        // No borrar la foto ante una respuesta incierta: el guardado podría haberse completado.
        mensaje(guardado ? 'Producto guardado, pero no se pudo actualizar la lista. Recarga la página.' : 'No se pudo confirmar el guardado. Revisa tu conexión y recarga la lista antes de volver a intentarlo.',true);
        console.error(error.message);
    } finally { bloquear(false); }
});
login.addEventListener('submit', async e => {
    e.preventDefault(); const boton = login.querySelector('button'); boton.disabled = true;
    try {
        const {error} = await cliente.auth.signInWithPassword({email:login.elements.email.value.trim(),password:login.elements.password.value});
        login.elements.password.value = '';
        if (error) { mensaje('No se pudo entrar. Revisa correo y contraseña.',true); return; }
        await sesion();
    } catch { mensaje('No se pudo conectar. Intenta de nuevo.',true); }
    finally { boton.disabled = false; }
});
document.getElementById('nuevo').addEventListener('click',limpiar);
document.getElementById('cancelar').addEventListener('click',limpiar);
document.getElementById('salir').addEventListener('click',async () => {
    const {error} = await cliente.auth.signOut();
    if (error) { mensaje('No se pudo cerrar la sesión. Intenta de nuevo.',true); return; }
    limpiar(); registros = []; document.getElementById('lista').replaceChildren(); await sesion();
});
(async () => {
    try {
        cliente = supabase.createClient(CATALOGO_CONFIG.url,CATALOGO_CONFIG.key);
        await sesion();
    } catch { mensaje('No se pudo conectar con el administrador. Revisa la conexión y la configuración de Supabase.',true); }
})();
