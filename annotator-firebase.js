let posts = [];
let currentIndex = 0;
let currentUser = null;
let annotatorField = null;
let loadErrorMessage = '';

function getAnnotatorFieldFromEmail(email) {
  if (!email) return 'annotator1';
  const e = email.toLowerCase();
  if (e.includes('annotator1') || e.includes('annotator.1') || e.includes('annotator-1')) return 'annotator1';
  if (e.includes('annotator2') || e.includes('annotator.2') || e.includes('annotator-2')) return 'annotator2';
  if (e.includes('annotator3') || e.includes('annotator.3') || e.includes('annotator-3')) return 'annotator3';
  // Fallback: try to detect numeric suffix before @ (e.g. user1@)
  const local = e.split('@')[0];
  if (local.endsWith('1')) return 'annotator1';
  if (local.endsWith('2')) return 'annotator2';
  if (local.endsWith('3')) return 'annotator3';
  return 'annotator1';
}

function updateUIProgress() {
  const progressText = document.getElementById('progress-text');
  const progressCount = document.getElementById('progress-count');
  const progressFill = document.getElementById('progress-fill');
  if (!progressText || !progressCount || !progressFill) return;

  const total = posts.length || 1;
  const completed = posts.filter(p => p.annotator1 && p.annotator2 && p.annotator3).length;
  progressText.textContent = `Annotated ${completed} of ${total}`;
  progressCount.textContent = `${Math.min(currentIndex + 1, total)}/${total}`;
  progressFill.style.width = `${(Math.min(currentIndex + 1, total) / total) * 100}%`;
}

function setDirectionForText(el, text) {
  const hasArabic = /[\u0600-\u06FF]/.test(text);
  el.dir = hasArabic ? 'rtl' : 'ltr';
}

function renderPost() {
  const postLabel = document.getElementById('post-label');
  const postText = document.getElementById('post-text');
  const form = document.getElementById('annotation-form');

  if (!posts.length) {
    postLabel.textContent = loadErrorMessage ? 'Unable to load posts' : 'No posts available';
    postText.textContent = loadErrorMessage || 'No Firestore posts are available yet. Add documents to the posts collection in Firestore.';
    postText.dir = 'ltr';
    form.querySelectorAll('input[name="label"]').forEach((input) => {
      input.checked = false;
    });
    return;
  }

  const post = posts[currentIndex];
  postLabel.textContent = `Post ${currentIndex + 1}`;
  postText.textContent = post.text || '';
  setDirectionForText(postText, post.text || '');

  form.querySelectorAll('input[name="label"]').forEach((input) => {
    input.checked = input.value === (post[annotatorField] || '');
  });

  updateUIProgress();
}

async function fetchAllPosts() {
  const db = window.firebaseDb;
  loadErrorMessage = '';

  if (!db) {
    posts = [];
    loadErrorMessage = 'Firebase Firestore is not available. Check your config.js and Firebase setup.';
    return;
  }

  try {
    const snapshot = await db.collection('posts').get();
    posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Unable to load posts from Firestore.', error);
    posts = [];

    const message = /permission|insufficient|denied/i.test(error.message || '')
      ? 'Firestore denied the request. Please allow authenticated users to read posts in Firestore Security Rules.'
      : 'Unable to load posts from Firestore. Check your Firestore rules and collection name.';

    loadErrorMessage = `${message} (${error.message || 'Unknown error'})`;
    document.getElementById('annotation-message').textContent = loadErrorMessage;
  }
}

async function loadProgress() {
  const db = window.firebaseDb;
  if (!db || !currentUser) return 0;
  try {
    const snap = await db.collection('progress').doc(currentUser.uid).get();
    if (snap.exists) {
      const data = snap.data();
      return typeof data.index === 'number' ? data.index : 0;
    }
  } catch (error) {
    console.warn('Unable to load progress:', error);
  }
  return 0;
}

async function saveProgress(index) {
  const db = window.firebaseDb;
  if (!db || !currentUser) return;
  try {
    await db.collection('progress').doc(currentUser.uid).set({ index }, { merge: true });
  } catch (error) {
    console.warn('Unable to save progress:', error);
  }
}

function findNextUnlabeled(startIndex = 0) {
  if (!posts.length) return 0;
  const n = posts.length;
  for (let i = startIndex; i < n; i++) {
    if (!posts[i][annotatorField]) return i;
  }
  for (let i = 0; i < startIndex; i++) {
    if (!posts[i][annotatorField]) return i;
  }
  return startIndex < n ? startIndex : 0;
}

async function loadWorkspaceForUser() {
  await fetchAllPosts();
  if (!posts.length) {
    renderPost();
    return;
  }

  const savedIndex = await loadProgress();
  currentIndex = Math.min(savedIndex || 0, posts.length - 1);
  currentIndex = findNextUnlabeled(currentIndex);
  renderPost();
}

async function saveAnnotation() {
  const messageBox = document.getElementById('annotation-message');
  const selectedLabelEl = document.querySelector('input[name="label"]:checked');

  if (!selectedLabelEl) {
    messageBox.textContent = 'Please select one label before saving.';
    return;
  }

  if (!posts.length) {
    messageBox.textContent = 'There are no posts to annotate.';
    return;
  }

  const label = selectedLabelEl.value;
  const post = posts[currentIndex];
  const db = window.firebaseDb;

  if (!db) {
    messageBox.textContent = 'Firestore is not available right now.';
    return;
  }

  try {
    const postRef = db.collection('posts').doc(post.id);
    await db.runTransaction(async (t) => {
      const doc = await t.get(postRef);
      if (!doc.exists) throw new Error('Post no longer exists');

      const data = doc.data() || {};
      const a1 = annotatorField === 'annotator1' ? label : (data.annotator1 || '');
      const a2 = annotatorField === 'annotator2' ? label : (data.annotator2 || '');
      const a3 = annotatorField === 'annotator3' ? label : (data.annotator3 || '');
      const newStatus = (a1 && a2 && a3) ? 'completed' : 'pending';
      const updateObj = { [annotatorField]: label, status: newStatus };
      t.update(postRef, updateObj);
    });

    posts[currentIndex][annotatorField] = label;
    posts[currentIndex].status = (posts[currentIndex].annotator1 && posts[currentIndex].annotator2 && posts[currentIndex].annotator3) ? 'completed' : 'pending';

    messageBox.textContent = 'Annotation saved successfully.';
    updateUIProgress();

    await saveProgress(currentIndex);
  } catch (error) {
    console.error('Save failed', error);
    messageBox.textContent = error.message || 'Unable to save annotation.';
  }
}

async function changePost(step) {
  if (!posts.length) return;
  currentIndex = (currentIndex + step + posts.length) % posts.length;
  renderPost();
  await saveProgress(currentIndex);
}

async function saveAndAdvance(step = 1) {
  const messageBox = document.getElementById('annotation-message');
  const selectedLabelEl = document.querySelector('input[name="label"]:checked');

  if (!selectedLabelEl) {
    messageBox.textContent = 'Please select one label before moving on.';
    return;
  }

  await saveAnnotation();
  if (posts.length) {
    await changePost(step);
  }
}

function bindEvents() {
  document.getElementById('save-btn').addEventListener('click', saveAnnotation);
  document.getElementById('prev-btn').addEventListener('click', async () => {
    await saveAnnotation();
    await changePost(-1);
  });
  document.getElementById('next-btn').addEventListener('click', async () => {
    await saveAnnotation();
    await changePost(1);
  });
  document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
      await window.firebaseAuth.signOut();
      window.location.href = 'index.html';
    } catch (error) {
      console.error(error);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (!window.firebaseAuth) {
    document.getElementById('annotation-message').textContent = 'Firebase is not configured yet. Please update config.js.';
    return;
  }

  const form = document.getElementById('annotation-form');
  const radioInputs = document.querySelectorAll('input[name="label"]');

  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      await saveAnnotation();
    });
  }

  radioInputs.forEach((input) => {
    input.addEventListener('change', async () => {
      await saveAnnotation();
    });
  });

  document.addEventListener('keydown', async (event) => {
    if (event.key === 'Enter' && !event.target.matches('textarea, input[type="text"], input[type="email"], input[type="password"]')) {
      event.preventDefault();
      await saveAndAdvance(1);
    }
  });

  bindEvents();

  window.firebaseAuth.onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = 'index.html';
      return;
    }

    currentUser = user;
    annotatorField = getAnnotatorFieldFromEmail(user.email);
    document.getElementById('user-info').textContent = `Signed in as ${user.email} (${annotatorField})`;

    await loadWorkspaceForUser();
  });
});
