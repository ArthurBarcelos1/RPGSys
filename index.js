// Inicializa a navegação da ficha e os elementos de criação/edição do personagem
const navButtons = document.querySelectorAll('.nav-btn');
const panels = document.querySelectorAll('.panel');
const createCharacterBtn = document.getElementById('createCharacterBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const characterModal = document.getElementById('characterModal');
const characterForm = document.getElementById('characterForm');
const avatarInput = document.getElementById('avatarFile');
const uploadStatus = document.getElementById('uploadStatus');
const characterSummary = document.getElementById('characterSummary');
const changePhotoBtn = document.getElementById('changePhotoBtn');
const logoutBtn = document.getElementById('logoutBtn');

let currentCharacter = null;
let photoInput = null;

// Alterna entre os painéis da interface
navButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const target = button.getAttribute('data-target');

        navButtons.forEach((btn) => btn.classList.remove('active'));
        button.classList.add('active');

        panels.forEach((panel) => {
            panel.classList.toggle('active', panel.getAttribute('data-panel') === target);
        });
    });
});

function logout() {
    localStorage.removeItem('rpgsys-session');
    window.location.href = 'login.html';
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
}

function closeCharacterModal() {
    characterModal.classList.add('hidden');
    characterModal.setAttribute('aria-hidden', 'true');
    characterForm.reset();
    uploadStatus.textContent = 'Nenhuma imagem enviada ainda.';
}

createCharacterBtn.addEventListener('click', () => {
    characterModal.classList.remove('hidden');
    characterModal.setAttribute('aria-hidden', 'false');
});

closeModalBtn.addEventListener('click', closeCharacterModal);

characterModal.addEventListener('click', (event) => {
    if (event.target === characterModal) {
        closeCharacterModal();
    }
});

function normalizeValue(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase();
}

function getStoredCharacters() {
    const storedCharacters = localStorage.getItem('rpgsys-characters');
    if (storedCharacters) {
        try {
            const parsed = JSON.parse(storedCharacters);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        } catch (error) {
            console.warn('Não foi possível ler os personagens salvos.', error);
        }
    }

    const savedCharacter = localStorage.getItem('rpgsys-character');
    if (savedCharacter) {
        try {
            const parsed = JSON.parse(savedCharacter);
            return parsed ? [parsed] : [];
        } catch (error) {
            console.warn('Não foi possível ler o personagem salvo.', error);
        }
    }

    return [];
}

function persistCharactersToStorage(characters) {
    localStorage.setItem('rpgsys-characters', JSON.stringify(characters));
    if (characters.length) {
        localStorage.setItem('rpgsys-character', JSON.stringify(characters[0]));
    }
}

// Calcula atributos e perícias com base em classe, raça e antecedente
function calculateCharacterData(character) {
    const classProfiles = {
        guerreiro: { forca: 2, destreza: 0, constituicao: 2, inteligencia: 0, sabedoria: 1, carisma: 0 },
        mago: { forca: 0, destreza: 0, constituicao: 1, inteligencia: 2, sabedoria: 1, carisma: 1 },
        ladino: { forca: 0, destreza: 2, constituicao: 1, inteligencia: 1, sabedoria: 0, carisma: 1 },
        clerigo: { forca: 0, destreza: 0, constituicao: 1, inteligencia: 0, sabedoria: 2, carisma: 1 },
        ranger: { forca: 1, destreza: 1, constituicao: 1, inteligencia: 0, sabedoria: 1, carisma: 0 },
        barbaro: { forca: 2, destreza: 1, constituicao: 2, inteligencia: 0, sabedoria: 1, carisma: 0 },
        bardo: { forca: 0, destreza: 1, constituicao: 1, inteligencia: 1, sabedoria: 0, carisma: 2 },
        bruxo: { forca: 0, destreza: 0, constituicao: 1, inteligencia: 1, sabedoria: 0, carisma: 2 },
        druida: { forca: 0, destreza: 0, constituicao: 1, inteligencia: 1, sabedoria: 2, carisma: 0 },
        monge: { forca: 1, destreza: 2, constituicao: 1, inteligencia: 0, sabedoria: 1, carisma: 0 },
        paladino: { forca: 2, destreza: 0, constituicao: 1, inteligencia: 0, sabedoria: 1, carisma: 1 },
        patrulheiro: { forca: 1, destreza: 2, constituicao: 1, inteligencia: 0, sabedoria: 1, carisma: 0 },
        artifice: { forca: 1, destreza: 1, constituicao: 1, inteligencia: 2, sabedoria: 0, carisma: 0 },
        feiticeiro: { forca: 0, destreza: 0, constituicao: 1, inteligencia: 0, sabedoria: 0, carisma: 2 }
    };

    const raceBonuses = {
        humano: { forca: 1, destreza: 1, constituicao: 1, inteligencia: 1, sabedoria: 1, carisma: 1 },
        anao: { forca: 1, destreza: 0, constituicao: 2, inteligencia: 0, sabedoria: 1, carisma: 0 },
        elfo: { forca: 0, destreza: 2, constituicao: 0, inteligencia: 1, sabedoria: 1, carisma: 0 },
        halfling: { forca: 0, destreza: 2, constituicao: 1, inteligencia: 0, sabedoria: 0, carisma: 1 },
        tiefling: { forca: 0, destreza: 0, constituicao: 1, inteligencia: 1, sabedoria: 0, carisma: 2 },
        draconato: { forca: 2, destreza: 0, constituicao: 1, inteligencia: 0, sabedoria: 0, carisma: 1 },
        gnomo: { forca: 0, destreza: 0, constituicao: 0, inteligencia: 2, sabedoria: 0, carisma: 1 },
        'meio-elfo': { forca: 0, destreza: 1, constituicao: 0, inteligencia: 1, sabedoria: 0, carisma: 2 },
        'meio-orc': { forca: 2, destreza: 0, constituicao: 1, inteligencia: 0, sabedoria: 0, carisma: 0 },
        aasimar: { forca: 0, destreza: 0, constituicao: 1, inteligencia: 0, sabedoria: 1, carisma: 2 },
        firbolg: { forca: 2, destreza: 0, constituicao: 1, inteligencia: 0, sabedoria: 1, carisma: 0 },
        golias: { forca: 2, destreza: 0, constituicao: 2, inteligencia: 0, sabedoria: 0, carisma: 0 },
        kenku: { forca: 0, destreza: 2, constituicao: 0, inteligencia: 1, sabedoria: 0, carisma: 0 },
        lagarto: { forca: 2, destreza: 0, constituicao: 1, inteligencia: 0, sabedoria: 1, carisma: 0 },
        tabaxi: { forca: 0, destreza: 2, constituicao: 0, inteligencia: 0, sabedoria: 1, carisma: 0 },
        tritao: { forca: 0, destreza: 0, constituicao: 2, inteligencia: 1, sabedoria: 0, carisma: 0 },
        bugbear: { forca: 2, destreza: 1, constituicao: 1, inteligencia: 0, sabedoria: 0, carisma: 0 },
        goblin: { forca: 0, destreza: 2, constituicao: 1, inteligencia: 0, sabedoria: 0, carisma: 0 },
        hobgoblin: { forca: 1, destreza: 1, constituicao: 1, inteligencia: 0, sabedoria: 0, carisma: 0 },
        kobold: { forca: 0, destreza: 2, constituicao: 0, inteligencia: 0, sabedoria: 0, carisma: 1 },
        orc: { forca: 2, destreza: 0, constituicao: 1, inteligencia: 0, sabedoria: 0, carisma: 0 },
        'yuan-ti': { forca: 0, destreza: 0, constituicao: 0, inteligencia: 2, sabedoria: 0, carisma: 1 },
        gensen: { forca: 0, destreza: 0, constituicao: 1, inteligencia: 1, sabedoria: 0, carisma: 1 },
        aarakocra: { forca: 0, destreza: 2, constituicao: 0, inteligencia: 1, sabedoria: 0, carisma: 0 },
        changeling: { forca: 0, destreza: 1, constituicao: 0, inteligencia: 1, sabedoria: 0, carisma: 1 },
        kalashtar: { forca: 0, destreza: 0, constituicao: 1, inteligencia: 0, sabedoria: 2, carisma: 0 },
        shifter: { forca: 1, destreza: 1, constituicao: 1, inteligencia: 0, sabedoria: 0, carisma: 0 },
        warforged: { forca: 1, destreza: 0, constituicao: 2, inteligencia: 0, sabedoria: 0, carisma: 0 },
        gith: { forca: 0, destreza: 2, constituicao: 0, inteligencia: 1, sabedoria: 0, carisma: 0 },
        centauro: { forca: 2, destreza: 1, constituicao: 1, inteligencia: 0, sabedoria: 0, carisma: 0 },
        minotauro: { forca: 2, destreza: 0, constituicao: 1, inteligencia: 0, sabedoria: 1, carisma: 0 },
        satirista: { forca: 0, destreza: 0, constituicao: 0, inteligencia: 1, sabedoria: 1, carisma: 2 },
        leonino: { forca: 2, destreza: 0, constituicao: 1, inteligencia: 0, sabedoria: 0, carisma: 1 },
        fada: { forca: 0, destreza: 1, constituicao: 0, inteligencia: 1, sabedoria: 0, carisma: 2 },
        harengon: { forca: 0, destreza: 2, constituicao: 0, inteligencia: 0, sabedoria: 1, carisma: 0 },
        owlin: { forca: 0, destreza: 2, constituicao: 0, inteligencia: 1, sabedoria: 1, carisma: 0 },
        'thri-kreen': { forca: 1, destreza: 2, constituicao: 1, inteligencia: 0, sabedoria: 0, carisma: 0 },
        giff: { forca: 2, destreza: 0, constituicao: 2, inteligencia: 0, sabedoria: 0, carisma: 0 },
        hadozee: { forca: 0, destreza: 2, constituicao: 1, inteligencia: 0, sabedoria: 0, carisma: 0 },
        plasmoide: { forca: 0, destreza: 0, constituicao: 2, inteligencia: 1, sabedoria: 0, carisma: 0 },
        autognomo: { forca: 0, destreza: 0, constituicao: 1, inteligencia: 2, sabedoria: 0, carisma: 0 },
        kunder: { forca: 0, destreza: 2, constituicao: 0, inteligencia: 1, sabedoria: 0, carisma: 1 },
        glithzerai: { forca: 0, destreza: 1, constituicao: 0, inteligencia: 2, sabedoria: 0, carisma: 0 }
    };

    const backgroundBonuses = {
        acolito: { forca: 0, destreza: 0, constituicao: 1, inteligencia: 0, sabedoria: 2, carisma: 0 },
        artesao: { forca: 1, destreza: 0, constituicao: 0, inteligencia: 1, sabedoria: 0, carisma: 0 },
        charlatao: { forca: 0, destreza: 0, constituicao: 0, inteligencia: 0, sabedoria: 0, carisma: 2 },
        criminoso: { forca: 0, destreza: 2, constituicao: 0, inteligencia: 0, sabedoria: 0, carisma: 1 },
        entretenedor: { forca: 0, destreza: 1, constituicao: 0, inteligencia: 0, sabedoria: 0, carisma: 2 },
        eremita: { forca: 0, destreza: 0, constituicao: 1, inteligencia: 0, sabedoria: 2, carisma: 0 },
        forasteiro: { forca: 1, destreza: 1, constituicao: 1, inteligencia: 0, sabedoria: 0, carisma: 0 },
        heroi: { forca: 1, destreza: 0, constituicao: 1, inteligencia: 0, sabedoria: 0, carisma: 0 },
        marinheiro: { forca: 1, destreza: 1, constituicao: 0, inteligencia: 0, sabedoria: 0, carisma: 0 },
        nobre: { forca: 0, destreza: 0, constituicao: 0, inteligencia: 1, sabedoria: 0, carisma: 2 },
        orfao: { forca: 0, destreza: 0, constituicao: 1, inteligencia: 0, sabedoria: 0, carisma: 1 },
        sabio: { forca: 0, destreza: 0, constituicao: 0, inteligencia: 2, sabedoria: 1, carisma: 0 },
        soldado: { forca: 1, destreza: 0, constituicao: 1, inteligencia: 0, sabedoria: 0, carisma: 0 }
    };

    const normalizedClass = normalizeValue(character.className || '');
    const normalizedRace = normalizeValue(character.race || '');
    const normalizedBackground = normalizeValue(character.background || '');

    const classBonus = classProfiles[normalizedClass] || {};
    const raceBonus = raceBonuses[normalizedRace] || {};
    const backgroundBonus = backgroundBonuses[normalizedBackground] || {};

    return {
        attributes: {
            forca: 8 + (classBonus.forca || 0) + (raceBonus.forca || 0) + (backgroundBonus.forca || 0),
            destreza: 8 + (classBonus.destreza || 0) + (raceBonus.destreza || 0) + (backgroundBonus.destreza || 0),
            constituicao: 8 + (classBonus.constituicao || 0) + (raceBonus.constituicao || 0) + (backgroundBonus.constituicao || 0),
            inteligencia: 8 + (classBonus.inteligencia || 0) + (raceBonus.inteligencia || 0) + (backgroundBonus.inteligencia || 0),
            sabedoria: 8 + (classBonus.sabedoria || 0) + (raceBonus.sabedoria || 0) + (backgroundBonus.sabedoria || 0),
            carisma: 8 + (classBonus.carisma || 0) + (raceBonus.carisma || 0) + (backgroundBonus.carisma || 0)
        },
        skills: {
            Acrobacia: 8 + (classBonus.destreza || 0) + (raceBonus.destreza || 0),
            Atletismo: 8 + (classBonus.forca || 0) + (raceBonus.forca || 0),
            Arcanismo: 8 + (classBonus.inteligencia || 0) + (raceBonus.inteligencia || 0),
            Furtividade: 8 + (classBonus.destreza || 0) + (raceBonus.destreza || 0),
            História: 8 + (classBonus.inteligencia || 0) + (raceBonus.inteligencia || 0),
            Intuição: 8 + (classBonus.sabedoria || 0) + (raceBonus.sabedoria || 0),
            Medicina: 8 + (classBonus.sabedoria || 0) + (raceBonus.sabedoria || 0),
            Natureza: 8 + (classBonus.inteligencia || 0) + (raceBonus.inteligencia || 0),
            Percepção: 8 + (classBonus.sabedoria || 0) + (raceBonus.sabedoria || 0),
            Persuasão: 8 + (classBonus.carisma || 0) + (raceBonus.carisma || 0),
            Religião: 8 + (classBonus.sabedoria || 0) + (raceBonus.sabedoria || 0),
            Sobrevivência: 8 + (classBonus.sabedoria || 0) + (raceBonus.sabedoria || 0)
        }
    };
}

// Renderiza a ficha atualizada na interface do jogador
function renderCharacter(character) {
    if (!character) {
        characterSummary.innerHTML = '<p class="empty-state">Nenhum personagem criado ainda.</p>';
        changePhotoBtn.classList.add('hidden');
        createCharacterBtn.classList.remove('hidden');
        return;
    }

    currentCharacter = character;
    const { attributes, skills } = calculateCharacterData(character);
    const hp = Number(character.hp ?? 10);
    const hpMax = Number(character.hpMax ?? 20);
    const ca = Number(character.ca ?? 10);
    const caMax = Number(character.caMax ?? 10);
    const xp = Number(character.xp ?? 0);
    const xpMax = Number(character.xpMax ?? 300);

    document.getElementById('name').textContent = character.name || '';
    document.getElementById('level').textContent = character.level || 'Nível 1';
    document.getElementById('race').textContent = character.race || '';
    document.getElementById('class').textContent = character.className || '';

    const avatarElement = document.querySelector('.avatar');
    if (avatarElement) {
        avatarElement.src = character.imageUrl || '';
    }

    document.getElementById('hpBar').value = hp;
    document.getElementById('hpBar').max = hpMax;
    document.getElementById('hpValue').textContent = `${hp} / ${hpMax}`;

    document.getElementById('caBar').value = ca;
    document.getElementById('caBar').max = caMax;
    document.getElementById('caValue').textContent = `${ca} / ${caMax}`;

    document.getElementById('xpBar').value = xp;
    document.getElementById('xpBar').max = xpMax;
    document.getElementById('xpValue').textContent = `${xp} / ${xpMax}`;

    changePhotoBtn.classList.toggle('hidden', false);
    createCharacterBtn.classList.add('hidden');

    characterSummary.innerHTML = `
        <div class="character-summary-card">
            <div class="summary-top">
                <img class="summary-avatar" src="${character.imageUrl || 'https://via.placeholder.com/72'}">
                <div class="summary-text">
                    <h3>${character.name || 'Personagem sem nome'}</h3>
                    <p>${character.className || 'Classe'} · ${character.race || 'Raça'} · ${character.background || 'Antecedente'}</p>
                </div>
            </div>

            <div class="stats-grid">
                <div class="stat-box"><span>Força</span><strong>${attributes.forca}</strong></div>
                <div class="stat-box"><span>Destreza</span><strong>${attributes.destreza}</strong></div>
                <div class="stat-box"><span>Constituição</span><strong>${attributes.constituicao}</strong></div>
                <div class="stat-box"><span>Inteligência</span><strong>${attributes.inteligencia}</strong></div>
                <div class="stat-box"><span>Sabedoria</span><strong>${attributes.sabedoria}</strong></div>
                <div class="stat-box"><span>Carisma</span><strong>${attributes.carisma}</strong></div>
            </div>

            <div class="skills-grid">
                ${Object.entries(skills).map(([name, value]) => `
                    <div class="skill-box">
                        <span>${name}</span>
                        <strong>${value}</strong>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

async function uploadToCloudinary(file) {
    if (!file) {
        return '';
    }

    uploadStatus.textContent = 'Enviando imagem...';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default');
    formData.append('api_key', 'BA0bxE6Wri2W3LUg9NABL0yLwok');

    const response = await fetch('https://api.cloudinary.com/v1_1/demo/image/upload', {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        throw new Error('Não foi possível enviar a imagem.');
    }

    const result = await response.json();
    return result.secure_url || result.url || '';
}

async function persistCharacter(character) {
    const characters = getStoredCharacters();
    const normalizedCharacter = {
        ...character,
        id: character.id || `character-${Date.now()}`,
        hp: Number(character.hp ?? 10),
        ca: Number(character.ca ?? 10),
        xp: Number(character.xp ?? 0),
        hpMax: Number(character.hpMax ?? 20),
        caMax: Number(character.caMax ?? 10),
        xpMax: Number(character.xpMax ?? 300),
        updatedAt: new Date().toISOString()
    };

    const index = characters.findIndex((item) => item.id === normalizedCharacter.id);
    if (index >= 0) {
        characters[index] = { ...characters[index], ...normalizedCharacter };
    } else {
        characters.unshift(normalizedCharacter);
    }

    persistCharactersToStorage(characters);

    if (window.RPGSysFirebase?.saveCharacterData) {
        try {
            await window.RPGSysFirebase.saveCharacterData(normalizedCharacter);
        } catch (error) {
            console.warn('Erro ao salvar no Firebase:', error);
        }
    }

    return normalizedCharacter;
}

function createPhotoInput() {
    if (photoInput) {
        return photoInput;
    }

    photoInput = document.createElement('input');
    photoInput.type = 'file';
    photoInput.accept = 'image/*';
    photoInput.style.display = 'none';
    document.body.appendChild(photoInput);
    return photoInput;
}

changePhotoBtn.addEventListener('click', () => {
    createPhotoInput().click();
});

createPhotoInput().addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file || !currentCharacter) {
        return;
    }

    try {
        const imageUrl = await uploadToCloudinary(file);
        const updatedCharacter = await persistCharacter({ ...currentCharacter, imageUrl });
        renderCharacter(updatedCharacter);
        uploadStatus.textContent = 'Foto atualizada com sucesso.';
    } catch (error) {
        uploadStatus.textContent = error.message || 'Erro ao atualizar a foto.';
    } finally {
        event.target.value = '';
    }
});

characterForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(characterForm);
    const data = {
        name: formData.get('name').toString().trim(),
        className: formData.get('className').toString().trim(),
        race: formData.get('race').toString().trim(),
        background: formData.get('background').toString().trim(),
        level: 'Nível 1',
        hp: 10,
        ca: 10,
        xp: 0,
        hpMax: 20,
        caMax: 10,
        xpMax: 300
    };

    try {
        const imageFile = avatarInput.files[0];
        if (imageFile) {
            data.imageUrl = await uploadToCloudinary(imageFile);
        }

        const savedCharacter = await persistCharacter(data);
        renderCharacter(savedCharacter);
        closeCharacterModal();
        uploadStatus.textContent = 'Personagem salvo com sucesso.';
    } catch (error) {
        uploadStatus.textContent = error.message || 'Erro ao salvar o personagem.';
    }
});

async function initializeCharacterView() {
    const storedCharacters = getStoredCharacters();
    if (storedCharacters.length) {
        renderCharacter(storedCharacters[0]);
        return;
    }

    if (window.RPGSysFirebase?.loadAllCharacterData) {
        try {
            const remoteCharacters = await window.RPGSysFirebase.loadAllCharacterData();
            if (remoteCharacters.length) {
                persistCharactersToStorage(remoteCharacters);
                renderCharacter(remoteCharacters[0]);
                return;
            }
        } catch (error) {
            console.warn('Não foi possível carregar os personagens do Firebase.', error);
        }
    }

    renderCharacter(null);
}

initializeCharacterView();
