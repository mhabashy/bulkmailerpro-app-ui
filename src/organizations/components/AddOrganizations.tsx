import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Center, Flex, Input, Loader, Modal, Text } from "@mantine/core";
import { useState } from "react";
import { userStore } from "../../store/userStore";
import { showNotification } from "@mantine/notifications";

export const AddOrganizations = () => {
    const addOrganization = userStore((state: any) => state.addOrganization);
    const isLoadingAddOrg = userStore((state: any) => state.isLoadingAddOrg);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [orgName, setOrgName] = useState<string>("");


    return (
        <>
            <Modal
                opened={isOpen}
                onClose={() => {}}
                title="Accept Invite"
                size="sm"
            >
                <Input 
                    value={orgName}
                    onChange={(e: any) => setOrgName(e.target.value)}
                    placeholder="Enter Organization Name"
                />
                <br/>
                {isLoadingAddOrg ?  <Center><Loader /></Center> : 
                <Flex direction="row" justify="space-between">
                    <Button onClick={() => {
                        setOrgName("");
                        setIsOpen(false);
                    }} color="red">
                        Cancel
                    </Button>
                    <Button onClick={async () => {
                        try {
                            const orgUID = await addOrganization(orgName);
                            setIsOpen(false);
                            localStorage.setItem('defaultOrgUID', orgUID);
                            showNotification({
                                title: 'Success',
                                message: 'Organization added successfully',
                                color: 'green',
                            });
                            setTimeout(() => {
                                window.location.reload();
                            }, 1000);
                        } catch (e: any) {
                            console.error(e);
                            showNotification({
                                title: 'Error',
                                message: `Issue with adding organization: ${e.message}`,
                                color: 'red',
                            });
                        }
                    }} color="teal">
                        Add
                    </Button>
                </Flex>}
            </Modal>
            <Button compact leftIcon={<FontAwesomeIcon icon={faAdd} />} onClick={() => setIsOpen(true)} color="teal">
                Add Organization
            </Button>
        </>
    );
};