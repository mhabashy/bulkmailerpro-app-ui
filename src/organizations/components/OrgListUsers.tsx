import { Button, Card, Divider, Flex, Space, Table, Text } from "@mantine/core";
import { OrgListUser } from "./OrgListUser";
import { DocumentData } from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faStar, faTrash } from "@fortawesome/free-solid-svg-icons";
import { InviteUserModal } from "./InviteUserModal";
import { useState } from "react";
import _ from "lodash";
import ConfirmButton from "../../components/ConfirmButton";
import { userStore } from "../../store/userStore";
import { showNotification } from "@mantine/notifications";

import './org-admin.scss';

export const OrgListUsers = ({ org }: { org: DocumentData }) => {
    const [openInviteUserModal, setOpenInviteUserModal] = useState(false);
    const makeAdmin = userStore((state: any) => state.makeAdmin);
    const addUserToOrg = userStore((state: any) => state.addUserToOrg);
    const removeUserFromOrg = userStore((state: any) => state.removeUserFromOrg);
    const uid = userStore((state: any) => state.uid);
    return (
        <>
            <Card padding="md" shadow="sm" radius="sm" mb="lg" className="scroll-h">
                <Flex justify="space-between" pb="md" pt="md" align="center">
                    <Text weight="bold" size="md">Users</Text>
                    {_.includes(org.get('admins'), uid)  && <Button 
                        compact 
                        leftIcon={<FontAwesomeIcon icon={faEnvelope} />}
                        onClick={() => setOpenInviteUserModal(true)}
                    >Invite User</Button>}
                </Flex>
                <Divider />
                <Table striped highlightOnHover>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {org.get('users').map((user: any) => {
                            return <OrgListUser key={user} userId={user} hasAction={_.includes(org.get('admins'), uid) && !_.includes(org.get('admins'), user)}>
                                <Flex direction="row" justify="space-around">
                                    <ConfirmButton
                                        size="xs"
                                        onConfirm={async () => {
                                            if (await makeAdmin(org.id, user)) {
                                                showNotification({
                                                    title: "Success",
                                                    message: "User is now an admin",
                                                    color: "blue"
                                                });
                                            } else {
                                                showNotification({
                                                    title: "Error",
                                                    message: "Failed to make user an admin",
                                                    color: "red"
                                                });
                                            }
                                        }}
                                        compact={true}
                                        color="yellow"
                                        icon={<FontAwesomeIcon icon={faStar} />}
                                        text="Make Admin"
                                        message="Are you sure you want to make this user an admin?"
                                    />
                                    {/* <Space p="xs" />
                                    <ConfirmButton
                                            size="xs"
                                            onConfirm={async () => {
                                                if (await addUserToOrg(org.id, user)) {
                                                    showNotification({
                                                        title: "Success",
                                                        message: "User is now a member",
                                                        color: "blue"
                                                    });
                                                } else {
                                                    showNotification({
                                                        title: "Error",
                                                        message: "Failed to make user a member",
                                                        color: "red"
                                                    });
                                                }
                                            }}
                                            compact={true}
                                            color="red"
                                            icon={<FontAwesomeIcon icon={faTrash} />}
                                            text="Delete User"
                                            message="Are you sure you want to delete this user?"
                                        /> */}
                                    <ConfirmButton
                                        size="xs"
                                        onConfirm={async () => {
                                            if (await removeUserFromOrg(org.id, user)) {
                                                showNotification({
                                                    title: "Success",
                                                    message: "User is now a member",
                                                    color: "blue"
                                                });
                                            } else {
                                                showNotification({
                                                    title: "Error",
                                                    message: "Failed to make user a member",
                                                    color: "red"
                                                });
                                            }
                                        }}
                                        compact={true}
                                        color="red"
                                        icon={<FontAwesomeIcon icon={faTrash} />}
                                        text="Remove User"
                                        
                                        message="Are you sure you want to remove this user from organizations?"
                                    />
                                    
                                </Flex>
                                </OrgListUser>;
                        })}
                    </tbody>
                </Table>
            </Card>
            <InviteUserModal 
                orgUID={org.id} 
                opened={openInviteUserModal} 
                onClose={
                    () => setOpenInviteUserModal(false)
                } />
        </>
    );
};