import { showNotification } from "@mantine/notifications";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, updateDoc } from "firebase/firestore";
import create from "zustand";
import { firebaseApp } from "../config";
import { ITemplate } from "../modals/template.modals";

export const templateStore = create((set, get: any) => ({
  isLoading: false,
  templates: [],
  template: {},
  uid: localStorage.getItem("defaultOrgUID"),
  createTemplate: async (template: ITemplate) => {
    const db = getFirestore(firebaseApp);
    template.userUID = localStorage.getItem("defaultOrgUID") as string;
    const docRef = doc(db, "organizations", localStorage.getItem("defaultOrgUID") as string);
    const docs = collection(docRef, "templates");
    const templates = await getDocs(docs);
    if (templates.docs.length == 0) {
      template.default = true;
    } else {
      template.default = false;
    }
    const createTemplate = await addDoc(docs, template);
    showNotification({
      message: "Template created successfully",
      typeof: "success",
    });
    get().getTemplates();
    return createTemplate.id;
  },
  getTemplates: async () => {
    set((state: any) => ({ ...state, isLoading: true }));
    const db = getFirestore(firebaseApp);
    const docRef = doc(db, "organizations", localStorage.getItem("defaultOrgUID") as string);
    const docs = collection(docRef, "templates");
    const templates = await getDocs(docs);
    const a = templates.docs.map((doc) => {
      return {
        ...doc.data(),
        id: doc.id,
      };
    });
    set((state: any) => ({
      ...state,
      templates: a,
      isLoading: false,
    }));
    return a;
  },
  getTemplate: async (id: string) => {
    set((state: any) => ({ ...state, isLoading: true }));
    const db = getFirestore(firebaseApp);
    const docRef = doc(db, "organizations", localStorage.getItem("defaultOrgUID") as string, "templates", id);
    const template = await getDoc(docRef);
    set((state: any) => ({
      ...state,
      template: { ...template.data(), id: template.id },
      isLoading: false,
    }));
   },
   updateTemplate: async (id: string, template: ITemplate) => {
    set((state: any) => ({ ...state, isLoading: true }));
    const db = getFirestore(firebaseApp);
    const docRef = doc(db, "organizations", localStorage.getItem("defaultOrgUID") as string, "templates", id);
    if (template.default) {
      const docs = collection(db, "organizations", localStorage.getItem("defaultOrgUID") as string, "templates");
      const templates = await getDocs(docs);
      templates.docs.forEach(async (doc) => {
        await updateDoc(doc.ref, { default: false });
      });
    }
    await updateDoc(docRef, {...template});
    showNotification({
      message: "Template updated successfully",
      typeof: "success",
    });
    await get().getTemplates();
    set((state: any) => ({ ...state, isLoading: false }));
    return true;
   },
  setToDefault: async (id: string) => {
  set((state: any) => ({ ...state, isLoading: true }));
  const db = getFirestore(firebaseApp);
  const docRef = doc(db, "organizations", localStorage.getItem("defaultOrgUID") as string, "templates", id);
  const template = await getDoc(docRef);
  const updateTemplate = await updateDoc(docRef, {...template.data(), default: true});
  showNotification({
    message: "Template updated successfully",
    typeof: "success",
  });
  await get().getTemplates();
  set((state: any) => ({ ...state, isLoading: false }));
  return updateTemplate;
  },
  // setDefaultTemplate: async (templateId: string) => {
  //   set((state: any) => ({ ...state, isLoading: true }));
  //   const db = getFirestore(firebaseApp);
  //   const docRef = doc(db, "organizations", localStorage.getItem("defaultOrgUID") as string, "templates", templateId);
  //   const template = await getDoc(docRef);
  //   const docs = collection(db, "organizations", localStorage.getItem("defaultOrgUID") as string, "templates");
  //   const templates = await getDocs(docs);
  //   for (let i = 0; i < templates.docs.length; i++) {
  //     await updateDoc(templates.docs[i].ref, { default: false });
  //   }
  //   const updateTemplate = await updateDoc(docRef, {...template.data(), default: true});
  //   showNotification({
  //     message: "Template updated successfully",
  //     typeof: "success",
  //   });
  //   await get().getTemplates();
  //   set((state: any) => ({ ...state, isLoading: false }));
  //   return updateTemplate;
  // },
  deleteTemplate: async (template: ITemplate) => {
      set((state: any) => ({ ...state, isLoading: true }));
      const db = getFirestore(firebaseApp);
      const docRef = doc(db, "organizations", localStorage.getItem("defaultOrgUID") as string, "templates", template.id);
      const deleteTemplate = await deleteDoc(docRef);
      if (template.default) {
          const docRef = doc(db, "organizations", localStorage.getItem("defaultOrgUID") as string, "templates", get().templates[0].id);
          const templates = await getDocs(collection(docRef, "templates"));
          if (templates.docs.length > 0) {
              const template = templates.docs[0];
              await updateDoc(template.ref, {
                default: true,
              });
          }
      }
      await get().getTemplates();
      showNotification({
          message: "Template deleted successfully",
          typeof: "success",
      });
      set((state: any) => ({ ...state, isLoading: false }));
      return deleteTemplate;
  },
}));

