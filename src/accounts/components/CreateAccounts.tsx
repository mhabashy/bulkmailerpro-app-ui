import { Button, Text, NumberInput, PasswordInput, Switch, TextInput } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { useNavigate } from "react-router-dom";
import { CommonHeader } from "../../components/CommonHeader";
import { schemaAccount } from "../../modals/accounts.modals";
import { accountStore } from "../../store/accountStore";

export const CreateAccounts = (props: any) => {

    const isLoading = accountStore((state: any) => state.isLoading);
    const createAccount = accountStore((state: any) => state.createAccount);

    const createForm = useForm({
      //@ts-ignore
      schema: zodResolver(schemaAccount),
      initialValues: {
        name: "",
        email: "",
        host: "",
        port: 465,
        username: "",
        password: "",
        unsubscribe: true,
        sendingLimitInSec: 14,
      },
    });


    const saveAccount = async (values: any) => {
        try {
            const a = await createAccount(values);
            if (a) {
                props.close();
            }
        } catch (e: any) {
            showNotification({
                message: <Text color="red">{e?.message || 'Something went wrong'}</Text>,
                typeof: 'error',
            });
        }
    };


    return (
        <>
            <h3>Add SMTP Account</h3>
            <form onSubmit={createForm.onSubmit((values) => saveAccount(values))}>
                <TextInput
                    placeholder="Display Name"
                    label="Display Name"
                    required
                    {...createForm.getInputProps('name')}
                />
                <TextInput
                    placeholder="Email Account"
                    label="Email Account"
                    required
                    {...createForm.getInputProps('email')}
                />
                <TextInput
                    placeholder="SMTP Host"
                    label="SMTP Host"
                    required
                    {...createForm.getInputProps('host')}
                />
                <NumberInput
                    placeholder="SMTP Port"
                    label="SMTP Port"
                    required
                    {...createForm.getInputProps('port')}
                />
                <TextInput
                    placeholder="SMTP Username"
                    label="SMTP Username"
                    required
                    {...createForm.getInputProps('username')}
                />
                <PasswordInput
                    placeholder="SMTP Password"
                    label="SMTP Password"
                    required
                    {...createForm.getInputProps('password')}
                />
                <NumberInput
                    placeholder="Sending Limit in Seconds"
                    label="Sending Limit in Seconds"
                    required
                    description="How many seconds to wait between every 10 emails? - this different with every SMTP provider."
                    min={14}
                    {...createForm.getInputProps('sendingLimitInSec')}
                />
                <Switch
                    className="mt-2"
                    label="Send Unsubscribe in Email Messages"
                    defaultChecked={true}
                    {...createForm.getInputProps('unsubscribe')}
                />
                <Button
                    type="submit"
                    className="mt-2"
                    loading={isLoading}
                >
                    Create Account
                </Button>
            </form>
        </>
    );
}
