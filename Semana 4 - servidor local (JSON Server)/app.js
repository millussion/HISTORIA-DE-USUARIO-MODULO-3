
// URL del servidor local JSON Server
const API_URL = 'http://localhost:3000/characters';

// Clave usada en localStorage
const STORAGE_KEY = 'sanrioCharacters';



let characters = [];



const form           = document.getElementById('character-form');
const list           = document.getElementById('characters-list');
const emptyState     = document.getElementById('empty-state');
const feedbackEl     = document.getElementById('feedback');
const countBadge     = document.getElementById('count-badge');
const btnSync        = document.getElementById('btn-sync');
const editModal      = document.getElementById('edit-modal');
const btnSaveEdit    = document.getElementById('btn-save-edit');
const btnCancelEdit  = document.getElementById('btn-cancel-edit');



/**
 * Valida un campo individual.
 * Si está vacío muestra el mensaje de error en el DOM.
 * @param {string} fieldId - id del input
 * @param {string} errorId - id del span de error
 * @param {string} label   - nombre del campo para el mensaje
 * @returns {boolean}
 */
function validateField(fieldId, errorId, label) {
    const input = document.getElementById(fieldId);
    const error = document.getElementById(errorId);
    const value = input.value.trim();

    if (!value) {
        error.textContent = `${label} es obligatorio`;
        input.style.borderColor = '#f5aab8';
        return false;
    }

    error.textContent = '';
    input.style.borderColor = '';
    return true;
}

/**
 * Valida todos los campos del formulario principal.
 * @returns {boolean} true si todos los campos son válidos
 */
function validateForm() {
    // Se valida cada campo y se usa & para que todos se ejecuten
    const nameOk        = validateField('name',        'error-name',        'Nombre');
    const typeOk        = validateField('type',         'error-type',        'Tipo');
    const personalityOk = validateField('personality', 'error-personality', 'Personalidad');
    const colorOk       = validateField('color',       'error-color',       'Color');
    const imageOk       = validateField('image',       'error-image',       'Emoji');

    return nameOk && typeOk && personalityOk && colorOk && imageOk;
}

/**
 * Muestra un mensaje de éxito o error en el DOM.
 * Desaparece automáticamente después de 3 segundos.
 * @param {string} message  - Texto del mensaje
 * @param {'success'|'error'} type
 */
function showFeedback(message, type = 'success') {
    feedbackEl.textContent = message;
    feedbackEl.className = `feedback ${type}`;

    setTimeout(() => {
        feedbackEl.className = 'feedback hidden';
    }, 3000);

    console.log(`[Feedback ${type.toUpperCase()}] ${message}`);
}

/**
 * Guarda el array global en localStorage.
 * Convierte el array a string JSON con JSON.stringify.
 */
function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
    console.log('[LocalStorage] Datos guardados:', characters);
}

/**
 * Recupera los personajes guardados en localStorage.
 * Si no hay datos, devuelve un array vacío.
 * @returns {Array}
 */
function loadFromStorage() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

/**
 * Renderiza TODOS los personajes del array global en la lista.
 * Limpia la lista antes de volver a dibujar.
 */
function renderList() {
    list.innerHTML = '';

    if (characters.length === 0) {
        emptyState.style.display = 'block';
        countBadge.textContent   = '0';
        return;
    }

    emptyState.style.display = 'none';
    countBadge.textContent   = characters.length;

    characters.forEach(character => {
        const li = createCharacterElement(character);
        list.appendChild(li);
    });

    console.log('[DOM] Lista renderizada con', characters.length, 'personajes');
}

/**
 * Crea el elemento <li> de un personaje.
 * Incluye botones de editar y eliminar.
 * @param {Object} character
 * @returns {HTMLElement}
 */
function createCharacterElement(character) {
    const li = document.createElement('li'); 
    li.className = 'character-item';
    li.dataset.id = character.id;

    // Distinguir si viene de la API o fue creado localmente
    const badgeClass = character._source === 'api' ? 'badge-api' : 'badge-local';
    const badgeText  = character._source === 'api' ? '🌐 API'    : '💾 Local';

    li.innerHTML = `
        <div class="character-emoji">${character.image}</div>

        <div class="character-info">
            <div class="character-name">${character.name}</div>
            <div class="character-details">
                ${character.type} · ${character.personality} · ${character.color}
            </div>
        </div>

        <span class="character-badge ${badgeClass}">${badgeText}</span>

        <div class="character-actions">
            <button class="btn-icon edit" title="Editar">✏️</button>
            <button class="btn-icon delete" title="Eliminar">🗑️</button>
        </div>
    `;

    li.querySelector('.btn-icon.edit').addEventListener('click', () => {
        openEditModal(character);
    });

    li.querySelector('.btn-icon.delete').addEventListener('click', () => {
        deleteCharacter(character.id, character._source);
    });

    return li;
}

/**
 * Trae todos los personajes del servidor (GET).
 * Los marca con _source: 'api' para distinguirlos.
 * Usa async/await y try catch.
 * @returns {Promise<Array>}
 */
async function fetchCharactersFromAPI() {
    try {
        console.log('[API] GET', API_URL);

        const response = await fetch(API_URL);

        // Verificar que la respuesta fue exitosa
        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }

        const data = await response.json();

        return data.map(c => ({ ...c, _source: 'api' }));

    } catch (error) {
        console.error('[API] Error en GET:', error.message);
        return null; // null indica que la API no está disponible
    }
}


/**
 * Envía un nuevo personaje al servidor (POST).
 * @param {Object} character - El personaje sin ID
 * @returns {Promise<Object|null>} El personaje creado con ID asignado
 */
async function postCharacterToAPI(character) {
    try {
        console.log('[API] POST', API_URL, character);

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(character),
        });

        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }

        const created = await response.json();
        console.log('[API] Personaje creado en servidor:', created);
        return { ...created, _source: 'api' };

    } catch (error) {
        console.error('[API] Error en POST:', error.message);
        return null;
    }
}



/**
 * Actualiza un personaje existente en el servidor (PUT).
 * Solo funciona si el personaje viene de la API (_source: 'api').
 * @param {Object} character - Personaje con los cambios aplicados
 * @returns {Promise<boolean>}
 */
async function putCharacterToAPI(character) {
    try {
        const url = `${API_URL}/${character.id}`;
        console.log('[API] PUT', url, character);

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(character),
        });

        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }

        const updated = await response.json();
        console.log('[API] Personaje actualizado en servidor:', updated);
        return true;

    } catch (error) {
        console.error('[API] Error en PUT:', error.message);
        return false;
    }
}



/**
 * Elimina un personaje del servidor (DELETE).
 * @param {number|string} id
 * @returns {Promise<boolean>}
 */
async function deleteCharacterFromAPI(id) {
    try {
        const url = `${API_URL}/${id}`;
        console.log('[API] DELETE', url);

        const response = await fetch(url, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }

        console.log('[API] Personaje eliminado del servidor, id:', id);
        return true;

    } catch (error) {
        console.error('[API] Error en DELETE:', error.message);
        return false;
    }
}

form.addEventListener('submit', async event => {
    event.preventDefault();

    if (!validateForm()) {
        showFeedback('⚠️ Completa todos los campos correctamente', 'error');
        return;
    }

    const newCharacter = {
        name:        document.getElementById('name').value.trim(),
        type:        document.getElementById('type').value.trim(),
        personality: document.getElementById('personality').value.trim(),
        color:       document.getElementById('color').value.trim(),
        image:       document.getElementById('image').value.trim(),
    };

    const fromAPI = await postCharacterToAPI(newCharacter);

    let characterToSave;

    if (fromAPI) {
        // El servidor asignó un ID y lo guardó
        characterToSave = fromAPI; 
        showFeedback(`🌸 ${characterToSave.name} agregado y sincronizado con la API`, 'success');
    } else {
        characterToSave = {
            ...newCharacter,
            id: Date.now(), 
            _source: 'local',
        };
        showFeedback(` ${characterToSave.name} guardado localmente (API no disponible)`, 'success');
        console.warn('[App] API no disponible. Guardado solo en localStorage.');
    }

    characters.push(characterToSave);
    saveToStorage();

    renderList();
    form.reset();
});



/**
 * Elimina un personaje del DOM, del array y de la API si aplica.
 * @param {number|string} id
 * @param {'api'|'local'} source
 */
async function deleteCharacter(id, source) {
    const target = characters.find(c => String(c.id) === String(id));
    const name   = target ? target.name : 'Personaje';

    if (source === 'api') {
        const ok = await deleteCharacterFromAPI(id);
        if (!ok) {
            showFeedback('No se pudo eliminar de la API, pero se quitó localmente', 'error');
        }
    }

    // TASK 4: Quitar del array global y actualizar localStorage
    characters = characters.filter(c => String(c.id) !== String(id));
    saveToStorage();

    const li = list.querySelector(`[data-id="${id}"]`);
    if (li) {
        list.removeChild(li); 
    }

    countBadge.textContent = characters.length;
    if (characters.length === 0) {
        emptyState.style.display = 'block';
    }

    showFeedback(` ${name} eliminado correctamente`, 'success');
    console.log('[App] Personaje eliminado, id:', id);
}



/**
 * Abre el modal de edición con los datos del personaje.
 * @param {Object} character
 */
function openEditModal(character) {
    document.getElementById('edit-id').value          = character.id;
    document.getElementById('edit-name').value        = character.name;
    document.getElementById('edit-personality').value = character.personality;
    document.getElementById('edit-color').value       = character.color;


    editModal.dataset.source = character._source;


    editModal.classList.remove('hidden');
}

// Cierra modal al hacer clic en Cancelar
btnCancelEdit.addEventListener('click', () => {
    editModal.classList.add('hidden');
    document.getElementById('error-edit-name').textContent = '';
});

// Guardar cambios del modal
btnSaveEdit.addEventListener('click', async () => {
    const id          = document.getElementById('edit-id').value;
    const name        = document.getElementById('edit-name').value.trim();
    const personality = document.getElementById('edit-personality').value.trim();
    const color       = document.getElementById('edit-color').value.trim();
    const source      = editModal.dataset.source;


    if (!name) {
        document.getElementById('error-edit-name').textContent = 'El nombre es obligatorio';
        return;
    }
    document.getElementById('error-edit-name').textContent = '';


    characters = characters.map(c => {
        if (String(c.id) === String(id)) {
            return { ...c, name, personality, color };
        }
        return c;
    });

    saveToStorage();

    if (source === 'api') {
        const updated = characters.find(c => String(c.id) === String(id));
        const ok = await putCharacterToAPI(updated);
        if (ok) {
            showFeedback(`✏️ ${name} actualizado y sincronizado con la API`, 'success');
        } else {
            showFeedback(`✏️ ${name} actualizado localmente (API no disponible)`, 'success');
        }
    } else {
        showFeedback(`✏️ ${name} actualizado correctamente`, 'success');
    }

    renderList();

    editModal.classList.add('hidden');
});



btnSync.addEventListener('click', async () => {
    showFeedback('🔄 Sincronizando con la API...', 'success');

    const apiCharacters = await fetchCharactersFromAPI();

    if (apiCharacters === null) {
        showFeedback('⚠️ No se pudo conectar con la API. Verifica que JSON Server esté corriendo.', 'error');
        console.warn('[App] JSON Server no disponible en', API_URL);
        return;
    }

    const localOnly = characters.filter(c => c._source === 'local');

    characters = [...apiCharacters, ...localOnly];

    saveToStorage();

    renderList();

    showFeedback(`✅ Sincronización completa. ${apiCharacters.length} personajes cargados desde la API.`, 'success');
    console.log('[API] GET exitoso. Personajes recibidos:', apiCharacters);
});

/**
 * Se ejecuta cuando carga la página.
 * Carga datos del localStorage para mantener la sesión.
 */
function init() {
    console.log('[App] Iniciando Sanrio World...');

    characters = loadFromStorage();

    console.log('[LocalStorage] Personajes recuperados:', characters);

    renderList();

    console.log('[App] Listo. Para usar la API ejecuta: npx json-server db.json');
}


init();
