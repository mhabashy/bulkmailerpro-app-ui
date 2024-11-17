import { Card, Divider, Flex, Table, Text } from "@mantine/core";
import { DocumentData, or } from "firebase/firestore";
import { OrgUserColumn } from "./OrgUserColumn";
import ConfirmButton from "../../components/ConfirmButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown, faStar, faTrash } from "@fortawesome/free-solid-svg-icons";
import { userStore } from "../../store/userStore";
import _ from "lodash";

import './org-admin.scss';

export const OrgAdmin = ({ org }: {org: DocumentData}) => {
    const removeAdminAndSetUser = userStore((state: any) => state.removeAdminAndSetUser);
    const deleteUser = userStore((state: any) => state.deleteUser);
    const uid = userStore((state: any) => state.uid);
    return (
        <Card padding="md" shadow="sm" radius="sm" mb="lg" className="scroll-h">
            <Flex justify="space-between" pb="md" pt="md">
                <Text weight="bold" size="md">Organizations Admins</Text>
            </Flex>
            <Divider />
            <Table striped highlightOnHover >
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {org.get('admins').map((admin: any) => {
                        return <OrgUserColumn key={admin} userId={admin} showActions={org.get('admins').length >= 2 && _.includes(org.get('admins'), uid)}>
                                    <Flex direction="row" justify="space-around">
                                        <ConfirmButton
                                            size="xs"
                                            onConfirm={async () => {
                                                await removeAdminAndSetUser(org.id, admin);
                                            }}
                                            compact={true}
                                            color="red"
                                            text="Remove Admin"
                                            message="Are you sure you want to remove admin and set user?"
                                            icon={<FontAwesomeIcon icon={faArrowDown} />}
                                        />
                                        {/* <ConfirmButton
                                            size="xs"
                                            onConfirm={async () => {
                                                await deleteUser(admin);
                                            }}
                                            compact={true}
                                            color="red"
                                            text="Delete User"
                                            message="Are you sure you want to delete this user? This action is irreversible."
                                            icon={<FontAwesomeIcon icon={faTrash} />}
                                        /> */}
                                    </Flex>
                                </OrgUserColumn>;
                    })}
                </tbody>
            </Table>
        </Card>
    );
};