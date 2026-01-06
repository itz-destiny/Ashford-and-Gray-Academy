
"use client";

import { useEffect, useState, useMemo } from 'react';
import { onSnapshot, collection, query, where, getDoc, doc, type Query, type DocumentData } from 'firebase/firestore';
import { useFirestore } from '../provider';

// A hook to read a collection from Firestore
export function useCollection<T>(q: Query | null) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const firestore = useFirestore();

  useEffect(() => {
    if (!q || !firestore) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      q,
      async (querySnapshot) => {
        const documents: T[] = [];
        const promises: Promise<void>[] = [];

        querySnapshot.forEach((docSnap) => {
          const docData = docSnap.data() as any;

          // Check for reference fields and fetch them
          const fieldPromises = Object.keys(docData).map(async (key) => {
            if (docData[key] && docData[key].path && typeof docData[key].path === 'string' && docData[key].path.includes('/')) {
                const ref = doc(firestore, docData[key].path);
                const relatedDoc = await getDoc(ref);
                if (relatedDoc.exists()) {
                    docData[key] = { id: relatedDoc.id, ...relatedDoc.data() };
                }
            } else if (key.endsWith('Id') && typeof docData[key] === 'string') {
              const collectionName = key.replace(/Id$/, 's'); // e.g., courseId -> courses
              try {
                const ref = doc(firestore, collectionName, docData[key]);
                const relatedDoc = await getDoc(ref);
                if (relatedDoc.exists()) {
                  docData[key.replace(/Id$/, '')] = { id: relatedDoc.id, ...relatedDoc.data() }
                }
              } catch (e) {
                // This can happen if the naming convention isn't perfect, just ignore.
              }
            }
          });

          promises.push(Promise.all(fieldPromises).then(() => {
            documents.push({ id: docSnap.id, ...docData } as T);
          }));

        });

        await Promise.all(promises);

        setData(documents);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [q, firestore]);

  return { data, loading, error };
}

