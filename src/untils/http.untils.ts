import { getAuth } from "firebase/auth";

export async function getHeaderJson() {
    const token = await getAuth().currentUser?.getIdToken();
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    }
}
