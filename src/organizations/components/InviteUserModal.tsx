import { useState } from "react";
import { userStore } from "../../store/userStore";
import { Button, Modal, TextInput } from "@mantine/core";
import { showNotification } from "@mantine/notifications";


export const InviteUserModal = ({ orgUID, opened, onClose }: { orgUID: string, opened: boolean, onClose: () => void }) => {
    const inviteUser = userStore((state: any) => state.inviteUserToOrg);
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleInvite = async () => {
        setIsLoading(true);
        try {
            await inviteUser(orgUID, email);
            showNotification({
                title: 'Success',
                message: 'User invited successfully',
                color: 'green',
            });
            setEmail('');
            setIsLoading(false);
            onClose();
        } catch (e: any) {
            console.error(e);
            showNotification({
                title: 'Error',
                message: `Issue with inviting user: ${e.message}`,
                color: 'red',
            });
            setIsLoading(false);
            onClose();
        }
    };

    return (
        <Modal
            title="Invite User"
            onClose={() => {
                setEmail('');
                onClose();
            }}
            opened={opened}
            size="sm"
        >
            <form onSubmit={async (e) => {
                e.preventDefault();
                await handleInvite();
            }}>
                <div>
                    <TextInput
                        required
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.currentTarget.value)}
                    />
                </div>
                <div className="mt-4">
                    <Button
                        color="teal"
                        size="xs"
                        type="submit"
                        loading={isLoading}
                    >Invite User</Button>
                </div>
            </form>
        </Modal>
    );
};