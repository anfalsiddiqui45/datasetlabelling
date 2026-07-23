# GitHub Pages Deployment Guide

This guide explains how to deploy the Urdu Mental Health Annotator to GitHub Pages securely.

## Prerequisites

- GitHub account
- Firebase project with Firestore database
- Authenticated users (Annotators 1, 2, 3)

## Step 1: Prepare Your Local Repository

### 1.1 Initialize Git (if not already done)
```bash
cd /path/to/datasetlabelling
git init
```

### 1.2 Create `config.js` from the template
```bash
cp config.example.js config.js
```

### 1.3 Add your Firebase credentials to `config.js`
Edit `config.js` and replace the placeholder values with your actual Firebase config:
- Get your config from [Firebase Console](https://console.firebase.google.com/)
- Navigate to **Project Settings → Your apps → Web app**
- Copy the config object

**Example:**
```javascript
window.firebaseConfig = {
  apiKey: "AIzaSyBGu78CjMtUyxEZV7nzas6X0uzsjSCAdN0",
  authDomain: "datasetlabelling-f6dc3.firebaseapp.com",
  projectId: "datasetlabelling-f6dc3",
  storageBucket: "datasetlabelling-f6dc3.appspot.com",
  messagingSenderId: "199079948358",
  appId: "1:199079948358:web:a2af77f8ad2f3a6af45a47",
};
```

### 1.4 Verify `.gitignore` includes sensitive files
The `.gitignore` file should contain:
- `config.js` (your actual credentials)
- `serviceAccountKey.json`
- `venv/`, `.venv/`
- `*.csv`

This ensures credentials are **never** committed to GitHub.

## Step 2: Configure Firestore Security Rules

**IMPORTANT**: Without proper security rules, anyone can read/write to your Firestore.

### 2.1 Set Firestore Rules
Go to **Firebase Console → Firestore Database → Rules** and replace the default with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Only authenticated users can access posts
    match /posts/{document=**} {
      allow read: if request.auth != null;
      allow update: if request.auth != null;
      allow create: if false;
      allow delete: if false;
    }
    
    // Each user can only access their own progress
    match /progress/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

This ensures:
- Only **authenticated users** can read/write posts
- Users can only modify their own progress
- No one can create or delete posts via the app

### 2.2 Enable Email/Password Authentication
- Go to **Firebase Console → Authentication → Sign-in method**
- Enable **Email/Password** provider
- Create user accounts for each annotator (annotator1@gmail.com, annotator2@gmail.com, etc.)

## Step 3: Create GitHub Repository

### 3.1 Create a new repository on GitHub
- Go to [github.com/new](https://github.com/new)
- Repository name: `datasetlabelling` (or your preferred name)
- Choose **Public** (for GitHub Pages to work)
- Do NOT initialize with README/License (we have one locally)

### 3.2 Add remote and push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/datasetlabelling.git
git branch -M main
git add .
git commit -m "Initial commit: Firestore-backed annotation system"
git push -u origin main
```

**Verify nothing sensitive was committed:**
```bash
git log --all --full-history -p -- config.js | head -20
```
If `config.js` appears in the output, something went wrong—do NOT push.

## Step 4: Enable GitHub Pages

### 4.1 In your GitHub repository, go to **Settings → Pages**
- **Build and deployment → Source**: Select `Deploy from a branch`
- **Branch**: Select `main` and `/ (root)` folder
- Click **Save**

GitHub will automatically build and deploy the `main` branch.

### 4.2 Wait for deployment
- GitHub will show a banner: "Your site is live at `https://YOUR_USERNAME.github.io/datasetlabelling`"
- This may take 1-2 minutes

## Step 5: Share & Use

### 5.1 Users deploy the app
1. Open `https://YOUR_USERNAME.github.io/datasetlabelling`
2. Copy `config.example.js` to `config.js` locally
3. Add their Firebase credentials to `config.js`
4. Open `index.html` locally or serve it with a simple HTTP server

### 5.2 For direct GitHub Pages use (if hosting the app directly)
- The `config.js` must contain real credentials
- **DO NOT commit `config.js` to GitHub if hosting publicly**
- Users should clone the repo and add their config locally

## Security Best Practices

✅ **DO:**
- Keep `.gitignore` updated
- Store credentials in `config.js` (not in git)
- Use strong passwords for annotator accounts
- Review Firestore security rules regularly
- Use HTTPS (GitHub Pages does this automatically)

❌ **DON'T:**
- Commit `config.js` with real API keys
- Commit `serviceAccountKey.json`
- Use the same password for all annotators
- Share GitHub repository credentials in public channels

## Troubleshooting

### "No posts available" message
- Check Firestore has documents in the `posts` collection
- Verify security rules allow authenticated reads
- Check browser console (F12) for Firebase errors

### Authentication not working
- Verify Firebase credentials in `config.js`
- Check annotator email is registered in Firebase Authentication
- Ensure password is correct

### GitHub Pages not updating
- Clear browser cache (Ctrl+Shift+Delete)
- Wait 2-3 minutes for GitHub to deploy
- Check repository Settings → Pages for deployment status

## Support

For Firebase setup: [Firebase Docs](https://firebase.google.com/docs)
For GitHub Pages: [GitHub Pages Guide](https://pages.github.com/)
