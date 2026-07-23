import pandas as pd
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

# Load CSV
df = pd.read_csv("sampled_urdu_posts.csv")

for index, row in df.iterrows():
    text = str(row["text"]).strip()

    if text:
        db.collection("posts").document(f"post_{index+1:05d}").set({
            "text": text
        })

print("Dataset uploaded successfully!")
