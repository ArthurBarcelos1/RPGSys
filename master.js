// Lista e controla os personagens disponíveis na visão do mestre
const masterList = document.getElementById('masterList');
const logoutBtn = document.getElementById('logoutBtn');

function logout() {
    localStorage.removeItem('rpgsys-session');
    window.location.href = 'login.html';
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Monta a interface da visão do mestre com campos de XP, CA e vida
function renderMasterList(characters) {
    if (!characters.length) {
        masterList.innerHTML = '<div class="master-card"><p>Nenhum personagem encontrado.</p></div>';
        return;
    }

    masterList.innerHTML = characters.map((character) => `
        <article class="master-card">
            <div class="master-card-top">
                <div>
                    <strong>${escapeHtml(character.name || 'Sem nome')}</strong>
                    <div><span>${escapeHtml(character.className || 'Classe')} · ${escapeHtml(character.race || 'Raça')}</span></div>
                </div>
                <span class="status-pill">XP ${character.xp ?? 0}</span>
            </div>
            <div class="controls">
                <div class="control-row">
                    <label for="xp-${character.id}">XP</label>
                    <input id="xp-${character.id}" type="number" value="${character.xp ?? 0}">
                </div>
                <div class="control-row">
                    <label for="ca-${character.id}">CA</label>
                    <input id="ca-${character.id}" type="number" value="${character.ca ?? 10}">
                </div>
                <div class="control-row">
                    <label for="hp-${character.id}">Vida</label>
                    <input id="hp-${character.id}" type="number" value="${character.hp ?? 10}">
                </div>
                <div class="control-row">
                    <label for="hpmax-${character.id}">Vida Máxima</label>
                    <input id="hpmax-${character.id}" type="number" value="${character.hpMax ?? 20}">
                </div>
                <div class="control-row">
                    <label for="xpmax-${character.id}">XP Máximo</label>
                    <input id="xpmax-${character.id}" type="number" value="${character.xpMax ?? 300}">
                </div>
                <div class="control-row">
                    <label for="camax-${character.id}">CA Máximo</label>
                    <input id="camax-${character.id}" type="number" value="${character.caMax ?? 10}">
                </div>
                <button data-id="${character.id}" class="save-btn">Salvar alterações</button>
            </div>
        </article>
    `).join('');
}

async function refreshCharacters() {
    try {
        const characters = window.RPGSysFirebase?.loadAllCharacterData
            ? await window.RPGSysFirebase.loadAllCharacterData()
            : [];

        renderMasterList(characters);
    } catch (error) {
        masterList.innerHTML = '<div class="master-card"><p>Não foi possível carregar os personagens.</p></div>';
        console.error(error);
    }
}

masterList.addEventListener('click', async (event) => {
    const button = event.target.closest('.save-btn');
    if (!button) {
        return;
    }

    const id = button.getAttribute('data-id');
    const characterCard = button.closest('.master-card');
    const updatedCharacter = {
        id,
        name: characterCard.querySelector('strong')?.textContent || '',
        xp: Number(characterCard.querySelector(`#xp-${id}`)?.value ?? 0),
        ca: Number(characterCard.querySelector(`#ca-${id}`)?.value ?? 10),
        hp: Number(characterCard.querySelector(`#hp-${id}`)?.value ?? 10),
        hpMax: Number(characterCard.querySelector(`#hpmax-${id}`)?.value ?? 20),
        xpMax: Number(characterCard.querySelector(`#xpmax-${id}`)?.value ?? 300),
        caMax: Number(characterCard.querySelector(`#camax-${id}`)?.value ?? 10)
    };

    if (window.RPGSysFirebase?.saveCharacterData) {
        await window.RPGSysFirebase.saveCharacterData(updatedCharacter);
    }

    localStorage.setItem('rpgsys-character', JSON.stringify(updatedCharacter));
    button.textContent = 'Salvo';
    setTimeout(() => {
        button.textContent = 'Salvar alterações';
    }, 1200);
});

refreshCharacters();
