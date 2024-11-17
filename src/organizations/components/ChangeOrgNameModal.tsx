import { ActionIcon, Button, Flex, Modal, TextInput } from "@mantine/core";
import { DocumentData } from "firebase/firestore";
import { useEffect, useState } from "react";
import { userStore } from "../../store/userStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { showNotification } from "@mantine/notifications";

export const ChangeOrgNameModal = ({ org }: {org: DocumentData}) => {
    const [open, setOpen] = useState(false);
    const [newOrgName, setNewOrgName] = useState<string>(org.get('name'));
    const changeOrgName = userStore((state: any) => state.changeOrgName);

    const handleSave = async () => {
        try {
            if (await changeOrgName(org.id, newOrgName)) {
                showNotification({
                    title: 'Success',
                    message: 'Organization name changed successfully',
                    color: 'green',
                });
                setOpen(false);
            };

        } catch (e: any) {
            console.error(e);
            showNotification({
                title: 'Error',
                message: `Issue with changing organization name: ${e.message}`,
                color: 'red',
            });
        }
    };

    useEffect(() => {
        setNewOrgName(org.get('name'));
    }, [org]);

    return (
        <>
            <Modal opened={open} 

            title="Change Organization Name"
            onClose={() => {
                setNewOrgName(org.name);
                setOpen(false);
            } }>
                <TextInput defaultValue={newOrgName} onChange={(e) => setNewOrgName(e.target.value)} />
                <br/>
                <Flex direction="row"  justify="space-between">
                    <Button onClick={() => setOpen(false)} color="red">Cancel</Button>
                    <Button onClick={handleSave} color="teal">Save</Button>
                </Flex>
            </Modal>
            <ActionIcon onClick={() => setOpen(true)}>
                <FontAwesomeIcon icon={faEdit} />
            </ActionIcon>
        </>
    )
};