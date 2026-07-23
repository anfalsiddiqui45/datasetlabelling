# Pre-GitHub Pages Checklist

Before pushing to GitHub, ensure you've completed these steps:

## Security

- [ ] `config.js` is in `.gitignore` (check: `cat .gitignore | grep config.js`)
- [ ] `serviceAccountKey.json` is in `.gitignore`
- [ ] `venv/` and `.venv/` are in `.gitignore`
- [ ] `.csv` files are in `.gitignore` (to avoid leaking data)
- [ ] You have NOT committed `config.js` with real credentials
- [ ] You have NOT committed `serviceAccountKey.json`

Verify with:
```bash
git status
```
Should show:
```
On branch main
nothing to commit, working tree clean
```

## Firebase Configuration

- [ ] Created `config.js` from `config.example.js`
- [ ] Added your real Firebase credentials to `config.js`
- [ ] Firebase project has Email/Password authentication enabled
- [ ] Firestore database is created
- [ ] Security rules are updated (see DEPLOYMENT.md)
- [ ] Created at least one test user (annotator1@gmail.com, etc.)
- [ ] `posts` collection has sample documents with `text` field

## Repository Setup

- [ ] Git repository initialized: `git init`
- [ ] Remote added: `git remote add origin https://github.com/YOUR_USERNAME/repo-name.git`
- [ ] All files staged: `git add .`
- [ ] Initial commit: `git commit -m "Initial commit"`
- [ ] Pushed to main: `git push -u origin main`

## GitHub Pages Configuration

- [ ] Repository is **PUBLIC** on GitHub
- [ ] Settings → Pages → Source set to `main` branch, `/ (root)` folder
- [ ] Deployment is active (check for "Your site is live at..." message)
- [ ] Wait 2-3 minutes for initial deployment

## Testing

- [ ] App loads at `https://YOUR_USERNAME.github.io/repo-name`
- [ ] Login works with test user credentials
- [ ] Posts load from Firestore
- [ ] Label selection auto-saves
- [ ] Next/Previous navigation works
- [ ] Pressing Enter saves and advances to next post
- [ ] Browser console (F12) shows no critical errors

## Done! 🎉

Your Urdu Mental Health Annotator is now live on GitHub Pages!

Share the link with your team:
```
https://YOUR_USERNAME.github.io/datasetlabelling
```

**Remember**: Each user must add their own `config.js` with Firebase credentials if they clone the repo locally.
