# Urdu Mental Health Annotator

A web-based annotation system for labeling Urdu social media posts. Built with Firebase for authentication and data storage, featuring multi-annotator support with progress tracking.

## Features

✨ **Multi-Annotator Support**
- Three independent annotators per post (annotator1, annotator2, annotator3)
- Each annotator's progress is tracked separately
- Resume from where you left off on login

🏷️ **Flexible Labeling**
- Four labels: Stress, Depression, Anxiety, Normal
- Auto-save on label selection
- Press **Enter** to save and move to next post
- **Next/Previous** buttons also auto-save

🌐 **Urdu RTL Support**
- Automatically detects and applies RTL formatting for Urdu text
- Preserves proper text direction and layout

📊 **Completion Tracking**
- Progress indicator shows annotated vs. total posts
- Posts marked "completed" when all 3 annotators label them
- Clear "pending" status for unfinished posts

🔐 **Firebase Integration**
- Cloud Firestore for all data storage
- Firebase Authentication for secure login
- Per-user progress persistence

## Firestore Structure

### `posts` collection
Each document represents a social media post to be annotated:

```json
{
  "text": "Urdu post text...",
  "annotator1": "Depression",     // or empty ""
  "annotator2": "Stress",
  "annotator3": "",
  "status": "pending",             // or "completed"
  "finalLabel": "",
  "createdAt": "2026-07-23T00:00:00.000Z"
}
```

### `progress` collection
Stores each annotator's current position:

```json
{
  "_doc_id": "user-uid",
  "index": 42                      // Current post index
}
```

## Setup & Deployment

### Local Development

1. **Clone or download the project**
2. **Create Firebase project** at https://console.firebase.google.com/
3. **Enable Authentication**: Email/Password provider
4. **Create Firestore database** with security rules (see below)
5. **Copy config template**:
   ```bash
   cp config.example.js config.js
   ```
6. **Add Firebase credentials** to `config.js`
7. **Run local server**:
   ```bash
   python3 -m http.server 8000
   ```
8. Open http://localhost:8000 and sign in

### Deploy to GitHub Pages

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for complete GitHub Pages setup instructions, including:
- Repository initialization
- Security best practices
- API key protection
- Firestore rules configuration

## Firestore Security Rules

⚠️ **Set these rules to prevent unauthorized access:**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Only authenticated users can read/write posts
    match /posts/{document=**} {
      allow read: if request.auth != null;
      allow update: if request.auth != null;
      allow create: if false;
      allow delete: if false;
    }
    
    // Each user accesses only their own progress
    match /progress/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

## User Identification

The app automatically identifies which annotator is logged in by matching the email to:
- `annotator1`, `annotator2`, `annotator3` in the email
- Numeric suffix (1, 2, 3) before @
- Defaults to `annotator1` if no match

Examples:
- `annotator1@gmail.com` → uses `annotator1` field
- `user1@example.com` → uses `annotator1` field
- `ann2@test.com` → uses `annotator2` field

## Project Structure

```
.
├── index.html                # Login page
├── annotator.html           # Annotation interface
├── annotator-firebase.js    # Firestore logic (main)
├── login.js                 # Auth handlers
├── firebase.js              # Firebase initialization
├── config.example.js        # Config template
├── config.js                # Local config (not committed)
├── style.css                # Styling
├── DEPLOYMENT.md            # GitHub Pages guide
├── .gitignore               # Prevents credential commits
└── assets/                  # Images/icons
```

## Usage

### For Annotators

1. **Sign In**: Use your email and password (must be registered in Firebase Authentication)
2. **Review Post**: Read the Urdu text
3. **Select Label**: Choose one of the four labels
4. **Save**:
   - Label auto-saves on selection, OR
   - Press **Enter** to save and move next, OR
   - Click **Next/Previous** to auto-save and navigate
5. **Track Progress**: Monitor your progress in the indicator bar

### For Administrators

1. **Add Posts**: Upload documents to Firestore `posts` collection with a `text` field
2. **Create Users**: In Firebase Authentication, add annotator accounts (annotator1@..., annotator2@..., annotator3@...)
3. **Monitor Progress**: Check Firestore `progress` collection for each annotator's position
4. **Review Labels**: Check `annotator1`, `annotator2`, `annotator3` fields in `posts` to see labels

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **Enter** | Save current label and move to next post |
| **Click Label** | Auto-save label immediately |
| **Next Button** | Auto-save and navigate forward |
| **Previous Button** | Auto-save and navigate backward |

## Security

✅ **Production Best Practices**:
- API keys are in `config.js`, which is **git-ignored**
- Firestore rules restrict reads/writes to authenticated users
- Each annotator can only modify their own field
- Annotators cannot see progress of others

❌ **What NOT to do**:
- Do not commit `config.js` with real credentials
- Do not share `serviceAccountKey.json`
- Do not expose API keys in version control

## Troubleshooting

### "No posts available"
- Ensure Firestore `posts` collection has documents
- Check Firestore security rules allow reads for authenticated users
- Verify Firebase config in `config.js` is correct

### "Unable to load posts from Firestore"
- Open browser console (F12) to see Firebase errors
- Check Firestore rules aren't blocking the read
- Verify user is authenticated (check Firebase Auth console)

### Annotation not saving
- Check browser console for errors
- Verify Firestore security rules allow updates
- Ensure the `posts` document still exists

### Wrong annotator field updated
- Check email matches one of: annotator1, annotator2, annotator3
- Or ensure numeric suffix is 1, 2, or 3

## Technologies

- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **Backend**: Firebase (Auth + Firestore)
- **Hosting**: GitHub Pages (static)
- **RTL Support**: Urdu text detection & direction handling

## License

MIT License - Feel free to use and modify for your project.

## Support

- Firebase Docs: https://firebase.google.com/docs
- GitHub Pages: https://pages.github.com/
- Firestore Security: https://firebase.google.com/docs/firestore/security

