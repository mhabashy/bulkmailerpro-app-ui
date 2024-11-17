import { Loader } from "@mantine/core";
import { userStore } from "../../store/userStore";
import { useEffect, useState } from "react";

export const OrgUserColumn = ({ userId, children, showActions = false }: {userId: string, children: React.ReactNode, showActions: boolean}) => {
    const getUser = userStore((state: any) => state.getUser);
    const [userData, setUserData] = useState({} as any);
    const [isLoading, setIsLoading] = useState(true);

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
            <td>
                {showActions && children}
            </td>
        </tr>
    );
};