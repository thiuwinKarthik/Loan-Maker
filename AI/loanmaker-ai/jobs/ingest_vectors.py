import os
import mysql.connector
from pathlib import Path

from rag.embeddings import EmbeddingClient
from rag.vector_store import VectorStore
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "loan_maker"),
        port=int(os.getenv("DB_PORT", "3306"))
    )

def fetch_dynamic_documents() -> list[dict]:
    documents = []
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # 1. Fetch Loan Providers
        try:
            cursor.execute("SELECT id, bank_name, interest_rate, max_amount, min_credit_score, loan_type FROM loan_providers")
            providers = cursor.fetchall()
            for p in providers:
                text = f"{p['bank_name']} offers {p['loan_type']} loans up to ${p['max_amount']}. They charge an interest rate of {p['interest_rate']}% and require a minimum credit score of {p['min_credit_score']}."
                documents.append({
                    "document_id": f"provider-{p['id']}",
                    "collection": "provider_terms_index",
                    "text": text,
                    "user_id": -1, # Using -1 to denote global system policies
                    "document_type": "provider_terms",
                    "risk_level": "medium",
                })
        except Exception as e:
            print(f"Failed to fetch providers: {e}")

        # 2. Fetch Recent Loan Applications
        try:
            cursor.execute("SELECT id, user_id, loan_amount, tenure, status FROM loan_applications")
            loans = cursor.fetchall()
            for l in loans:
                decision = "was APPROVED." if l['status'].upper() == "APPROVED" else (
                    "was REJECTED." if l['status'].upper() == "REJECTED" else "is PENDING."
                )
                text = f"Historical Context: Evaluating past loans, a request for ${l['loan_amount']} spread over {l['tenure']} months {decision}"
                documents.append({
                    "document_id": f"loan-{l['id']}",
                    "collection": "loan_policy_index", 
                    "text": text,
                    "user_id": l['user_id'],
                    "document_type": "historical_loan",
                    "risk_level": "high" if l['status'].upper() == "REJECTED" else "low",
                })
        except Exception as e:
            print(f"Failed to fetch loans: {e}")
            
    except Exception as e:
        print(f"Error fetching DB records: {e}. Is MySQL running?")
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()
        
    return documents

def main() -> None:
    vector_store = VectorStore()
    vector_store.ensure_collections()
    embedding_client = EmbeddingClient()
    
    documents = fetch_dynamic_documents()
    if not documents:
        print("No documents were fetched. Check MySQL configuration and data.")
        # Proceed with empty vectors logic maybe, but safely exit is better
        return

    grouped: dict[str, list[dict]] = {}
    for doc in documents:
        grouped.setdefault(doc["collection"], []).append(doc)

    for collection, docs in grouped.items():
        texts = [d["text"] for d in docs]
        vectors = embedding_client.embed_documents(texts)
        payloads = [
            {
                "document_id": d["document_id"],
                "text": d["text"],
                "user_id": d["user_id"],
                "document_type": d["document_type"],
                "risk_level": d["risk_level"],
            }
            for d in docs
        ]
        vector_store.upsert_documents(collection, vectors, payloads)
        
    print(f"RAG dynamic DB ingestion completed successfully: {len(documents)} records embedded.")

if __name__ == "__main__":
    main()
