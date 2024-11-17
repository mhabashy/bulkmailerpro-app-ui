import { useEffect, useState, useCallback } from "react";
import { IGroup, IGroupMembers } from "./models/groups";
import { Box, Card, Checkbox, Container, Flex, Loader } from "@mantine/core";
import { notifications } from "@mantine/notifications";

export default function PossibleGroups(
    { groups, orgId, email, groupName }: 
    { groups: IGroup[], orgId: string, email: string, groupName?: string }
) {
    const [selectedGroups, setSelectedGroups] = useState<IGroupMembers[]>([]);
    const [removedGroups, setRemovedGroups] = useState<IGroupMembers[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    
    const getSelectedGroups = useCallback(async () => {
        const res = await fetch(`${import.meta.env.VITE_FUNCTIONS_BACKEND}/api/v1/unsubscribe/${orgId}/members/?email=${email}`, {cache: "no-store"});
        const data = await res.json();
        setSelectedGroups(data);
        setIsLoading(false);
    }, [orgId, email]);

    const updateSelectedGroups = async (group: IGroup, action = 'unsubscribe') => {
        let memberInfo = null;
        if (removedGroups.length > 0 && removedGroups.find((rGroup) => rGroup.groupId == group.id && rGroup.memberInfo)) {
            memberInfo = removedGroups.find((rGroup) => rGroup.groupId == group.id)?.memberInfo;
        }
        const res = await fetch(`${import.meta.env.VITE_FUNCTIONS_BACKEND}/api/v1/unsubscribe/${orgId}/members/${group.id}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(memberInfo ? {
                action: action,
                email: email,
                memberInfo: memberInfo
            }: {
                action: action,
                email: email
            })
        });
        const data = await res.json();
        if (data.message && !data.error) {
            notifications.show({
                title: action == 'unsubsubscribe' ? 'Removed from group' : 'Subscribed to group',
                message: `You have been ${action == 'unsubsubscribe' ? 'removed from' : 'subscribed to'} ${group.name}`,
                security: 'success',
                autoClose: 3000
              });
        }
    };

    useEffect(() => {
        getSelectedGroups();
    }, [groups, email, getSelectedGroups]);

    return (
        <> 
        <Flex direction="column" justify="center" align="center">
                <h1>Sorry to see you go!</h1>
                {groupName ? <Box p="lg">{email} subscribition to {groupName!.toLowerCase()}</Box> : <Box p="lg">{email} subscribition to the following groups:</Box>}
                {isLoading && <Loader />}
                {!isLoading && <>
                    {groups.length == 0 && <Box p="lg">No groups found</Box>}
                    {groups.map((group) => (
                        <Container key={group.id} fluid >
                            <Card key={group.id} padding="sm" m="sm" shadow="lg">
                                <Flex direction="column">
                                    <h4>{group.name}</h4>
                                    <Checkbox 
                                        label="Would you like to receive emails from this group?"
                                        checked={selectedGroups.map((selectedGroup) => selectedGroup.groupId).includes(group.id)}
                                        onChange={(value) => {
                                            if (value.target.checked) {
                                                const removedGroup = removedGroups.find((removedGroup) => removedGroup.groupId === group.id);
                                                setSelectedGroups([...selectedGroups, {groupId: group.id, groupName: group.name, memberInfo: removedGroup?.memberInfo}]);
                                                setRemovedGroups(removedGroups.filter((removedGroup) => removedGroup.groupId !== group.id));
                                                updateSelectedGroups(group, 'subscribe');
                                            } else {
                                                const selectedGroup = selectedGroups.find((selectedGroup) => selectedGroup.groupId === group.id);
                                                setSelectedGroups(selectedGroups.filter((selectedGroup) => selectedGroup.groupId !== group.id));
                                                setRemovedGroups([...removedGroups, {groupId: group.id, groupName: group.name, memberInfo: selectedGroup?.memberInfo}]);
                                                updateSelectedGroups(group, 'unsubscribe');
                                            }
                                        }}
                                    />
                                </Flex>
                            </Card>
                        </Container>
                    ))}
                </>}
            </Flex>
        </>
    );
}