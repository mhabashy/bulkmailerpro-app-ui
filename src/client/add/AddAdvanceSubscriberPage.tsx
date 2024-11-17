import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AdvanceSignUp from "./components/AdvanceSignUp";


export default function AddAdvanceSubscriberPage() {
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
        <AdvanceSignUp group={groupData} orgId={orgId} groupId={groupId} />
    );
}