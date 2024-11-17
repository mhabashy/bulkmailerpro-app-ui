import { useEffect, useState } from "react";
import { userStore } from "../../store/userStore";
import { Loader } from "@mantine/core";

export const OrgListUser = ({ userId, children, hasAction = false }: { userId: string, children: React.ReactNode, hasAction: boolean }) => {
    const getUser = userStore((state: any) => state.getUser);
    const [userData, setUserData] = useState({} as any);
    const [isLoading, setIsLoading] = useState(true);
    const uid = userStore((state: any) => state.uid);

    useEffect(() => {
        setIsLoading(true);
        const fetchData = async () => {
            const data = await getUser(userId);
            setUserData(data);
            setIsLoading(false);
        };
        fetchData();
    }, [userId]);

    if (isLoading) {
        return <Loader />;
    }

    return (
        <tr key={userData.uid}>
            <td>{userData.displayName}</td>
            <td>{userData.email}</td>
            <td>{(hasAction && userId !== uid) && children}</td>
        </tr>
    );
};