import type { DocumentType } from "./types";

const STORAGE_KEY = "markdown-pdf-documents";

// Initialize IndexedDB
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("MarkdownPDFDB", 1);

    request.onerror = (event) => {
      reject("IndexedDB error");
    };

    request.onsuccess = (event) => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains("documents")) {
        const store = db.createObjectStore("documents", { keyPath: "id" });
        store.createIndex("updatedAt", "updatedAt", { unique: false });
      }
    };
  });
};

// Save document to IndexedDB
export const saveDocument = async (document: DocumentType): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["documents"], "readwrite");
      const store = transaction.objectStore("documents");
      const request = store.put(document);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error saving document to IndexedDB:", error);
    // Fallback to localStorage
    const documents = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const index = documents.findIndex((doc: DocumentType) => doc.id === document.id);

    if (index !== -1) {
      documents[index] = document;
    } else {
      documents.push(document);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
  }
};

// Get all documents from IndexedDB
export const getDocuments = async (): Promise<DocumentType[]> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["documents"], "readonly");
      const store = transaction.objectStore("documents");
      const index = store.index("updatedAt");
      const request = index.openCursor(null, "prev"); // Sort by updatedAt in descending order

      const documents: DocumentType[] = [];

      request.onsuccess = (event) => {
        const cursor = request.result;
        if (cursor) {
          documents.push(cursor.value);
          cursor.continue();
        } else {
          resolve(documents);
        }
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error getting documents from IndexedDB:", error);
    // Fallback to localStorage
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  }
};

// Get a single document by ID
export const getDocument = async (id: string): Promise<DocumentType | null> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["documents"], "readonly");
      const store = transaction.objectStore("documents");
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error getting document from IndexedDB:", error);
    // Fallback to localStorage
    const documents = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return documents.find((doc: DocumentType) => doc.id === id) || null;
  }
};

// Delete a document by ID
export const deleteDocument = async (id: string): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["documents"], "readwrite");
      const store = transaction.objectStore("documents");
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error deleting document from IndexedDB:", error);
    // Fallback to localStorage
    const documents = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const filteredDocuments = documents.filter((doc: DocumentType) => doc.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredDocuments));
  }
};
