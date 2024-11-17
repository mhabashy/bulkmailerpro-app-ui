import { Timestamp, addDoc, collection, doc, getDocs, getFirestore } from "firebase/firestore";
import { firebaseApp } from '../config';
import { create } from "zustand";
import { IMember } from "../modals/groups.modals";
import _ from "lodash";
import { IEmailPayload } from "../bulkmailer/bulkmailer-interfaces";
import { getHeaderJson } from "../untils/http.untils";
import { michaelHabashyUser, testAmazonUser } from "./dumpData";

const BREAKPOINT_PRE_QUEUE = 10;

function breakListIntoChunks(list: any[], n: number) {
    const result = [];
    for (let i = 0; i < list.length; i += n) {
        result.push(list.slice(i, i + n));
    }
    return result;
}

export const mailerStore = create((set, get: any) => ({
    accessToken: localStorage.getItem('accessToken'),
    uid: localStorage.getItem('defaultOrgUID'),
    isLoading: true,
    accounts: [],
    groups: [],
    templates: [],
    recipients: [],
    recipientLoading: false,
    loadingIntoQueueTotal: 0,
    currentLoadedIntoQueue: 0,
    loadingError: 0,
    totalRecipientQueued: 0,
    totalRecipientErroredOut: 0,
    reciepientErroredOut: [],
    getAccountsGroupsTemplates: async () => {
        set((state: any) => ({ ...state, isLoading: true }));
        const db = getFirestore(firebaseApp);
        let docRef = doc(db, "organizations", localStorage.getItem('defaultOrgUID') as string);
        let docs = collection(docRef, "accounts");
        const accounts = await getDocs(docs);
        const a = accounts.docs.map((doc) => {
                return {
                    ...doc.data(),
                    id: doc.id
                };
            });
            
        docRef = doc(db, "organizations", localStorage.getItem('defaultOrgUID') as string);
        docs = collection(docRef, "groups");
        const groups = await getDocs(
        docs
        );
        let g = groups.docs.map((doc) => {
        return {
            ...doc.data(),
            id: doc.id,
        };
        });
        g = _.sortBy(g, "name");
        docRef = doc(db, "organizations", localStorage.getItem('defaultOrgUID') as string);
        docs = collection(docRef, "templates");
        const templates = await getDocs(docs);
        const t = templates.docs.map((doc) => {
        return {
            ...doc.data(),
            id: doc.id,
        };
        });
        set((state: any) => ({
            ...state,
            accounts: a,
            templates: t,
            groups: g,
            isLoading: false
        }));
        return a;
    },
    getRecipients: async (groupIds: string[]) => {
        const r = [] as IMember[];
        const db = getFirestore(firebaseApp);
        const docRef = doc(db, "organizations", localStorage.getItem('defaultOrgUID') as string);
        set((state: any) => ({ ...state, recipientLoading: true }));
        for (const groupId of groupIds) {
            const docs = collection(docRef, "groups", groupId, "members");
            const members = await getDocs(docs);
            const m = members.docs.map((doc) => {
                return {
                    checked: true,
                    fullName: '', // Add fullName property
                    email: '', // Add email property
                    firstName: '', // Add firstName property
                    middleName: '', // Add middleName property
                    lastName: '', // Add lastName property
                    specialIdentifier: '', // Add specialIdentifier property
                    searchText: '', // Add searchText property
                    ...doc.data(),
                    id: doc.id,
                };
            });
            // @ts-ignore
            r.push(...m);
        }
        let uniqueEmails = import.meta.env.VITE_DEV_MODE === "true" ? r : _.uniqBy(r, "email"); 
        uniqueEmails = uniqueEmails.filter((x: any) => x.subscribed);
        // sort by fullName
        uniqueEmails.sort((a, b) => {
            if (a.fullName < b.fullName) {
                return -1;
            }
            if (a.fullName > b.fullName) {
                return 1;
            }
            return 0;
        });
        set((state: any) => ({
            ...state,
            recipientLoading: false,
            recipients: uniqueEmails,
        }));
        return uniqueEmails;
    },
    changeChecked: (id: string, checkedValue: boolean) => {
        const r = get().recipients;
        const index = r.findIndex((x: any) => x.id === id);
        r[index].checked = checkedValue;
        set((state: any) => ({
            ...state,
            recipients: _.cloneDeep(r),
        }));
    },
    getSelectedRecipients: () => {
        const r = get().recipients;
        return r.filter((x: any) => x.checked).map((x: any) => {
            return {
                fullName: x.fullName,
                email: x.email,
                specialIdentifier: x.specialIdentifier ?? '',
                firstName: x.firstName ?? '',
                lastName: x.lastName ?? '',
            };
        });
    },
    createEmail: async (orgId: string) => {
        const db = getFirestore(firebaseApp);
        const docRef = doc(db, "organizations", orgId);
        const docs = collection(docRef, "mailer");
        const emails = {
            totalSent: 0,
            totalQueueCompleted: 0,
            totalQueues: 0,
            createTime: Timestamp.now(),
        };
        const createEmail = await addDoc(docs, emails);
        // const createTask = await fetch(`${import.meta.env.VITE_FUNCTIONS_BACKEND}/api/v1/mailer/create-delete-task/${localStorage.getItem('defaultOrgUID')}/${createEmail.id}/`, { // This moved
        //     method: "POST",
        //     headers: await getHeaderJson()
        // });
        return createEmail.id;
    },
    deleteEmail: async (mailerId: string) => {
        const res = await fetch(`${import.meta.env.VITE_FUNCTIONS_BACKEND}/api/v1/mailer/${localStorage.getItem('defaultOrgUID')}/${mailerId}/`, {
            method: "DELETE",
            headers: await getHeaderJson()
        });
        if (res.ok) {
            return true;
        }
        return false;
    },
    submitMessage: async (payload: IEmailPayload) => {
        let chunkedRecipients = [];
        if (import.meta.env.VITE_DEV_MODE === "true") {
            const totalRecipients = get().recipients.length;
            const fakeAccounts = _.range(0, totalRecipients - 1).map((_) => testAmazonUser);
            chunkedRecipients = breakListIntoChunks([michaelHabashyUser, ...fakeAccounts], BREAKPOINT_PRE_QUEUE);
        } else {
            chunkedRecipients = breakListIntoChunks(get().getSelectedRecipients(), BREAKPOINT_PRE_QUEUE);
        }
        set((state: any) => ({
            ...state,
            loadingIntoQueueTotal: chunkedRecipients.length,
            currentLoadedIntoQueue: 0,
            loadingError: 0,
            totalRecipientQueued: 0,
            totalRecipientErroredOut: 0,
            reciepientErroredOut: [],
        }));
        const orgId = localStorage.getItem('defaultOrgUID') as string;
        const emailId = await get().createEmail(orgId);
        let sendPayload = _.cloneDeep(payload);
        for (const chunk of chunkedRecipients) {
            sendPayload.to = _.cloneDeep(chunk);
            const res = await fetch(
                `${import.meta.env.VITE_FUNCTIONS_BACKEND}/api/v1/mailer/create/${orgId}/${emailId}/`,
                {
                    method: "POST",
                    headers: await getHeaderJson(),
                    body: JSON.stringify(sendPayload),
                }
            );
            if (res.ok) {
                set((state: any) => ({
                    ...state,
                    currentLoadedIntoQueue: state.currentLoadedIntoQueue + 1,
                    totalRecipientQueued: state.totalRecipientQueued + chunk.length,
                }));
            } else {
                set((state: any) => ({
                    ...state,
                    loadingError: state.loadingError + 1,
                    totalRecipientErroredOut: state.totalRecipientErroredOut + chunk.length,
                    reciepientErroredOut: _.concat(state.reciepientErroredOut, chunk),
                }));
            }
        }
    },
    addRecipient: (member: IMember) => {
        const r = get().recipients;
        r.push(member);
        // sort by fullName
        r.sort((a: IMember, b: IMember) => {
            if (a.fullName < b.fullName) {
                return -1;
            }
            if (a.fullName > b.fullName) {
                return 1;
            }
            return 0;
        });
        set((state: any) => ({
            ...state,
            recipients: _.cloneDeep(r),
        }));
    },
}));