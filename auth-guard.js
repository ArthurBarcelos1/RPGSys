(function () {
    const currentPath = window.location.pathname.split('/').pop();
    const isLoginPage = currentPath === 'login.html' || currentPath === '';
    let session = null;

    try {
        session = JSON.parse(localStorage.getItem('rpgsys-session') || 'null');
    } catch (error) {
        session = null;
    }

    if (isLoginPage) {
        if (session) {
            const role = session.role === 'GM' ? 'GM' : 'player';
            window.location.replace(role === 'GM' ? 'master.html' : 'index.html');
        }
        return;
    }

    if (!session) {
        window.location.replace('login.html');
    }
})();
