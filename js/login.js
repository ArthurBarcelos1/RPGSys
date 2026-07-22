const loginForm = document.getElementById('loginForm');
const loginStatus = document.getElementById('loginStatus');

function getStoredSession() {
    try {
        return JSON.parse(localStorage.getItem('rpgsys-session') || 'null');
    } catch (error) {
        return null;
    }
}

function redirectToRole(role) {
    if (role === 'GM') {
        window.location.href = 'master.html';
        return;
    }

    window.location.href = 'index.html';
}

const storedSession = getStoredSession();
if (storedSession) {
    redirectToRole(storedSession.role || 'player');
}

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    console.log('[LOGIN] Botão clicado');
    loginStatus.textContent = 'Verificando credenciais...';

    const name = document.getElementById('nameInput').value.trim();
    const accessKey = document.getElementById('accessKeyInput').value.trim();

    console.log('[LOGIN] Valores digitados:', { name, accessKey });

    if (!name || !accessKey) {
        console.warn('[LOGIN] Campos vazios');
        loginStatus.textContent = 'Preencha Name e AcessKey.';
        return;
    }

    try {
        const db = window.RPGSysFirebase?.getDb ? window.RPGSysFirebase.getDb() : null;
        console.log('[LOGIN] DB disponível:', !!db);

        if (!db) {
            console.error('[LOGIN] Firebase indisponível');
            loginStatus.textContent = 'Firebase indisponível.';
            return;
        }

        const candidateIds = ['0000', '0001', '0002', '0003', '0004'];
        const matchingUser = await (async () => {
            for (const id of candidateIds) {
                const docRef = db.collection('users').doc(id);
                const snapshot = await docRef.get();
                if (!snapshot.exists) {
                    continue;
                }

                const data = snapshot.data() || {};
                const storedName = String(data.Name || '').trim().toLowerCase();
                const storedAccessKey = String(data.AcessKey || '').trim();
                const matched = storedName === name.toLowerCase() && storedAccessKey === accessKey;

                console.log('[LOGIN] Comparando:', { docId: id, storedName, storedAccessKey, matched });

                if (matched) {
                    return { id, data };
                }
            }

            return null;
        })();

        if (!matchingUser) {
            console.warn('[LOGIN] Nenhum usuário bateu com os dados informados');
            loginStatus.textContent = 'Credenciais inválidas.';
            return;
        }

        const role = matchingUser.data.role || 'player';
        console.log('[LOGIN] Usuário encontrado:', { docId: matchingUser.id, role });
        localStorage.setItem('rpgsys-session', JSON.stringify({ name, accessKey, role }));
        redirectToRole(role);
    } catch (error) {
        console.error('[LOGIN] Erro ao validar usuário:', error);
        loginStatus.textContent = 'Erro ao validar usuário.';
    }
});
