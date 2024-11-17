
import { showNotification } from "@mantine/notifications";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  updateDoc,
  OrderByDirection,
  orderBy,
  query,
  limit,
  startAfter,
  where,
} from "firebase/firestore";
import _ from "lodash";
import create from "zustand";
import { firebaseApp } from "../config";
import { IGroup, IMember } from "../modals/groups.modals";
import { getFullName } from "../groups/group-utilities";
import { getHeaderJson } from "../untils/http.untils";
import { getStorage, ref, getDownloadURL } from "firebase/storage";


export const groupStore = create((set, get: any) => ({
  uid: localStorage.getItem("defaultOrgUID"), // going to skip uid here
  groups: [] as IGroup[],
  group: {} as IGroup,
  isLoading: true,
  isMemberLoading: false,
  members: [] as IMember[],
  sortBy: "email",
  sortDirection: 'asc' as OrderByDirection,
  limit: 100,
  offset: 0,
  isSearch: false,
  isDeleting: false,
  isExporting: false,
  errorMessage: null,
  createGroup: async (g: IGroup) => {
    const db = getFirestore(firebaseApp);
    const docRef = doc(db, "organizations", localStorage.getItem("defaultOrgUID") as string);
    const docs = collection(docRef, "groups");
    set((state: any) => ({ ...state, isLoading: true, members: [] }));
    const createGroup = await addDoc(docs, g);
    showNotification({
      message: "Group created successfully",
      typeof: "success",
    });
    get().getGroups();
    get().getGroup(createGroup.id);
    // set((state: any) => ({ ...state, isLoading: false}));
    return createGroup.id;
  },
  getGroups: async () => {
    set((state: any) => ({ ...state, isLoading: true }));
    const db = getFirestore(firebaseApp);
    const docRef = doc(db, "organizations", localStorage.getItem("defaultOrgUID") as string);
    const docs = collection(docRef, "groups");
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
    set((state: any) => ({
      ...state,
      groups: g,
      isLoading: false,
      members: _.cloneDeep([]),
    }));
    return g;
  },
  setGroupTotals: async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_FUNCTIONS_BACKEND}/api/v1/group/${localStorage.getItem("defaultOrgUID") as string}/${get().group.id}/`,
        {
          method: "GET",
          headers: await getHeaderJson(),
        }
      );
      if (res.ok) {
        const group = get().group;
        const r = await res.json();
        group.totalMembers = r.totalMembers;
        set((state: any) => ({
          ...state,
          group: {
            ...group,
            totalMembers: r.totalMembers,
          },
        }));
      }
    } catch (e) {
      console.error(e);
    }
  },
  getGroup: async (gUid: string) => {
    set((state: any) => ({ ...state, isLoading: true }));
    const db = getFirestore(firebaseApp);
    const docRef = doc(db, "organizations", localStorage.getItem("defaultOrgUID") as string, "groups", gUid);
    const group = await getDoc(docRef);
    set((state: any) => ({
      ...state,
      group: {
        ...group.data(),
        totalMembers: group.data()?.totalMembers ?? 0,
        id: group.id,
      },
      isLoading: false,
    }));
    return group;
  },
  updateGroup: async (id: any, g: IGroup) => {
    set((state: any) => ({ ...state, isUpdating: true }));
    const db = getFirestore(firebaseApp);
    const docRef = doc(db, "organizations", localStorage.getItem("defaultOrgUID") as string, "groups", id);
    await updateDoc(docRef, {
      name: g.name,
      description: g.description,
      default: g.default,
    });
    showNotification({
      message: "Group updated successfully",
      typeof: "success",
    });
    get().getGroup(id);
    return true;
  },
  setToDefault: async (id: any, value: boolean) => {
    const db = getFirestore(firebaseApp);
    const docRef = doc(db, "organizations", localStorage.getItem("defaultOrgUID") as string, "groups", id);
    await updateDoc(docRef, {
      default: value,
    });
    showNotification({
      message: "Group updated successfully",
      typeof: "success",
    });
    get().getGroups();
  },
  deleteGroup: async (id: any) => {
    set((state: any) => ({ ...state, isDeleting: true }));
    const db = getFirestore(firebaseApp);
    const docRef = doc(db, "organizations", localStorage.getItem("defaultOrgUID") as string, "groups", id);
    const members  = await getDocs(collection(docRef, "members"));
    await Promise.all(members.docs.map(async (doc) => { await deleteDoc(doc.ref); }));
    const deleteAccount = await deleteDoc(docRef);
    showNotification({
      message: "Group deleted successfully",
      typeof: "success",
    });
    get().getGroups();
    set((state: any) => ({ ...state, isDeleting: false }));
    return deleteAccount;
  },
  getMembers: async (loadMore = false) => {
    const db = getFirestore(firebaseApp);
    const docRef = doc(db, "organizations", localStorage.getItem("defaultOrgUID") as string, "groups", get().group.id);
    const docs = collection(docRef, "members");
    let members;
    if (loadMore) {
      const lastSnap = await getDoc(doc(db, "organizations", localStorage.getItem("defaultOrgUID") as string, "groups", get().group.id, "members", get().members[get().members.length - 1].id));
      members = await getDocs(
        query(docs, orderBy(get().sortBy, get().sortDirection), startAfter(lastSnap), limit(get().limit))
      );
      const m = members.docs.map((doc) => {
        return {
          ...doc.data(),
          fullName: `${doc.data().firstName} ${doc.data().lastName}`,
          id: doc.id,
        };
      });
      set((state: any) => ({
        ...state,
        members: get().members.concat(m),
        isMemberLoading: false,
      }));
    } else {
      set((state: any) => ({ ...state, isMemberLoading: true }));
      members = await getDocs(
        query(docs, orderBy(get().sortBy, get().sortDirection), limit(get().limit))
      );
      const m = members.docs.map((doc) => {
        return {
          ...doc.data(),
          fullName: `${doc.data().firstName} ${doc.data().lastName}`,
          id: doc.id,
        };
      });
      set((state: any) => ({
        ...state,
        members: m,
        isMemberLoading: false,
      }));
    }
  },
  searchMembers: async (value: string) => {
    if (value && value.length > 2) {
        set((state: any) => ({ ...state, isMemberLoading: true, isSearch: true }));
        const db = getFirestore(firebaseApp);
        const docRef = doc(db, "organizations", localStorage.getItem("defaultOrgUID") as string, "groups", get().group.id);
        const docs = collection(docRef, "members");
        const members = await getDocs(
          query(docs, orderBy("searchText"),
          where('searchText', 'array-contains',  value.trim().toLowerCase()),
        )
        );
        const m = members.docs.map((doc) => {
            return {
              ...doc.data(),
              fullName: `${doc.data().firstName} ${doc.data().lastName}`,
              id: doc.id,
            };
        });
        set((state: any) => ({
            ...state,
            members: m,
            isMemberLoading: false,
        }));
        return m;
    } else {
        set((state: any) => ({ ...state, isSearch: false }));
        get().getMembers();
    }
  },
  addMember: async (id: any, member: any) => {
    set((state: any) => ({ ...state, isMemberLoading: true }));
    const db = getFirestore(firebaseApp);
    const docRef = doc(db, "organizations", localStorage.getItem("defaultOrgUID") as string, "groups", get().group.id);
    const docs = collection(docRef, "members");
    member.searchText = [member.firstName, member.lastName, member.email, member.specialIdentifier].map((item: string) => item.toLowerCase());
    member.firstName = _.upperFirst(_.lowerCase(member.firstName));
    member.middleName = _.upperFirst(_.lowerCase(member.middleName));
    member.lastName = _.upperFirst(_.lowerCase(member.lastName));
    member.email = (member.email).toLowerCase();
    member.fullName = getFullName(member.firstName, member.middleName, member.lastName);
    member.subscribed = true;
    const createMember = await addDoc(docs, member);
    showNotification({
      message: "Member added successfully",
      typeof: "success",
    });
    await get().setGroupTotals();
    if (get().isSearch) {
      get().searchMembers();
    } else {
      get().getMembers();
    }
    return createMember.id;
  },
  deleteMember: async (memberId: any) => {
    set((state: any) => ({ ...state, isMemberLoading: true }));
    const db = getFirestore(firebaseApp);
    const docRef = doc(
      db,
      "organizations",
      localStorage.getItem("defaultOrgUID") as string,
      "groups",
      get().group.id,
      "members",
      memberId
    );
    const deleteMember = await deleteDoc(docRef);
    showNotification({
      message: "Member deleted successfully",
      typeof: "success",
    });
    if (get().isSearch) {
      get().searchMembers();
    } else {
      get().getMembers();
    }
    await get().setGroupTotals();
    return deleteMember;
  },
  updateMember: async (memberId: any, member: any) => {
    const db = getFirestore(firebaseApp);
    const docRef = doc(
      db,
      "organizations",
      localStorage.getItem("defaultOrgUID") as string,
      "groups",
      get().group.id,
      "members",
      memberId
    );
    await updateDoc(docRef, {
      firstName: _.upperFirst(_.lowerCase(member.firstName)),
      middleName: !_.identity(member.middleName) ? _.upperFirst(_.lowerCase(member.middleName)) : null,
      lastName: _.upperFirst(_.lowerCase(member.lastName)),
      fullName: getFullName(member.firstName, member.middleName, member.lastName),
      email: (member.email).toLowerCase(),
      specialIdentifier: member.specialIdentifier ?? null,
      subscribed: member.subscribed ?? true,
      searchText: [member.firstName, member.lastName, member.email, member.specialIdentifier].map((item: string) =>  typeof item === 'string' ? item.toLowerCase() : "").filter((item: string) => item !== ""),
    });
    showNotification({
      message: "Member updated successfully",
      typeof: "success",
    });
    get().getMembers();
    return true;
  },
  addMembersToGroupByExcel: async (formData: BodyInit, groupId: string) => {
    set((state: any) => ({ ...state, isExporting: false, isMemberLoading: true }));
    const res = await fetch(
      `${import.meta.env.VITE_FUNCTIONS_BACKEND}/api/v1/tables/`,
      {
        method: "POST",
        body: JSON.stringify(formData),
        headers: await getHeaderJson(),
      }
    );
    const data = await res.json();
    if (res.ok) {
      await get().setGroupTotals();
      get().getMembers();
      return true;
    } else {
      set((state: any) => ({ ...state, errorMessage: data.message, isExporting: false, isMemberLoading: false }));
      return false;
    }
  },
  exportMembersFromGroupByExcel: async (groupId: string) => {
    set((state: any) => ({ ...state, isExporting: true, isMemberLoading: true }));
    const res = await fetch(
      `${import.meta.env.VITE_FUNCTIONS_BACKEND}/api/v1/tables/exports`,
      {
        method: "POST",
        body: JSON.stringify({ groupId, organizationId: localStorage.getItem("defaultOrgUID") as string }),
        headers: await getHeaderJson(),
      }
    );
    const data = await res.json();
    set((state: any) => ({ ...state, isExporting: false }));
    if (res.ok) {
      const filePath = data.file;
      const storage = getStorage(firebaseApp, import.meta.env.VITE_STORAGE_BUCKET_TEMP);
      const storageRef = ref(storage, filePath);
      const url = await getDownloadURL(storageRef);
      // console.log(url);
      // const xhr = new XMLHttpRequest();
      // // xhr.responseType = 'blob';
      // xhr.onload = (event) => {
      //   const blob = xhr.response;
      // };
      // xhr.open('GET', url);
      //@ts-ignore
      window.open(url, '_blank');

      // // Fetch the file as a blob
      // const response = await fetch(url);
      // const blob = await response.blob();

      // // Create a new file with the desired name
      // const extension = url.split('.').pop();
      // const newFileName = `download_${groupId}.${extension}`; // Replace with your desired file name and extension
      // const newFile = new File([blob], newFileName, { type: blob.type });

      // // Create a URL for the new file
      // const newFileUrl = URL.createObjectURL(newFile);

      // Open the new file URL in a new tab
      //@ts-ignore

      set((state: any) => ({ ...state, isMemberLoading: false }));
      // xhr.send();
      //TODO - check if works on server side have issues on localhost
      return true;
    } else {
      set((state: any) => ({ ...state, errorMessage: data.message, isExporting: false, isMemberLoading: false }));
      return false;
    }
  }

}));