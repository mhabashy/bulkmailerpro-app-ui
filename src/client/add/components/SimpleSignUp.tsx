
import { Box, Button, Flex, Group, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { IGroup, IMembers } from "../../unsubscibe/models/groups";

export default function SimpleSignUp(
    { orgId, groupId, group  }: {  orgId: string, groupId: string, group: IGroup  }
) {

    const [addStatus, setAddStatus] = useState<string>('initial');
    const [recaptcha, setRecaptcha] = useState<boolean>(false);

    const form = useForm({
        initialValues: {
            email: '',
        },

        validate: {
        email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
        },
    });
    const submitData = async (data: IMembers) => {
        let resData: any = {};
        try {
            setAddStatus('loading');
            const res = await fetch(`${process.env.VITE_FUNCTIONS_BACKEND}/api/v1/signup/group/${orgId}/${groupId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            resData = await res.json();
            if (!resData.message) {
                notifications.show({
                    title: 'Subscribed to group',
                    message: `You have been subscribed to ${group.name}`,
                    security: 'success',
                    autoClose: 3000
                });
                form.reset();
            } else {
                notifications.show({
                    title: 'Error',
                    message: resData.message,
                    security: 'error',
                    autoClose: 3000
                });
            }
            setAddStatus('initial');
        } catch (error) {
            setAddStatus('initial');
            console.log(error);
        }
    }
    return (
        <Box m="md" p="md">
            <h4>{group.name} Newsletter Sign Up</h4>
            <form onSubmit={form.onSubmit(async (values) => {
                await submitData(values);
            })}>
            <TextInput
                withAsterisk
                label="Email"
                placeholder="your@email.com"
                // key={form.key('email')}
                {...form.getInputProps('email')}
            />
            <br/>
            <Flex justify="center">
                <ReCAPTCHA
                    sitekey={import.meta.env.VITE_RECAPTCHA_KEY ?? ''}
                    onChange={(value: any) => {
                        setRecaptcha(value ? true : false);
                    }}
                />
            </Flex>
            <Button disabled={addStatus === 'loading' || !recaptcha} type="submit" fullWidth mt="lg" mb="lg">Sign Up</Button>
            </form>
        </Box>
    );
}