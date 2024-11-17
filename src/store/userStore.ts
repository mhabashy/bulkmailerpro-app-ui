import create from 'zustand';
import { getFirestore, getDoc, doc, updateDoc, Timestamp, setDoc, addDoc, collection, getDocs, where, query, deleteDoc, or } from "firebase/firestore";
import { firebaseApp } from '../config';
import { OrganizationStatus } from '../modals/user.models';
import { getHeaderJson } from '../untils/http.untils';
import { EmailAuthProvider, getAuth, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

export const userStore = create((set, get: any) => ({
    displayName: localStorage.getItem('displayName'),
    accessToken: localStorage.getItem('accessToken'),
    uid: localStorage.getItem('uid'),
    photoUrl: localStorage.getItem('photoUrl'),
    email: localStorage.getItem('email'),
    defaultOrgUID: localStorage.getItem('defaultOrgUID'),
    isLoading: false,
    isLoadingAddOrg: false,
    organizations: [],
    setSignUser: async (displayName: string, accessToken: string, uid: string, photoUrl: string, email: string) => {
        set((state: any) => ({
            ...state,
            accessToken,
            uid,
            photoUrl,
            email
        }));

        if (displayName) {
            set((state: any) => ({
                ...state,
                displayName
            }));
            localStorage.setItem('displayName', displayName);
        }
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('uid', uid);
        if (photoUrl) {
            localStorage.setItem('photoUrl', photoUrl);
        } else {
            localStorage.removeItem('photoUrl');
        }
        localStorage.setItem('email', email);
        const db = getFirestore(firebaseApp);
        const payload: any = {
            uid,
            photoUrl,
            email
        };
        const docRef = await getDoc(doc(db, "users", uid));
        if (docRef.exists()) {
            localStorage.setItem('displayName', docRef.data().displayName);
            const localOrgUID = localStorage.getItem('defaultOrgUID');
            let defaultOrgUID = localOrgUID ?? docRef.data().defaultOrgUID;
            if (!defaultOrgUID) {
                const docs = collection(db, "organizations");
                const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                const { id } = await addDoc(docs, {
                    'name': `${displayName}'s Organization`,
                    'users': [uid],
                    'admins': [uid],
                    'status': OrganizationStatus.TRIAL,
                    'createdAt': Timestamp.now(),
                    'language': navigator.language,
                    'timezone': timezone,
                });
                payload['defaultOrgUID'] = id;
                defaultOrgUID = id;
                payload['organizations'] = [id];
                localStorage.setItem('defaultOrgUID', id);
            } else {
                localStorage.setItem('defaultOrgUID', defaultOrgUID);
            }
            await updateDoc(docRef.ref, {
                ...payload,
                'lastUpdatedAt': Timestamp.now(),
            });
             set((state: any) => ({
                ...state,
                defaultOrgUID,
                displayName: docRef.data().displayName
            }));
        } else {
            const docs = collection(db, "organizations");
            const { id } = await addDoc(docs, {
                'name': `${displayName}'s Organization`,
                'users': [uid],
                'admins': [uid],
                'status': OrganizationStatus.TRIAL,
                'createdAt': Timestamp.now(),
            });
            localStorage.setItem('defaultOrgUID', id);
            await setDoc(doc(db, "users", uid), {
                ...payload,
                'displayName': displayName,
                'createdAt': Timestamp.now(),
                'updatedAt': Timestamp.now(),
                'status': OrganizationStatus.TRIAL,
                'defaultOrgUID': id,
                'organizations': [id],
            });
        }

        set((state: any) => ({
            ...state,
            isLoading: false
        }));

        return {
            'displayName': displayName || localStorage.getItem('displayName'),
        }

    },
    getOrgs: async (uid: string) => {
        const db = getFirestore(firebaseApp);
        const docRef = collection(db, "organizations");
        const orgs = await getDocs(query(docRef, where("users", "array-contains", uid)));
        const organizations =  orgs.docs.map((doc) => {
            return {
                ...doc.data(),
                id: doc.id,
            };
        });
        set((state: any) => ({
            ...state,
            organizations
        }));
        return organizations;
    },
    getOrg: async (orgUID: string) => {
        try {
            const db = getFirestore(firebaseApp);
            const docRef = await getDoc(doc(db, "organizations", orgUID));
            return docRef.data();
        } catch (e) {
            window.location.href = '/login';
            return null;
        }
    },
    buySubscription: async () => {
        const response = await fetch(`${import.meta.env.VITE_FUNCTIONS_BACKEND}/api/v1/payments/create-checkout-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                defaultOrgUID: localStorage.getItem('defaultOrgUID'),
                userEmail: localStorage.getItem('email'),
            }),
        });
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error.message);
        } 
        if (data.sessionUrl) {
            window.location.href = data.sessionUrl;
        }
    },
    cancelSubscription: async (subscriptionId: string) => {
        const response = await fetch(`${import.meta.env.VITE_FUNCTIONS_BACKEND}/api/v1/payments/cancel-subscription`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                subscriptionId,
            }),
        });
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error.message);
        }
    },
    signOutUser: async () => {
        set((state: any) => ({
            ...state,
            displayName: null,
            accessToken: null,
            uid: null,
            photoUrl: null,
            email: null,
            isLoading: false
        }));
        localStorage.removeItem('displayName');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('uid');
        localStorage.removeItem('photoUrl');
        localStorage.removeItem('email');
    },
    getUser: async (uid: string) => {
        const db = getFirestore(firebaseApp);
        const docRef = await getDoc(doc(db, "users", uid));
        return docRef.data();
    },
    inviteUserToOrg: async (orgUID: string, email: string) => {
        const res = await fetch(`${import.meta.env.VITE_FUNCTIONS_BACKEND}/api/v1/organization/invite-user`, {
            method: 'POST',
            headers: await getHeaderJson(),
            body: JSON.stringify({
                orgUID,
                email,
            }),
        });
        const data = await res.json();
        if (res.ok) {
            return data;
        } else {
            throw new Error(data.message);
        }
    },
    checkPendingId: async (pendingId: string, orgId: string) => {
        const db = getFirestore(firebaseApp);
        const docRef = await getDoc(doc(db, "pendingUsers", pendingId));
        if (docRef.exists()) {
            if (docRef.data().org === orgId) {
                return docRef.data();
            }
        }
        return false;
    },
    setCurrentOrg: async (orgUID: string) => {
        set((state: any) => ({
            ...state,
            defaultOrgUID: orgUID
        }));
        localStorage.setItem('defaultOrgUID', orgUID);
    },
    setIsLoading: (isLoading: boolean) => set((state: any) => ({ ...state, isLoading })),
    removePendingRecord: async (pendingUID: string) => {
        const db = getFirestore(firebaseApp);
        await deleteDoc(doc(db, "pendingUsers", pendingUID));
    },
    acceptInvite: async (pendingId: string, orgUID: string) => {
        const res = await fetch(`${import.meta.env.VITE_FUNCTIONS_BACKEND}/api/v1/organization/accept-invite`, {
            method: 'POST',
            headers: await getHeaderJson(),
            body: JSON.stringify({
                pendingId,
                orgUID,
            }),
        });
        localStorage.removeItem('pendingId');
        const data = await res.json();
        if (res.ok) {
            return data;
        } else {
            throw new Error(data.message);
        }
    },
    addOrganization: async (orgName: string) => {
        set((state: any) => ({
            ...state,
            isLoadingAddOrg: true
        }));
        const db = getFirestore(firebaseApp);
        const docs = collection(db, "organizations");
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const { id } = await addDoc(docs, {
            'name': orgName,
            'users': [get().uid],
            'admins': [get().uid],
            'status': OrganizationStatus.TRIAL,
            'createdAt': Timestamp.now(),
            'language': navigator.language,
            'timezone': timezone,
        });
        const userRef = doc(db, "users/" + get().uid!);
        const userDoc = await getDoc(userRef);

        await updateDoc(doc(db, "users/" + get().uid!), {
            'organizations': [...(userDoc.data()?.organizations || []), id],
        });
        set((state: any) => ({
            ...state,
            isLoadingAddOrg: false
        }));
        return id;
    },
    deleteOrganization: async (orgUID: string) => {
        const res = await fetch(`${import.meta.env.VITE_FUNCTIONS_BACKEND}/api/v1/organization/delete`, {
            method: 'DELETE',
            headers: await getHeaderJson(),
            body: JSON.stringify({
                orgUID,
            }),
        });
        if (res.ok) {
            localStorage.removeItem('defaultOrgUID');
            return true;
        } else {
            return false;
        }
    },
    makeAdmin: async (orgUID: string, userId: string) => {
        const db = getFirestore(firebaseApp);
        const orgDoc = await getDoc(doc(db, "organizations", orgUID));
        const orgData = orgDoc.data();
        if (!orgData) {
            return false;
        }
        if (orgData && orgData.admins.includes(userId)) {
            return false;
        }
        await updateDoc(doc(db, "organizations/" + orgUID), {
            'admins': [...orgData.admins, userId],
        });
        return true;
    },
    addUserToOrg: async (orgUID: string, userId: string) => {
        const db = getFirestore(firebaseApp);
        const orgDoc = await getDoc(doc(db, "organizations", orgUID));
        const orgData = orgDoc.data();
        if (!orgData) {
            return false;
        }
        if (orgData && orgData.users.includes(userId)) {
            return false;
        }
        await updateDoc(doc(db, "organizations/" + orgUID), {
            'users': [...orgData.users, userId],
        });
        return true;
    },
    removeAdminAndSetUser: async (orgUID: string, userId: string) => { 
        const db = getFirestore(firebaseApp);
        const orgDoc = await getDoc(doc(db, "organizations", orgUID));
        const orgData = orgDoc.data();
        if (!orgData) {
            return false;
        }
        const admins = orgData.admins.filter((admin: string) => admin !== userId);
        await updateDoc(doc(db, "organizations/" + orgUID), {
            'admins': admins,
        });
        return true;
    },
    deleteUser: async (userId: string) => {
        const db = getFirestore(firebaseApp);
        // const orgDoc = await getDoc(doc(db, "organizations", orgUID));
        // const orgData = orgDoc.data();
        // if (!orgData) {
        //     return false;
        // }
        const res = await fetch(`${import.meta.env.VITE_FUNCTIONS_BACKEND}/api/v1/organization/delete-user`, {
            method: 'DELETE',
            headers: await getHeaderJson(),
            body: JSON.stringify({
                uid: userId,
            }),
        });
        if (res.ok) {
            return true;
        }
        return false;
    },
    changeOrgName: async (orgUID: string, name: string) => {
        const db = getFirestore(firebaseApp);
        await updateDoc(doc(db, "organizations/" + orgUID), {
            'name': name,
        });
        get().getOrgs(get().uid);
        return true;
    },
    removeUserFromOrg: async (orgUID: string, userId: string) => {
        const db = getFirestore(firebaseApp);
        const orgDoc = await getDoc(doc(db, "organizations", orgUID));
        const orgData = orgDoc.data();
        if (!orgData) {
            return false;
        }
        const users = orgData.users.filter((user: string) => user !== userId);
        await updateDoc(doc(db, "organizations/" + orgUID), {
            'users': users,
        });
        return true;
    },
    changeUserPassword: async (oldPassword: string, password: string) => {
        // FIREBASE AUTH
        const user = getAuth().currentUser;
        const credential = EmailAuthProvider.credential(
            user?.email!,
            oldPassword
        );
        await reauthenticateWithCredential(user!, credential);
        await updatePassword(user!, password);
        return true;
    }
}));
