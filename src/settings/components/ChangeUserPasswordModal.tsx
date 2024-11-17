import { useState } from "react";
import { userStore } from "../../store/userStore";
import { Button, Flex, Modal, PasswordInput, Popover, Progress } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey } from "@fortawesome/free-solid-svg-icons";
import { PasswordRequirement, getStrength, requirementsPassword } from "../../untils/PasswordWithRequirement";
import { showNotification } from "@mantine/notifications";

export const ChangeUserPasswordModal = () => {
    const changePassword = userStore((state: any) => state.changeUserPassword);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [oldPassword, setOldPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [value, setValue] = useState('');
    const [popoverOpened, setPopoverOpened] = useState(false);

    const strength = getStrength(value);
    const color = strength === 100 ? 'teal' : strength > 50 ? 'yellow' : 'red';

    const checks = requirementsPassword.map((requirement, index) => (
        <PasswordRequirement key={index} label={requirement.label} meets={requirement.re.test(value)} />
      ));
  
    const handleSave = async () => {
        try {
            if (strength !== 100) {
                throw new Error("Password does not meet requirements");
            }
            if (oldPassword === "" || newPassword === "" || confirmPassword === "") {
                throw new Error("All fields are required");
            }
            if (newPassword !== confirmPassword) {
                throw new Error("Passwords do not match");
            }
            await changePassword(oldPassword, newPassword);
            setIsOpen(false);
        } catch (e: any) {
            console.error(e);
            showNotification({
                title: 'Error',
                message: `Issue with changing password: ${e.message}`,
                color: 'red',
            });
        }
    };

    return (
        <>
            <Modal
                opened={isOpen}
                onClose={() => {
                    setOldPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setIsOpen(false);
                }}
                title="Change Password"
            >
                <PasswordInput
                    value={oldPassword}
                    onChange={(e: any) => setOldPassword(e.target.value)}
                    placeholder="Enter Old Password"
                />
                <br/>
                <Popover 
                opened={popoverOpened} 
                position="bottom" 
                width="target" 
                withinPortal={true}
                transitionProps={{ transition: 'pop' }}>
                    <Popover.Target>
                    <div
                        onFocusCapture={() => setPopoverOpened(true)}
                        onBlurCapture={() => setPopoverOpened(false)}
                    >
                    <PasswordInput
                        withAsterisk
                        label="Your password"
                        placeholder="Your password"
                        required
                        onChange={(e) => {
                            setValue(e.target.value);
                            setNewPassword(e.target.value);
                        }}
                        />
                    </div>
                    </Popover.Target>
                    <Popover.Dropdown>
                    <Progress color={color} value={strength} size={5} mb="xs" />
                    <PasswordRequirement label="Includes at least 6 characters" meets={value.length > 5} />
                    {checks}
                    </Popover.Dropdown>
                </Popover>
                <br/>
                <PasswordInput
                    value={confirmPassword}
                    onChange={(e: any) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm New Password"
                />
                <br/>
                <Flex direction="row" justify="space-between">
                    <Button onClick={() => setIsOpen(false)} color="red">Cancel</Button>
                    <Button onClick={handleSave} color="teal">Save</Button>
                </Flex>
            </Modal>
            <Button
                onClick={() => setIsOpen(true)}
                color="blue"
                leftIcon={<FontAwesomeIcon icon={faKey} />}
            >
                Change Password
            </Button>
        </>
    )
    
};