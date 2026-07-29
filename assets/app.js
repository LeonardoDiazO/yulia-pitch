// ══════════════════════════════════════════════════
//  CONFIGURACIÓN — Pega aquí la URL de tu Apps Script
// ══════════════════════════════════════════════════
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwg1vtXH64ePefhiLzWdvW7Q971-8lHtG7vEJu6_k8Bu1Bc9ujRHMmBZXwdcjRpbcfK9w/exec';
// Ejemplo: 'https://script.google.com/macros/s/AKfycby.../exec'
// ══════════════════════════════════════════════════

const TOTAL = 6;

// ── Due diligence: ítems de la checklist del proveedor ──
const DD_ITEMS = [
  { id: 'razon_social', texto: 'Razón social y NIT confirmados' },
  { id: 'alojamiento',  texto: 'Dónde se alojan los datos (país / proveedor cloud)' },
  { id: 'autorizacion', texto: 'Formulario incluye autorización de tratamiento de datos (Ley 1581)' },
  { id: 'responsable',  texto: 'Aclaró responsable vs. encargado del tratamiento (contrato/anexo)' },
  { id: 'cifrado',      texto: 'Cifrado en tránsito (TLS) y en reposo confirmado' },
  { id: 'dosfa',        texto: '2FA en el panel de administración' },
  { id: 'backups',      texto: 'Backups y frecuencia confirmados' },
  { id: 'brechas',      texto: 'Tiempo de notificación ante brecha de seguridad (72h)' },
  { id: 'exportacion',  texto: 'Exportación de datos si el proyecto cierra' },
  { id: 'partners',     texto: 'Programa de partners / reventa / descuento por volumen' },
];

// ── Renderizar checklist de due diligence ──
function renderDueDiligence() {
  const cont = document.getElementById('ddContainer');
  cont.innerHTML = DD_ITEMS.map(item => `
    <div class="estado-row" id="dd_${item.id}">
      <div class="estado-texto">${item.texto}</div>
      <div class="estado-btns">
        <button type="button" class="estado-btn si" onclick="setEstado('${item.id}','Sí')">SÍ</button>
        <button type="button" class="estado-btn no" onclick="setEstado('${item.id}','No')">NO</button>
        <button type="button" class="estado-btn pendiente on" onclick="setEstado('${item.id}','Pendiente')">?</button>
      </div>
    </div>
  `).join('');
  DD_ITEMS.forEach(item => { window[`dd_estado_${item.id}`] = 'Pendiente'; });
}
renderDueDiligence();

function setEstado(id, valor) {
  window[`dd_estado_${id}`] = valor;
  const row = document.getElementById(`dd_${id}`);
  row.querySelectorAll('.estado-btn').forEach(b => b.classList.remove('on'));
  const map = { 'Sí': 'si', 'No': 'no', 'Pendiente': 'pendiente' };
  row.querySelector(`.estado-btn.${map[valor]}`).classList.add('on');
}

// ── Detectar offline ──
function checkOnline() {
  document.getElementById('offlineBadge').style.display = navigator.onLine ? 'none' : 'block';
}
window.addEventListener('online',  checkOnline);
window.addEventListener('offline', checkOnline);
checkOnline();

// ── Mostrar / ocultar campo "Otro" ──
function toggleOtro(inputId, checkbox) {
  const input = document.getElementById(inputId);
  if (checkbox.checked) { input.classList.add('visible'); input.focus(); }
  else { input.classList.remove('visible'); input.value = ''; }
}

// ── Actualizar estilos de opciones ──
function updateOptStyles() {
  document.querySelectorAll('.opt').forEach(opt => {
    const inp = opt.querySelector('input');
    opt.classList.toggle('selected', inp && inp.checked);
  });
}

// ── Barra de progreso ──
function updateProgress() {
  updateOptStyles();
  const checks = [
    document.getElementById('f_negocio').value.trim().length > 0,
    document.getElementById('f_resenas').value.trim().length > 0 || document.getElementById('f_costo').value.trim().length > 0,
    !!document.querySelector('input[name="interes"]:checked'),
    document.querySelectorAll('input[name="objecion"]:checked').length > 0,
    !!document.querySelector('input[name="piloto"]:checked'),
    document.getElementById('f_notas').value.trim().length > 5,
  ];
  const done = checks.filter(Boolean).length;
  document.getElementById('pbar').style.width = Math.round((done / TOTAL) * 100) + '%';
  document.getElementById('progressText').textContent = `${done} de ${TOTAL}`;
  ['c1','c2','c3','c4','c5','c6'].forEach((id, i) => {
    document.getElementById(id).classList.toggle('answered', checks[i]);
  });
}

// ── Recopilar respuestas ──
function recopilar() {
  const dd = {};
  DD_ITEMS.forEach(item => { dd[item.id] = window[`dd_estado_${item.id}`] || 'Pendiente'; });

  return {
    formulario: 'yulia-pitch', // marca para que el backend escriba en la pestaña "Piloto Yulia"
    negocio:  document.getElementById('f_negocio').value.trim(),
    contacto: document.getElementById('f_contacto').value.trim(),
    fecha_reunion: document.getElementById('f_fecha').value || '—',
    resenas_negativas: document.getElementById('f_resenas').value.trim() || '—',
    costo_estimado: document.getElementById('f_costo').value.trim() || '—',
    interes: document.querySelector('input[name="interes"]:checked')?.value || '—',
    objeciones: [...document.querySelectorAll('input[name="objecion"]:checked')].map(e => {
      const txt = document.getElementById('otroObjecion')?.value.trim();
      return e.value === 'Otra' && txt ? `Otra: ${txt}` : e.value;
    }).join(' / ') || '—',
    piloto: document.querySelector('input[name="piloto"]:checked')?.value || '—',
    precio_mensualidad: document.getElementById('f_precio').value.trim() || '—',
    dd_razon_social: dd.razon_social,
    dd_alojamiento:  dd.alojamiento,
    dd_autorizacion: dd.autorizacion,
    dd_responsable:  dd.responsable,
    dd_cifrado:      dd.cifrado,
    dd_2fa:          dd.dosfa,
    dd_backups:      dd.backups,
    dd_brechas:      dd.brechas,
    dd_exportacion:  dd.exportacion,
    dd_partners:     dd.partners,
    dd_notas: document.getElementById('f_dd_notas').value.trim() || '—',
    notas: document.getElementById('f_notas').value.trim() || '—',
    siguiente_paso: document.getElementById('f_siguiente').value.trim() || '—',
    fecha_seguimiento: document.getElementById('f_fecha_seguimiento').value || '—',
  };
}

// ── Mostrar resumen en pantalla ──
function mostrarResumen(data) {
  const labels = [
    { q: 'Negocio / contacto', a: `${data.negocio} · ${data.contacto || '—'}` },
    { q: 'Reseñas negativas / costo estimado', a: `${data.resenas_negativas} · ${data.costo_estimado}` },
    { q: 'Interés', a: data.interes },
    { q: 'Objeciones', a: data.objeciones },
    { q: 'Piloto / precio', a: `${data.piloto} · ${data.precio_mensualidad}` },
    { q: 'Próximo paso', a: `${data.siguiente_paso} (${data.fecha_seguimiento})` },
    { q: 'Notas', a: data.notas },
  ];
  const html = labels.map(i => `<div class="summary-item"><strong>${i.q}:</strong> ${i.a}</div>`).join('');
  document.getElementById('summary-content').innerHTML = html;
  document.getElementById('summary').style.display = 'block';
  document.getElementById('summary').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Fuente única de verdad: reuniones_historial ──
// Cada reunión guardada trae su propio `enviado: true/false`. No existe una
// cola aparte — "pendiente" es simplemente cualquier entrada del historial
// con enviado=false. Sincronizar y reenviar son el mismo mecanismo, solo
// que uno recorre todas las pendientes y el otro apunta a una sola.
function leerHistorial() {
  return JSON.parse(localStorage.getItem('reuniones_historial') || '[]');
}
function guardarHistorialCompleto(historial) {
  localStorage.setItem('reuniones_historial', JSON.stringify(historial));
}
function indicesPendientes(historial) {
  return historial.reduce((acc, e, i) => { if (!e.enviado) acc.push(i); return acc; }, []);
}

// ── Migración: si quedó algo en la cola vieja (reuniones_pendientes), se
// integra al historial como pendiente y se elimina la cola separada. ──
(function migrarColaAntigua() {
  const antiguos = JSON.parse(localStorage.getItem('reuniones_pendientes') || '[]');
  if (antiguos.length === 0) return;
  const historial = leerHistorial();
  antiguos.forEach(item => historial.push({ data: item.data, ts: item.ts || Date.now(), enviado: false }));
  guardarHistorialCompleto(historial);
  localStorage.removeItem('reuniones_pendientes');
})();

// ── Sincronizar todas las pendientes del historial ──
async function sincronizarPendientes() {
  const historial = leerHistorial();
  const pendientes = indicesPendientes(historial);
  if (pendientes.length === 0) return;

  const btn = document.getElementById('btnSync');
  if (btn) { btn.disabled = true; btn.textContent = 'Sincronizando...'; }

  let fallidos = 0;
  for (const idx of pendientes) {
    const ok = await enviar(historial[idx].data);
    if (ok) historial[idx].enviado = true; else fallidos++;
  }
  guardarHistorialCompleto(historial);
  actualizarBtnSync();
  if (document.getElementById('historialPanel').style.display !== 'none') renderHistorial();

  if (btn) {
    btn.disabled = false;
    btn.textContent = fallidos === 0 ? '✅ Todo sincronizado' : `⚠️ ${fallidos} sin enviar — reintenta`;
    setTimeout(() => actualizarBtnSync(), 3000);
  }
}

function actualizarBtnSync() {
  const pendientes = indicesPendientes(leerHistorial());
  const btn = document.getElementById('btnSync');
  if (!btn) return;
  if (pendientes.length === 0) { btn.style.display = 'none'; }
  else {
    btn.style.display = 'block';
    btn.textContent = `⬆ Enviar ${pendientes.length} registro${pendientes.length !== 1 ? 's' : ''} pendiente${pendientes.length !== 1 ? 's' : ''}`;
    btn.disabled = false;
  }
}

window.addEventListener('online', () => { checkOnline(); sincronizarPendientes(); });

// ── Enviar al servidor (Apps Script) ──
async function enviar(data) {
  if (SCRIPT_URL === 'PEGAR_AQUI_LA_URL_DE_APPS_SCRIPT') {
    console.warn('⚠️ Configura SCRIPT_URL en assets/app.js');
    return false;
  }
  try {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return true;
  } catch (e) { return false; }
}

// ── Validar que haya contenido real antes de guardar ──
function validarFormulario() {
  if (!document.getElementById('f_negocio').value.trim()) {
    return { ok: false, mensaje: 'Escribe el nombre del negocio antes de guardar (pregunta 1).', focusId: 'f_negocio' };
  }
  if (!document.querySelector('input[name="interes"]:checked')) {
    return { ok: false, mensaje: 'Selecciona qué tan interesado quedó el cliente (pregunta 3).', focusId: 'c3' };
  }
  if (!document.querySelector('input[name="piloto"]:checked')) {
    return { ok: false, mensaje: 'Indica si aceptó el piloto de 30 días o no (pregunta 5).', focusId: 'c5' };
  }
  if (!document.getElementById('f_notas').value.trim()) {
    return { ok: false, mensaje: 'Escribe al menos una nota de la reunión (pregunta 6) — es lo más valioso si al final no compra.', focusId: 'f_notas' };
  }
  return { ok: true };
}

// ── Resaltar un campo o tarjeta con error ──
function resaltarCampo(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.focus();
  el.classList.add('campo-error');
  setTimeout(() => el.classList.remove('campo-error'), 1600);
}

// ── Guardar principal ──
async function guardar() {
  ['msgOk','msgPending','msgError','msgValidacion'].forEach(id => document.getElementById(id).style.display = 'none');

  const validacion = validarFormulario();
  if (!validacion.ok) {
    const msg = document.getElementById('msgValidacion');
    msg.innerHTML = `⚠️ ${validacion.mensaje}`;
    msg.style.display = 'block';
    resaltarCampo(validacion.focusId);
    msg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    return;
  }

  const btn = document.getElementById('btnGuardar');
  btn.disabled = true;
  btn.textContent = 'Guardando...';

  const data = recopilar();
  let enviadoOk = false;

  if (!navigator.onLine) {
    document.getElementById('msgPending').style.display = 'block';
  } else {
    const ok = await enviar(data);
    enviadoOk = ok === true;
    if (enviadoOk) {
      document.getElementById('msgOk').style.display = 'block';
    } else {
      document.getElementById('msgError').style.display = 'block';
    }
  }

  guardarHistorial(data, enviadoOk);
  actualizarBtnSync();
  mostrarResumen(data);

  btn.disabled = false;
  btn.textContent = 'Guardar anotaciones';
  document.getElementById('btnGuardar').scrollIntoView({ behavior: 'smooth' });
}

// ── Historial: guardar reunión completada (enviado=false = pendiente de sincronizar) ──
function guardarHistorial(data, enviado) {
  const historial = leerHistorial();
  historial.push({ data, ts: Date.now(), enviado: !!enviado });
  guardarHistorialCompleto(historial);
  actualizarContador();
}

function actualizarContador() {
  document.getElementById('contadorBadge').textContent = leerHistorial().length;
}

function toggleHistorial() {
  const panel = document.getElementById('historialPanel');
  const abierto = panel.style.display !== 'none';
  if (abierto) { panel.style.display = 'none'; }
  else { renderHistorial(); panel.style.display = 'block'; panel.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
}

function renderHistorial() {
  const historial = leerHistorial();
  const lista = document.getElementById('historialLista');
  const titulo = document.getElementById('historialTitulo');
  titulo.textContent = `${historial.length} reunión${historial.length !== 1 ? 'es' : ''} registrada${historial.length !== 1 ? 's' : ''}`;
  if (historial.length === 0) {
    lista.innerHTML = '<div class="hist-empty">Aún no hay reuniones guardadas</div>';
    return;
  }
  lista.innerHTML = [...historial].reverse().map((entry, i) => {
    const idxOriginal = historial.length - 1 - i; // índice real dentro de reuniones_historial
    const num = historial.length - i;
    const hora = new Date(entry.ts).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    const fecha = new Date(entry.ts).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
    const d = entry.data;
    const yaEnviado = !!entry.enviado;
    return `
      <div class="hist-item">
        <div class="hist-item-header">
          <span class="hist-num">#${num}</span>
          <span class="hist-hora">${fecha} · ${hora}</span>
        </div>
        <div class="hist-negocio">${d.negocio || '—'}</div>
        <div class="hist-dolor"><strong>Interés:</strong> ${d.interes} &nbsp;·&nbsp; <strong>Piloto:</strong> ${d.piloto}</div>
        <button class="hist-reenviar${yaEnviado ? ' enviado' : ''}" id="reenviarBtn-${idxOriginal}"
          onclick="reenviarEntrada(${idxOriginal})" ${yaEnviado ? 'disabled' : ''}>
          ${yaEnviado ? '✅ Ya enviada' : '🔄 Reenviar a Sheets'}
        </button>
      </div>`;
  }).join('');
}

// ── Reenviar una entrada puntual del historial (por si no llegó a Sheets) ──
async function reenviarEntrada(idx) {
  const historial = leerHistorial();
  const item = historial[idx];
  if (!item || item.enviado) return; // ya confirmada, no reenviar de nuevo

  const btn = document.getElementById(`reenviarBtn-${idx}`);
  if (btn) { btn.disabled = true; btn.textContent = 'Enviando...'; }

  const ok = await enviar(item.data);

  if (ok) {
    historial[idx].enviado = true;
    guardarHistorialCompleto(historial);
    actualizarBtnSync();
  }

  if (btn) {
    if (ok) {
      btn.classList.add('enviado');
      btn.textContent = '✅ Ya enviada';
      btn.disabled = true;
      return;
    }
    btn.disabled = false;
    btn.textContent = '⚠️ Falló — reintentar';
    setTimeout(() => { btn.textContent = '🔄 Reenviar a Sheets'; }, 3000);
  }
}

// Inicializar al cargar la página
actualizarContador();
actualizarBtnSync();

// ── Nueva reunión: limpia todo el formulario ──
function nuevaReunion() {
  document.querySelectorAll('input[type=checkbox], input[type=radio]').forEach(el => { el.checked = false; });
  ['otroObjecion'].forEach(id => {
    const el = document.getElementById(id);
    el.value = '';
    el.classList.remove('visible');
  });
  ['f_negocio','f_contacto','f_fecha','f_resenas','f_costo','f_precio','f_dd_notas','f_notas','f_siguiente','f_fecha_seguimiento'].forEach(id => {
    document.getElementById(id).value = '';
  });
  DD_ITEMS.forEach(item => setEstado(item.id, 'Pendiente'));
  document.getElementById('summary').style.display = 'none';
  ['msgOk','msgPending','msgError'].forEach(id => document.getElementById(id).style.display = 'none');
  updateProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ══════════════════════════════════════════════════
//  PIN de acceso (compartido con guion.html vía sessionStorage)
// ══════════════════════════════════════════════════
// PIN por defecto: 1234 (cámbialo: node -e "require('crypto').createHash('sha256').update('TUPIN').digest('hex')")
const PIN_HASH = '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4';
const MAX_INTENTOS = 5;
const BLOQUEO_MS = 5 * 60 * 1000;

(function initPin() {
  const sesion = sessionStorage.getItem('yulia_auth');
  if (sesion === 'ok') { document.getElementById('pantalla-acceso').style.display = 'none'; return; }

  const bloqueado = localStorage.getItem('yulia_bloqueo');
  if (bloqueado) {
    const restante = parseInt(bloqueado) - Date.now();
    if (restante > 0) { bloquearUI(restante); return; }
    else { localStorage.removeItem('yulia_bloqueo'); localStorage.removeItem('yulia_intentos'); }
  }

  const campos = ['p0','p1','p2','p3'];
  campos.forEach((id, i) => {
    const el = document.getElementById(id);
    el.addEventListener('input', () => {
      el.value = el.value.replace(/\D/g, '');
      if (el.value.length === 1 && i < 3) document.getElementById(campos[i + 1]).focus();
      if (i === 3 && el.value.length === 1) verificarPin();
    });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && el.value === '' && i > 0) document.getElementById(campos[i - 1]).focus();
      if (e.key === 'Enter') verificarPin();
    });
  });
  document.getElementById('p0').focus();
})();

async function sha256(texto) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(texto));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

async function verificarPin() {
  const campos = ['p0','p1','p2','p3'];
  const pin = campos.map(id => document.getElementById(id).value).join('');
  if (pin.length < 4) return;
  const hash = await sha256(pin);
  if (hash === PIN_HASH) {
    sessionStorage.setItem('yulia_auth', 'ok');
    localStorage.removeItem('yulia_intentos');
    localStorage.removeItem('yulia_bloqueo');
    document.getElementById('pantalla-acceso').style.display = 'none';
  } else {
    let intentos = parseInt(localStorage.getItem('yulia_intentos') || '0') + 1;
    localStorage.setItem('yulia_intentos', intentos);
    campos.forEach(id => {
      const el = document.getElementById(id);
      el.value = '';
      el.classList.add('error');
      setTimeout(() => el.classList.remove('error'), 600);
    });
    if (intentos >= MAX_INTENTOS) {
      const hasta = Date.now() + BLOQUEO_MS;
      localStorage.setItem('yulia_bloqueo', hasta);
      bloquearUI(BLOQUEO_MS);
    } else {
      const restantes = MAX_INTENTOS - intentos;
      document.getElementById('accesoError').style.display = 'block';
      document.getElementById('accesoIntentos').textContent =
        restantes === 1 ? 'Último intento antes del bloqueo.' : `${restantes} intentos restantes.`;
      setTimeout(() => document.getElementById('p0').focus(), 100);
    }
  }
}

function bloquearUI(msRestantes) {
  const btn = document.querySelector('.btn-acceso');
  const campos = ['p0','p1','p2','p3'];
  campos.forEach(id => { document.getElementById(id).disabled = true; });
  btn.disabled = true;
  btn.style.background = '#aaa';
  document.getElementById('accesoError').style.display = 'none';
  const intervalo = setInterval(() => {
    const bloqueado = localStorage.getItem('yulia_bloqueo');
    if (!bloqueado) { clearInterval(intervalo); return; }
    const restante = parseInt(bloqueado) - Date.now();
    if (restante <= 0) {
      clearInterval(intervalo);
      localStorage.removeItem('yulia_bloqueo');
      localStorage.removeItem('yulia_intentos');
      campos.forEach(id => { document.getElementById(id).disabled = false; });
      btn.disabled = false;
      btn.style.background = '';
      document.getElementById('accesoIntentos').textContent = '';
      document.getElementById('p0').focus();
    } else {
      const min = Math.ceil(restante / 60000);
      document.getElementById('accesoIntentos').textContent = `Bloqueado por ${min} min${min !== 1 ? 'utos' : 'uto'}.`;
    }
  }, 1000);
}
