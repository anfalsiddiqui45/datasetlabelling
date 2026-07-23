#import firebase_admin
#from firebase_admin import credentials, firestore
#
#cred = credentials.Certificate("serviceAccountKey.json")
#firebase_admin.initialize_app(cred)
#
#db = firestore.client()
#
#docs = db.collection("posts").stream()
#
#count = 0
#
#for doc in docs:
#    db.collection("posts").document(doc.id).update({
#        "annotator1": "",
#        "annotator2": "",
#        "annotator3": "",
#        "finalLabel": "",
#        "status": "pending"
#    })
#    count += 1
#
#print(f"Updated {count} documents.")
#
#import firebase_admin
#from firebase_admin import credentials, firestore
#
# Initialize Firebase
#cred = credentials.Certificate("serviceAccountKey.json")
#firebase_admin.initialize_app(cred)
#
#db = firestore.client()
#
#START = 630
#END = 1000
#
#updated = 0
#
#for i in range(START, END + 1):
#
#    doc_id = f"post_{i:05d}"
#    doc_ref = db.collection("posts").document(doc_id)
#
#    # Check if document exists
#    if doc_ref.get().exists:
#        doc_ref.update({
#            "annotator1": "",
#            "annotator2": "",
#            "annotator3": "",
#            "finalLabel": "",
#            "status": "pending"
#        })
#
#        updated += 1
#        print(f"✓ Updated {doc_id}")
#
#    else:
#        print(f"✗ {doc_id} not found")
#
#print(f"\nDone! Updated {updated} documents.")


import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

print("Collections:\n")

for collection in db.collections():
    print(collection.id)
