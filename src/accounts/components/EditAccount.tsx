import { faSave, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Button,
  NumberInput,
  PasswordInput,
  Switch,
  TextInput,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLoader } from "../../components/AppLoader";
import { CommonHeader } from "../../components/CommonHeader";
import ConfirmButton from "../../components/ConfirmButton";
import { schemaAccount } from "../../modals/accounts.modals";
import { accountStore } from "../../store/accountStore";

export const EditAccounts = () => {
  const { id } = useParams();
  const updateAccount = accountStore((state: any) => state.updateAccount);
  const deleteAccount = accountStore((state: any) => state.deleteAccount);
  const isLoading = accountStore((state: any) => state.isLoading);
  const getAccount = accountStore((state: any) => state.getAccount);
  const account = accountStore((state: any) => state.account);
  const navigate = useNavigate();

  const editForm = useForm({
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

  useEffect(() => {
    getAccount(id);
  }, [id]);

  useEffect(() => {
    if (account) {
      editForm.setValues(account);
    }
  }, [account]);


  const saveAccount = async (values: any) => {
    try {
      const a = await updateAccount(values);
      if (a) {
        showNotification({
          message: "Account updated successfully",
          typeof: "success",
        });
      }
      navigate('../../accounts');
    } catch (e) {}
  };

  return (
    <>
      <CommonHeader title="Edit Email Accounts" backButton={true} />
      {isLoading ? (
        <AppLoader />
      ) : (
        <form onSubmit={editForm.onSubmit((values) => saveAccount(values))}>
          <TextInput
            placeholder="Display Name"
            label="Display Name"
            required
            {...editForm.getInputProps("name")}
          />
          <TextInput
            placeholder="Email Account"
            label="Email Account"
            required
            {...editForm.getInputProps("email")}
          />
          <TextInput
            placeholder="SMTP Host"
            label="SMTP Host"
            required
            {...editForm.getInputProps("host")}
          />
          <NumberInput
            placeholder="SMTP Port"
            label="SMTP Port"
            required
            {...editForm.getInputProps("port")}
          />
          <TextInput
            placeholder="SMTP Username"
            label="SMTP Username"
            required
            {...editForm.getInputProps("username")}
          />
          <PasswordInput
            placeholder="SMTP Password"
            label="SMTP Password"
            required
            {...editForm.getInputProps("password")}
          />
          <NumberInput
            placeholder="Sending Limit in Seconds"
            label="Sending Limit in Seconds"
            required
            description="How many seconds to wait between every 10 emails? - this different with every SMTP provider."
            min={14}
            {...editForm.getInputProps("sendingLimitInSec")}
          />
          <Switch
            className="mt-2"
            label="Send Unsubscribe in Email Messages"
            defaultChecked={true}
            {...editForm.getInputProps("unsubscribe")}
          />
          <div className="d-flex flex-row align-items-center mt-2">
            <div className="mr-2">
                <ConfirmButton
                    size="sm"
                    onConfirm={async () => {
                        await deleteAccount(id)
                        navigate('../accounts');
                    }}
                    icon={<FontAwesomeIcon icon={faTrash} />}
                    text="Delete Account"
                    message="Are you sure you want to delete this account?"
                />
            </div>
            <Button leftIcon={<FontAwesomeIcon icon={faSave} />} type="submit">
              Update Account
            </Button>
          </div>
        </form>
      )}
    </>
  );
}
