(function () {
  const config = window.firebaseConfig || {};
  const hasConfig = Boolean(config.apiKey && config.projectId && config.appId);

  if (!hasConfig || config.apiKey.includes('YOUR_')) {
    window.firebaseReady = false;
    window.firebaseAuth = null;
    window.firebaseDb = null;
    window.firebase = null;
    return;
  }

  const app = firebase.initializeApp(config);
  const auth = firebase.auth();
  const db = firebase.firestore();

  window.firebaseReady = true;
  window.firebaseApp = app;
  window.firebaseAuth = auth;
  window.firebaseDb = db;
  window.firebase = firebase;
})();
