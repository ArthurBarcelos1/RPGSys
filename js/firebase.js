const firebaseConfig = {
  apiKey: "AIzaSyAM-ZU4ho0qs3jRWUXZEHrUM82bz3vvlro",
  authDomain: "rpgsys-ae4bc.firebaseapp.com",
  databaseURL: "https://rpgsys-ae4bc-default-rtdb.firebaseio.com",
  projectId: "rpgsys-ae4bc",
  storageBucket: "rpgsys-ae4bc.firebasestorage.app",
  messagingSenderId: "22232601003",
  appId: "1:22232601003:web:cf38df9fbcf442c79b42ee",
  measurementId: "G-3KLBEM1LWV"
};

let firebaseApp = null;
let firebaseDb = null;

function initializeFirebase() {
    if (typeof firebase === "undefined") {
        console.warn("Firebase SDK não foi carregado.");
        return null;
    }

    if (!firebase.apps.length) {
        firebaseApp = firebase.initializeApp(firebaseConfig);
    } else {
        firebaseApp = firebase.app();
    }

    firebaseDb = firebase.firestore();

    return { app: firebaseApp, db: firebaseDb };
}

async function saveCharacterData(data) {
    const connection = initializeFirebase();

    if (!connection || !connection.db) {
        return null;
    }

    if (!firebaseConfig.projectId) {
        console.warn("Preencha as credenciais do Firebase no arquivo js/firebase.js.");
        return null;
    }

    const characterId = data.id || "default";
    const payload = { ...data, updatedAt: new Date().toISOString() };

    return connection.db.collection("characters").doc(characterId).set(payload, { merge: true });
}

async function loadCharacterData(characterId = "default") {
    const connection = initializeFirebase();

    if (!connection || !connection.db) {
        return {};
    }

    if (!firebaseConfig.projectId) {
        console.warn("Preencha as credenciais do Firebase no arquivo js/firebase.js.");
        return {};
    }

    const snapshot = await connection.db.collection("characters").doc(characterId).get();
    return snapshot.exists ? snapshot.data() : {};
}

async function loadAllCharacterData() {
    const connection = initializeFirebase();

    if (!connection || !connection.db) {
        return [];
    }

    if (!firebaseConfig.projectId) {
        console.warn("Preencha as credenciais do Firebase no arquivo js/firebase.js.");
        return [];
    }

    const snapshot = await connection.db.collection("characters").get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

function getDb() {
    const connection = initializeFirebase();
    return connection?.db || null;
}

window.RPGSysFirebase = {
    initializeFirebase,
    getDb,
    saveCharacterData,
    loadCharacterData,
    loadAllCharacterData
};
