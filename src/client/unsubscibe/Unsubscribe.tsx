import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import PossibleGroups from "./PossibleGroups";
import { IGroup } from "./models/groups";

async function getGroups(groupId: string) {
    const res = await fetch(`${import.meta.env.VITE_FUNCTIONS_BACKEND}/api/v1/unsubscribe/${groupId}/`, {cache: "no-store"});
    const result = await res.json();
    return result;
}

export default function Unsubscribe() {
    const { orgId } = useParams();
    const [groups, setGroups] = useState<IGroup[]>([]);
    const [searchParams] = useSearchParams();
    const [groupName, setGroupName] = useState<string>("");
    const [timeout, setTimeoutState] = useState<boolean>(false);

    useEffect(() => {
        const fetchData = async () => {
            // const groups = await getGroups(orgId!);
            setGroups(await getGroups(orgId!));
        };
        fetchData();
        setTimeout(() => {
            setTimeoutState(true); 
        }, 5000);
    }, [orgId]);

    useEffect(() => {
        setGroupName(groups.length > 0 ? groups[0].groupName! : "");
    }, [groups]);


    if (!searchParams.has("email")) {
        return <div>No email provided</div>;
    }

    if (orgId) {
        return <PossibleGroups 
                    groups={groups} 
                    orgId={orgId} 
                    email={searchParams.get("email")!}
                    groupName={groupName}
                />;
    }
    return (
        <>
            {!timeout && <div>
                Loading...
            </div>}
            {timeout && <div>
                Timeout redirecting...
            </div>}
        </>
    )
}