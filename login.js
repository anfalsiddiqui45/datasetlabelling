document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const messageBox = document.getElementById('auth-message');

  if (!form || !messageBox) {
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!window.firebaseAuth) {
      messageBox.textContent = 'Firebase is not configured yet. Please update config.js with your project credentials.';
      return;
    }

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
      await window.firebaseAuth.signInWithEmailAndPassword(email, password);
      messageBox.textContent = 'Signed in successfully. Redirecting...';
      window.location.href = 'annotator.html';
    } catch (error) {
      messageBox.textContent = error.message || 'Unable to sign in.';
    }
  });
});
