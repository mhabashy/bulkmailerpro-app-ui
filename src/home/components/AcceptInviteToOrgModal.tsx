import { Button, Flex, Modal, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { userStore } from "../../store/userStore";
import { set } from "lodash";
import { showNotification } from "@mantine/notifications";

export const AcceptInviteToOrgModal = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const getOrg = userStore((state: any) => state.getOrg);
    const checkPendingId = userStore((state: any) => state.checkPendingId);
    const removePendingRecord = userStore((state: any) => state.removePendingRecord);
    const acceptInvite = userStore((state: any) => state.acceptInvite);
    const [orgName, setOrgName] = useState<string>("");

    const clearPending = async  () => {
        if (localStorage.getItem("pendingId")) {
            await removePendingRecord(localStorage.getItem("pendingId"));
        }
        localStorage.removeItem("pendingOrg");
        localStorage.removeItem("pendingId");
        localStorage.removeItem("pendingEmail");
        setIsOpen(false);
    };

    const loadInformation = async () => {
        const org = await getOrg(localStorage.getItem("pendingOrg"));
        if (org) {
            setOrgName(org.name);
            if (checkPendingId(localStorage.getItem('pendingId'), org.id)) {
                setIsOpen(true);
            } else {
                clearPending();
            }
        } else {
            clearPending();
        }
        
    };

    useEffect(() => {
        if (localStorage.getItem("pendingOrg") && localStorage.getItem("pendingId")) {
            loadInformation();
        } else {
            clearPending();
        }
    }, []);

    return (
        <Modal
            opened={isOpen}
            onClose={() => {}}
            title="Accept Invite"
            size="sm"
        >
            <Text>
                You have been invited to join an of <span color="red">{orgName ?? 'Unknown'}</span>. Please accept the invite to continue.
            </Text>
            <br/>
            <Flex direction="row" justify="space-between">
                <Button
                    onClick={clearPending}
                    color="red"
                    radius={20}
                >
                    Decline
                </Button>
                <Button
                    onClick={async () => {
                        try {
                            await acceptInvite(localStorage.getItem("pendingId"), localStorage.getItem("pendingOrg"));
                            showNotification({
                                title: 'Success',
                                message: 'You have successfully joined the organization',
                                color: 'green',
                            });
                            clearPending();
                            window.location.reload();
                        } catch (e: any) {
                            console.error(e);
                            showNotification({
                                title: 'Error',
                                message: e.message,
                                color: 'red',
                            });
                        }
                        clearPending();
                    }}
                    color="green"
                    radius={20}
                >
                    Accept Invite
                </Button>
            </Flex>
        </Modal>
    );

};