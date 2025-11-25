// mostrar_ejercicios.js
// Flujo:
// 1) fetch /api/musculos -> mostrar tarjetas
// 2) seleccionar un músculo (solo 1) -> habilitar Siguiente
// 3) al pulsar Siguiente -> fetch /api/ejercicios?musculo=... -> mostrar tarjetas con ambas imágenes
// 4) cada tarjeta tiene botón "Ver toda la información" -> abre modal con imágenes grandes y detalles

(function() {
  const API_MUSCULOS = '/api/musculos';
  const API_EJERCICIOS = '/api/ejercicios';

  // DOM
  const musclesGrid = document.getElementById('muscles-grid');
  const btnNext = document.getElementById('btn-next');
  const selectedNameEl = document.getElementById('selected-muscle-name');

  const exercisesSection = document.getElementById('exercises-section');
  const exercisesGrid = document.getElementById('exercises-grid');
  const exercisesTitle = document.getElementById('exercises-title');
  const btnBack = document.getElementById('btn-back');

  // Modal
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalImgStart = document.getElementById('modal-img-start');
  const modalImgEnd = document.getElementById('modal-img-end');
  const modalDesc = document.getElementById('modal-descripcion');
  const modalMusculo = document.getElementById('modal-musculo');
  const modalTipo = document.getElementById('modal-tipo');
  const modalClose = document.getElementById('modal-close');
  const modalClose2 = document.getElementById('modal-close-2');

  let state = {
    muscles: [],
    selectedMuscle: null,
    cacheEjercicios: {} // muscle -> [ejercicios]
  };

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    bindActions();
    loadMuscles();
  }

  function bindActions() {
    btnNext.addEventListener('click', onNext);
    btnBack.addEventListener('click', onBack);
    modalClose.addEventListener('click', closeModal);
    modalClose2.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  async function loadMuscles() {
    try {
      const res = await fetch(API_MUSCULOS);
      if (!res.ok) throw new Error('No musculos');
      const data = await res.json();
      state.muscles = data;
    } catch (err) {
      console.warn('Fallo cargar /api/musculos, usando fallback', err);
      state.muscles = [
        { musculo: 'Pecho', imagen: '/public/pecho.png' },
        { musculo: 'Bíceps', imagen: '/public/bicep.png' },
        { musculo: 'Espalda', imagen: '/public/espalda.png' }
      ];
    }
    renderMuscles();
  }

  function renderMuscles() {
    musclesGrid.innerHTML = '';
    state.muscles.forEach(m => {
      const card = document.createElement('div');
      card.className = 'muscle-card';
      card.tabIndex = 0;
      card.innerHTML = `
        <img src="${escapeHtml(m.imagen)}" alt="${escapeHtml(m.musculo)}" />
        <h3 class="text-lg font-semibold mt-1">${escapeHtml(m.musculo)}</h3>
      `;
      card.addEventListener('click', () => selectMuscle(card, m));
      card.addEventListener('keypress', (e) => { if (e.key === 'Enter') selectMuscle(card, m); });
      musclesGrid.appendChild(card);
    });
  }

  function selectMuscle(card, m) {
    // desmarcar anterior
    const prev = musclesGrid.querySelector('.selected-muscle');
    if (prev) prev.classList.remove('selected-muscle');

    // marcar seleccionado
    card.classList.add('selected-muscle');
    state.selectedMuscle = m.musculo;
    selectedNameEl.textContent = m.musculo;
    btnNext.disabled = false;
  }

  async function onNext() {
    if (!state.selectedMuscle) return;
    await loadEjerciciosFor(state.selectedMuscle);
    showExercises();
  }

  async function loadEjerciciosFor(muscle) {
    if (state.cacheEjercicios[muscle]) return;
    try {
      const url = `${API_EJERCICIOS}?musculo=${encodeURIComponent(muscle)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('No ejercicios');
      const data = await res.json();
      // data expected to have imagen_inicio and imagen_fin
      state.cacheEjercicios[muscle] = data;
    } catch (err) {
      console.warn('Fallo cargar ejercicios, usando mock', err);
      state.cacheEjercicios[muscle] = mockEjercicios(muscle);
    }
  }

  function showExercises() {
    exercisesSection.classList.remove('hidden');
    exercisesGrid.innerHTML = '';
    const muscle = state.selectedMuscle;
    exercisesTitle.textContent = `Ejercicios para ${muscle}`;
    const ejercicios = state.cacheEjercicios[muscle] || [];

    if (!ejercicios.length) {
      exercisesGrid.innerHTML = `<div class="text-gray-400">No se encontraron ejercicios para ${escapeHtml(muscle)}</div>`;
      return;
    }

    ejercicios.forEach(e => {
      const card = document.createElement('article');
      card.className = 'exercise-card shadow-sm';
      card.innerHTML = `
        <img class="exercise-thumb" src="${escapeHtml(e.imagen_inicio || e.imagen_inicio_url || e.imageninicio_url || '')}" alt="${escapeHtml(e.nombre)} - inicio" onerror="this.src='/public/fallback.png'"/>
        <div class="exercise-body">
          <div class="text-lg font-semibold mb-2">${escapeHtml(e.nombre)}</div>

          <div class="card-images mb-3">
            <img src="${escapeHtml(e.imagen_inicio || e.imagen_inicio_url || e.imageninicio_url || '')}" alt="inicio" onerror="this.src='/public/fallback.png'"/>
            <img src="${escapeHtml(e.imagen_fin || e.imagen_fin_url || e.imagenfin_url || '')}" alt="fin" onerror="this.src='/public/fallback.png'"/>
          </div>

          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-300">${escapeHtml(e.tipo_ejercicio || e.tipo || '')}</div>
            <button class="btn-primary view-more px-3 py-1 rounded-full">Ver toda la información</button>
          </div>
        </div>
      `;

      // handler ver info
      const btn = card.querySelector('.view-more');
      btn.addEventListener('click', () => openModalWith(e));

      exercisesGrid.appendChild(card);
    });

    // scroll to exercises
    window.scrollTo({ top: document.getElementById('exercises-section').offsetTop - 20, behavior: 'smooth' });
  }

  function onBack() {
    // ocultar sección ejercicios y reset selección
    exercisesSection.classList.add('hidden');
    btnNext.disabled = false;
    selectedNameEl.textContent = '—';
    const prev = musclesGrid.querySelector('.selected-muscle');
    if (prev) prev.classList.remove('selected-muscle');
    state.selectedMuscle = null;
    btnNext.disabled = true;
  }

  function openModalWith(ej) {
    modalTitle.textContent = ej.nombre || '';
    modalImgStart.src = ej.imagen_inicio || ej.imagen_inicio || ej.imageninicio_url || '';
    modalImgEnd.src = ej.imagen_fin || ej.imagen_fin_url || ej.imagenfin_url || '';
    modalDesc.textContent = ej.descripcion || ej.description || '';
    modalMusculo.textContent = ej.musculo || '';
    modalTipo.textContent = ej.tipo_ejercicio || ej.tipo || '';
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function closeModal() {
    modal.classList.add('hidden');
    modal.style.display = 'none';
    modalImgStart.src = '';
    modalImgEnd.src = '';
  }

  function mockEjercicios(muscle) {
    const base = Math.abs(hash(muscle)) % 500;
    return [
      { id_ejercicio: base+1, nombre: `${muscle} - Press`, tipo_ejercicio: 'basico', musculo: muscle, imagen_inicio: '/public/fallback.png', imagen_fin: '/public/fallback.png', descripcion: 'Descripción de ejemplo' },
      { id_ejercicio: base+2, nombre: `${muscle} - Aperturas`, tipo_ejercicio: 'variacion', musculo: muscle, imagen_inicio: '/public/fallback.png', imagen_fin: '/public/fallback.png', descripcion: 'Descripción de ejemplo' }
    ];
  }

  // helpers
  function hash(s) { let h = 0; for (let i=0;i<s.length;i++) h=(h<<5)-h+s.charCodeAt(i); return h; }
  function escapeHtml(s) { return String(s||'').replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

})();
