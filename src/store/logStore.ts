import { collection, doc, getDocs, getFirestore } from "firebase/firestore";
import { create } from "zustand";
import { firebaseApp } from "../config";
import { orderBy } from "lodash";

export const logStore = create((set, get: any) => ({
    isLoading: true,
    logs: [],
    getLogs: async () => {
      set({ isLoading: true });
      const orgId = localStorage.getItem("defaultOrgUID");
      const db = getFirestore(firebaseApp);
      const docRef = doc(db, "organizations", orgId as string);
      const docs = collection(docRef, "emails");
      const data = await getDocs(docs);
      const logs = data.docs.map((doc: any) => {
        return {
          ...doc.data(),
          id: doc.id,
        };
      });
      set({ logs: logs, isLoading: false });
    },
  }));
  
  