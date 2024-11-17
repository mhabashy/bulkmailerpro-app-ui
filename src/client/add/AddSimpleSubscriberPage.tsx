import { useParams } from "react-router-dom";
import SimpleSignUp from "./components/SimpleSignUp";
import { useEffect, useState } from "react";


export default function AddSimpleSubscriberPage() {
    const { orgId, groupId } = useParams();
    const [groupData, setGroupData] = useState<any>({});

    useEffect(() => {
        const fetchData = async () => {
            const groupCall = await fetch(`${import.meta.env.VITE_FUNCTIONS_BACKEND}/api/v1/signup/group/${orgId}/${groupId}`);
            setGroupData(await groupCall.json());
        }
        fetchData();
    }, [orgId, groupId]);

    if (!(groupData && groupData.id)) {
        return <div>Group not found</div>;
    }

    if (!orgId) {
        return <div>OrgId not found</div>;
    }

    if (!groupId) {
        return <div>GroupId not found</div>;
    }

    return (
        <SimpleSignUp group={groupData} orgId={orgId!} groupId={groupId!} />
    );
};
