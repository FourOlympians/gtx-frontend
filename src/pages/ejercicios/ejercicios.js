// Crear_rutina.js (vanilla)
// Flujo: obtener musculos -> seleccionar 1..4 -> para cada musculo: 1 basico + max 2 variantes -> resumen -> POST

console.log("Crear_rutina.js cargado ✅");

const API_MUSCULOS = '/api/musculos';
const API_EJERCICIOS = '/api/ejercicios';
const API_CREATE = '/rutinas/crear';
const PLACEHOLDER = '/mnt/data/5bdb8735-d91b-484d-9ff7-95097dc91852.png'; // imagen subida (fallback)
const MAX_MUSCLES = 4;
const MIN_MUSCLES = 1;

const state = {
  muscles: [],            // [{musculo, imagen}]
  selected: [],           // ['Pecho', ...]
  currentIndex: 0,        // índice del muscle being edited
  selections: {},         // { "Pecho": { basico: 1, variantes: [5,6] }, ... }
  cacheEjercicios: {}     // { "Pecho": [ {id, nombre, tipo, imagen}, ... ] }
};

// DOM
const musclesGrid = document.getElementById('muscles-grid');
const btnNextToExercises = document.getElementById('btn-next-to-exercises');
const selCountEl = document.getElementById('sel-count');

const panelExercises = document.getElementById('panel-exercises');
const panelTitleMuscle = document.getElementById('panel-muscle-name');
const basicsGrid = document.getElementById('basics-grid');
const variantsGrid = document.getElementById('variants-grid');
const btnPrevMuscle = document.getElementById('btn-prev-muscle');
const btnNextMuscle = document.getElementById('btn-next-muscle');

const panelSummary = document.getElementById('panel-summary');
const rutinaNameInput = document.getElementById('rutina-name');
const summaryList = document.getElementById('summary-list');
const btnCreate = document.getElementById('btn-create');
const btnEdit = document.getElementById('btn-edit');
const resultMessage = document.getElementById('result-message');

document.addEventListener('DOMContentLoaded', () => {
  bindButtons();
  loadMuscles();
});

function bindButtons(){
  btnNextToExercises.addEventListener('click', startExercises);
  btnPrevMuscle.addEventListener('click', prevMuscle);
  btnNextMuscle.addEventListener('click', nextMuscle);
  btnCreate.addEventListener('click', submitRutina);
  btnEdit.addEventListener('click', () => {
    // volver al primer músculo
    state.currentIndex = 0;
    showExercisesPanel();
    renderExerciseStep();
  });
}

/* ---------- Cargar músculos desde backend (o fallback) ---------- */
async function loadMuscles(){
  try {
    const res = await fetch(API_MUSCULOS);
    if (!res.ok) throw new Error('No musculos');
    const data = await res.json();
    // backend devuelve [{musculo, imagen}, ...]
    state.muscles = data.map(m => ({
      musculo: m.musculo || m.name || m.nombre,
      imagen: m.imagen || `/public/${(m.musculo||'').toLowerCase().trim()}.png`  // si backend no envia imagen, se arma /public/<musculo>.png
    }));
  } catch (err) {
    console.warn('Fallo GET /api/musculos, usando fallback local', err);
    state.muscles = [
      { musculo: 'Pecho', imagen: '/public/pecho.png' },
      { musculo: 'Bíceps', imagen: '/public/bicep.png' },
      { musculo: 'Tríceps', imagen: '/public/tricep.png' },
      { musculo: 'Hombro', imagen: '/public/hombro.png' },
      { musculo: 'Espalda', imagen: '/public/espalda.png' },
      { musculo: 'Cuádriceps', imagen: '/public/cuadricep.png' }
    ];
  }
  renderMuscles();
}

function renderMuscles(){
  musclesGrid.innerHTML = '';
  state.muscles.forEach(m => {
    const card = document.createElement('article');
    card.className = 'muscle-card';
    card.dataset.muscle = m.musculo;
    card.innerHTML = `
      <img src="${escapeHtml(m.imagen || PLACEHOLDER)}" alt="${escapeHtml(m.musculo)}" onerror="this.src='${PLACEHOLDER}'" />
      <h3>${escapeHtml(m.musculo)}</h3>
    `;
    card.addEventListener('click', () => toggleMuscle(card, m.musculo));
    musclesGrid.appendChild(card);
  });
  updateSelectionUI();
}

function toggleMuscle(card, muscle){
  const idx = state.selected.indexOf(muscle);
  if (idx === -1){
    if (state.selected.length >= MAX_MUSCLES){
      flash('Máximo 4 músculos permitidos', true);
      return;
    }
    state.selected.push(muscle);
    card.classList.add('selected');
  } else {
    state.selected.splice(idx, 1);
    card.classList.remove('selected');
  }
  updateSelectionUI();
}

function updateSelectionUI(){
  selCountEl.textContent = state.selected.length;
  btnNextToExercises.disabled = !(state.selected.length >= MIN_MUSCLES && state.selected.length <= MAX_MUSCLES);
}

/* ---------- Iniciar flujo de ejercicios ---------- */
function startExercises(){
  // inicializar selections (basico=null, variantes=[])
  state.selections = {};
  state.selected.forEach(m => state.selections[m] = { basico: null, variantes: [] });
  state.currentIndex = 0;
  showExercisesPanel();
  renderExerciseStep();
}

function showExercisesPanel(){
  panelExercises.classList.remove('hidden');
  panelSummary.classList.add('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showSummaryPanel(){
  panelExercises.classList.add('hidden');
  panelSummary.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---------- Render del paso actual (basicos + variantes) ---------- */
async function renderExerciseStep(){
  const muscle = state.selected[state.currentIndex];
  panelTitleMuscle.textContent = muscle;
  basicsGrid.innerHTML = '';
  variantsGrid.innerHTML = '';
  btnNextMuscle.disabled = true;

  // obtener ejercicios (cache o fetch)
  let ejercicios = state.cacheEjercicios[muscle];
  if (!ejercicios){
    try {
      const url = `${API_EJERCICIOS}?musculo=${encodeURIComponent(muscle)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('No ejercicios');
      const data = await res.json();
      ejercicios = data.map(e => ({
        id: e.id_ejercicio,
        nombre: e.nombre,
        tipo: (e.tipo_ejercicio || '').toLowerCase(),
        imagen: e.imagen || e.imagen_url || `/public/${muscle.toLowerCase()}.png`
      }));
    } catch (err) {
      console.warn('Fallo GET /api/ejercicios, usando mock', err);
      ejercicios = mockEjercicios(muscle);
    }
    state.cacheEjercicios[muscle] = ejercicios;
  }

  const basicos = ejercicios.filter(x => (x.tipo || '').includes('bas'));
  const variantes = ejercicios.filter(x => !(x.tipo || '').includes('bas'));

  // render basicos
  if (basicos.length === 0){
    basicsGrid.innerHTML = `<div class="muted">No hay ejercicios básicos para ${escapeHtml(muscle)}</div>`;
  } else {
    basicos.forEach(e => {
      const c = createExerciseCard(e);
      c.addEventListener('click', () => selectBasic(muscle, e.id, c));
      basicsGrid.appendChild(c);
    });
  }

  // render variantes
  if (variantes.length === 0){
    variantsGrid.innerHTML = `<div class="muted">No hay variantes para ${escapeHtml(muscle)}</div>`;
  } else {
    variantes.forEach(e => {
      const c = createExerciseCard(e);
      c.addEventListener('click', () => toggleVariant(muscle, e.id, c));
      variantsGrid.appendChild(c);
    });
  }

  // restaurar selección previa
  const sel = state.selections[muscle];
  if (sel){
    if (sel.basico){
      const el = basicsGrid.querySelector(`[data-eid="${sel.basico}"]`);
      if (el) el.classList.add('selected');
      btnNextMuscle.disabled = false;
    }
    if (sel.variantes && sel.variantes.length){
      sel.variantes.forEach(v => {
        const el = variantsGrid.querySelector(`[data-eid="${v}"]`);
        if (el) el.classList.add('selected');
      });
    }
  }
}

/* ---------- tarjetas ejercicios ---------- */
function createExerciseCard(e){
  const el = document.createElement('div');
  el.className = 'card';
  el.dataset.eid = e.id;
  el.innerHTML = `
    <img class="thumb" src="${escapeHtml(e.imagen || PLACEHOLDER)}" alt="${escapeHtml(e.nombre)}" onerror="this.src='${PLACEHOLDER}'" />
    <div class="body">
      <div class="title">${escapeHtml(e.nombre)}</div>
      <div class="meta">${escapeHtml(e.tipo || '')}</div>
    </div>
  `;
  return el;
}

/* ---------- lógica selección básico (solo 1) ---------- */
function selectBasic(muscle, id, cardEl){
  // desmarcar anterior
  const prev = basicsGrid.querySelector('.card.selected');
  if (prev && prev !== cardEl) prev.classList.remove('selected');

  const isSelected = cardEl.classList.toggle('selected');
  state.selections[muscle].basico = isSelected ? id : null;

  btnNextMuscle.disabled = !state.selections[muscle].basico;
}

/* ---------- lógica variantes (max 2) ---------- */
function toggleVariant(muscle, id, cardEl){
  const arr = state.selections[muscle].variantes;
  const idx = arr.indexOf(id);
  if (idx === -1){
    if (arr.length >= 2){
      flash('Solo 2 variantes permitidas por músculo', true);
      return;
    }
    arr.push(id);
    cardEl.classList.add('selected');
  } else {
    arr.splice(idx,1);
    cardEl.classList.remove('selected');
  }
}

/* ---------- navegación ---------- */
function prevMuscle(){
  if (state.currentIndex > 0){
    state.currentIndex--;
    renderExerciseStep();
  } else {
    // volver a selección inicial
    panelExercises.classList.add('hidden');
  }
}

function nextMuscle(){
  const muscle = state.selected[state.currentIndex];
  if (!state.selections[muscle] || !state.selections[muscle].basico){
    flash('Debes seleccionar 1 ejercicio básico antes de continuar', true);
    return;
  }

  if (state.currentIndex < state.selected.length - 1){
    state.currentIndex++;
    renderExerciseStep();
  } else {
    // terminar: mostrar resumen
    showSummaryPanel();
    renderSummary();
  }
}

/* ---------- resumen ---------- */
function renderSummary(){
  summaryList.innerHTML = '';
  const nameVal = rutinaNameInput.value || `Rutina ${new Date().toLocaleString()}`;
  rutinaNameInput.value = nameVal;

  Object.keys(state.selections).forEach(m => {
    const sel = state.selections[m];
    const bas = getEjById(m, sel.basico);
    const vars = (sel.variantes || []).map(v => getEjById(m, v)).filter(Boolean);

    const block = document.createElement('div');
    block.innerHTML = `
      <div style="font-weight:700">${escapeHtml(m)}</div>
      <div class="small">Básico: ${bas ? escapeHtml(bas.nombre) : '-'}</div>
      <div class="small">Variantes: ${vars.length ? vars.map(x=>escapeHtml(x.nombre)).join(', ') : '-'}</div>
      <hr style="opacity:0.06;margin:8px 0">
    `;
    summaryList.appendChild(block);
  });
}

/* ---------- helpers para buscar ejercicio en cache ---------- */
function getEjById(muscle, id){
  if (!id) return null;
  const arr = state.cacheEjercicios[muscle] || [];
  return arr.find(x => x.id === id) || null;
}

/* ---------- enviar al backend ---------- */
async function submitRutina(){
  const nombre = (rutinaNameInput.value || '').trim();
  const payload = {
    nombre: nombre || `Rutina ${new Date().toLocaleString()}`,
    musculos: Object.keys(state.selections).map(m => ({
      musculo: m,
      basico: state.selections[m].basico,
      variantes: state.selections[m].variantes
    }))
  };

  // validación mínima
  if (payload.musculos.length < MIN_MUSCLES){
    flash('Debes seleccionar al menos 1 músculo', true);
    return;
  }

  try {
    showResult('Creando rutina...', false);
    const res = await fetch(API_CREATE, {
      method: 'POST',
      credentials: 'include', // si usas cookies JWT
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok){
      showResult(`Error: ${data.detail || data.error || JSON.stringify(data)}`, true);
      return;
    }
    showResult('Rutina creada ✅', false);
    setTimeout(()=> window.location.href = '/mis-rutinas', 900);
  } catch (err) {
    console.error(err);
    showResult('Error de red al crear la rutina.', true);
  }
}

/* ---------- UI helpers / mocks ---------- */
function flash(msg, isError=false){
  resultMessage.textContent = msg;
  resultMessage.style.color = isError ? '#ff9a9a' : '#bdf0bd';
  setTimeout(()=> resultMessage.textContent = '', 2600);
}
function showResult(msg, isError=false){
  resultMessage.textContent = msg;
  resultMessage.style.color = isError ? '#ff9a9a' : '#bdf0bd';
}

function mockEjercicios(muscle){
  const base = Math.abs(hash(muscle)) % 500;
  return [
    { id: base+1, nombre: `${muscle} - Básico 1`, tipo: 'basico', imagen: PLACEHOLDER },
    { id: base+2, nombre: `${muscle} - Básico 2`, tipo: 'basico', imagen: PLACEHOLDER },
    { id: base+10, nombre: `${muscle} - Variante 1`, tipo: 'variacion', imagen: PLACEHOLDER },
    { id: base+11, nombre: `${muscle} - Variante 2`, tipo: 'variacion', imagen: PLACEHOLDER }
  ];
}
function hash(s){ let h=0; for(let i=0;i<s.length;i++) h=(h<<5)-h+s.charCodeAt(i); return h }
function escapeHtml(s){ return String(s || '').replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
