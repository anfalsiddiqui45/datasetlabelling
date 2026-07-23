let posts = [];
let currentIndex = 0;
let annotations = {};
let currentUser = null;

function getFallbackPosts() {
  return [
    {
      id: 'demo_001',
      text: 'I have been feeling low for several days and have lost interest in activities I usually enjoy.'
    },
    {
      id: 'demo_002',
      text: 'My thoughts feel crowded and I find it difficult to rest or focus on simple tasks.'
    },
    {
      id: 'demo_003',
      text: 'I am trying to stay productive, but the pressure of school and work is becoming overwhelming.'
    }
  ];
}

function updateProgress() {
  const progressText = document.getElementById('progress-text');
  const progressCount = document.getElementById('progress-count');
  const progressFill = document.getElementById('progress-fill');

  if (!progressText || !progressCount || !progressFill) {
    return;
  }

  const total = posts.length || 1;
  const completed = Object.keys(annotations).length;
  progressText.textContent = `Annotated ${completed} of ${total}`;
  progressCount.textContent = `${Math.min(currentIndex + 1, total)}/${total}`;
  progressFill.style.width = `${(Math.min(currentIndex + 1, total) / total) * 100}%`;
}

function renderPost() {
  const postLabel = document.getElementById('post-label');
  const postText = document.getElementById('post-text');
  const form = document.getElementById('annotation-form');

  if (!posts.length) {
    postLabel.textContent = 'No posts available';
    postText.textContent = 'Add posts to the Firestore collection named posts or upload a CSV to import them.';
    return;
  }

  const post = posts[currentIndex];
  postLabel.textContent = `Post ${currentIndex + 1}`;
  postText.textContent = post.text;

  const selected = annotations[post.id];
  form.querySelectorAll('input[name="label"]').forEach((input) => {
    input.checked = input.value === selected;
  });

  updateProgress();
}

async function loadPosts() {
  const db = window.firebaseDb;

  if (!db) {
    posts = getFallbackPosts();
    renderPost();
    return;
  }

  try {
    const snapshot = await db.collection('posts').orderBy('createdAt', 'asc').get();
    posts = snapshot.empty
      ? getFallbackPosts()
      : snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.warn('Falling back to demo posts:', error);
    posts = getFallbackPosts();
  }

  renderPost();
}

async function loadAnnotations(uid) {
  const db = window.firebaseDb;
  annotations = {};

  if (!db || !uid) {
    return;
  }

  try {
    const snapshot = await db.collection('annotations').where('uid', '==', uid).get();
    snapshot.forEach((doc) => {
      const data = doc.data();
      annotations[data.postId] = data.label;
    });
  } catch (error) {
    console.warn('Unable to load annotations:', error);
  }

  renderPost();
}

async function saveAnnotation() {
  const messageBox = document.getElementById('annotation-message');
  const selectedLabel = document.querySelector('input[name="label"]:checked');

  if (!selectedLabel) {
    messageBox.textContent = 'Please select one label before saving.';
    return;
  }

  if (!posts.length) {
    messageBox.textContent = 'There are no posts to annotate.';
    return;
  }

  const post = posts[currentIndex];
  const db = window.firebaseDb;

  if (!db) {
    annotations[post.id] = selectedLabel.value;
    messageBox.textContent = 'Saved locally for demo purposes.';
    updateProgress();
    return;
  }

  try {
    const docId = `${currentUser.uid}_${post.id}`;
    await db.collection('annotations').doc(docId).set({
      uid: currentUser.uid,
      postId: post.id,
      label: selectedLabel.value,
      timestamp: new Date().toISOString()
    });

    annotations[post.id] = selectedLabel.value;
    messageBox.textContent = 'Annotation saved successfully.';
    updateProgress();
  } catch (error) {
    messageBox.textContent = error.message || 'Unable to save annotation.';
  }
}

function changePost(step) {
  if (!posts.length) {
    return;
  }

  currentIndex = (currentIndex + step + posts.length) % posts.length;
  renderPost();
}

function bindEvents() {
  document.getElementById('save-btn').addEventListener('click', saveAnnotation);
  document.getElementById('prev-btn').addEventListener('click', () => changePost(-1));
  document.getElementById('next-btn').addEventListener('click', () => changePost(1));
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

  bindEvents();

  window.firebaseAuth.onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = 'index.html';
      return;
    }

    currentUser = user;
    document.getElementById('user-info').textContent = `Signed in as ${user.email}`;
    await loadAnnotations(user.uid);
    await loadPosts();
  });
});
