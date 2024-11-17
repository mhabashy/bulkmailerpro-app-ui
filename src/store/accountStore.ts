import create from 'zustand';
import { getFirestore, getDoc, doc, updateDoc, getDocs, collection, addDoc, deleteDoc } from "firebase/firestore";
import { firebaseApp } from '../config';
import { IAccount } from '../modals/accounts.modals';
import { showNotification } from '@mantine/notifications';

export const accountStore = create((set, get: any) => ({
    accessToken: localStorage.getItem('accessToken'),
    uid: localStorage.getItem('defaultOrgUID'),
    accounts: [],
    account: {} as IAccount,
    isLoading: true,
    isDeleting: false,
    isUpdating: false,
    createAccount: async (account: IAccount) => {
        const db = getFirestore(firebaseApp);
        account.userUID = localStorage.getItem('defaultOrgUID') as string;
        const docRef = doc(db, "organizations", localStorage.getItem('defaultOrgUID') as string);
        const docs = collection(docRef, "accounts");
        const accounts = await getDocs(docs);
        if (accounts.docs.length == 0) {
            account.default = true;
        } else {
            account.default = false;
        }
        const createAccount = await addDoc(docs, account);
        showNotification({
            message: "Account created successfully",
            typeof: "success",
        });
        get().getAccounts();
        return createAccount.id;
    },
    getAccounts: async () => {
        set((state: any) => ({ ...state, isLoading: true }));
        const db = getFirestore(firebaseApp);
        const docRef = doc(db, "organizations", localStorage.getItem('defaultOrgUID') as string);
        const docs = collection(docRef, "accounts");
        const accounts = await getDocs(docs);
        const a = accounts.docs.map((doc) => {
                return {
                    ...doc.data(),
                    id: doc.id
                };
            });
        set((state: any) => ({
            ...state,
            accounts: a,
            isLoading: false
        }));
        return a;
    },
    getAccount: async (id: string) => {
        set((state: any) => ({ ...state, isLoading: true }));
        const db = getFirestore(firebaseApp);
        const docRef = doc(db, "organizations", localStorage.getItem('defaultOrgUID') as string, "accounts", id);
        const account = await getDoc(docRef);
        set((state: any) => ({ ...state, account: { ...account.data(), id: account.id},  isLoading: false }));
    },
    updateAccount: async (account: IAccount) => {
        set((state: any) => ({ ...state, isUpdating: true }));
        const db = getFirestore(firebaseApp);
        const docRef = doc(db, "organizations", localStorage.getItem('defaultOrgUID') as string, "accounts", account.id);
        if (account.default) {
            const docs = collection(db, "organizations", localStorage.getItem('defaultOrgUID') as string, "accounts");
            const accounts = await getDocs(docs);
            accounts.docs.forEach(async (doc) => {
                await updateDoc(doc.ref, { default: false });
            });
        }
        const updateAccount = await updateDoc(docRef, {...account});
        await get().getAccounts();
        set((state: any) => ({ ...state, isUpdating: false }));
        return updateAccount;
    },
    setToDefault: async (id: string) => {
        set((state: any) => ({ ...state, isLoading: true }));
        const db = getFirestore(firebaseApp);
        const docRef = doc(db, "organizations", localStorage.getItem('defaultOrgUID') as string, "accounts", id);
        const docs = collection(db, "organizations", localStorage.getItem('defaultOrgUID') as string, "accounts");
        const accounts = await getDocs(docs);
        accounts.docs.forEach(async (doc) => {
            await updateDoc(doc.ref, { default: false });
        });
        await updateDoc(docRef, { default: true });
        showNotification({
            message: "Account updated!",
            typeof: "success"
        });
        get().getAccounts();
    },
    deleteAccount: async (account: IAccount) => {
        set((state: any) => ({ ...state, isDeleting: true }));
        const db = getFirestore(firebaseApp);
        const docRef = doc(db, "organizations", localStorage.getItem('defaultOrgUID') as string, "accounts", account.id);
        const deleteAccount = await deleteDoc(docRef);
        if (account.default) {
            const docs = collection(db, "organizations", localStorage.getItem('defaultOrgUID') as string, "accounts");
            const accounts = await getDocs(docs);
            if (accounts.docs.length > 0) {
                const account = accounts.docs[0];
                await updateDoc(account.ref, { default: true });
            }
        }
        await get().getAccounts();
        showNotification({
            message: "Account deleted!",
            typeof: "success"
        });
        set((state: any) => ({ ...state, isDeleting: false }));
        return deleteAccount;
    }
}));
