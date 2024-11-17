import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Drawer, TextInput } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { IGroup, schemaMembers } from "../../modals/groups.modals";
import { groupStore } from "../../store/groupStore";
import { useEffect } from "react";

type AddMemberGroupsProps = {
    drawerOpened: boolean;
    group: IGroup;
    setDrawerOpened: (value: boolean) => void;
};

function AddMemberGroups({drawerOpened, setDrawerOpened, group}: AddMemberGroupsProps) {

    const addMember = groupStore((state: any) => state.addMember);
    const isMemberLoading = groupStore((state: any) => state.isMemberLoading);

    const createForm = useForm({
        //@ts-ignore
      schema: zodResolver(schemaMembers),
      initialValues: {
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        specialIdentifier: "",
      },
    });

    useEffect(() => {
        createForm.reset();
    }, []);

    const submitMember = async (values: any) => {
        try {
            const id = await addMember(group.id, values);
            if (id) {
                setDrawerOpened(false);
                createForm.reset();
            }
        } catch (error: any) {
            showNotification({
                typeof: "error",
                message: error?.message ?? "Something went wrong",
            })
        }
    }

    return (
        <Drawer
          opened={drawerOpened}
          onClose={() => setDrawerOpened(false)}
          title="Add Member"
          padding="xl"
          size="xl"
          position="right"
          closeOnClickOutside={false}
        >
            <form
                onSubmit={createForm.onSubmit((values) => submitMember(values))}
            >
                <TextInput
                    placeholder="First Name"
                    label="First Name"
                    {...createForm.getInputProps("firstName")}
                />
                <TextInput
                    placeholder="Middle Name"
                    label="Middle Name"
                    {...createForm.getInputProps("middleName")}
                />
                <TextInput
                    placeholder="Last Name"
                    label="Last Name"
                    {...createForm.getInputProps("lastName")}
                />
                <TextInput
                    placeholder="Email"
                    label="Email"
                    required
                    {...createForm.getInputProps("email")}
                />
                <TextInput
                    placeholder="Special Identifier (This could be id number, student number, etc.)"
                    label="Special Identifier"
                    {...createForm.getInputProps("specialIdentifier")}
                />
                <Button type="submit" className="mt-2" color="blue" variant="filled" fullWidth leftIcon={<FontAwesomeIcon icon={faAdd} />} size="sm" loading={isMemberLoading}>
                    Add Member
                </Button>
            </form>
        </Drawer>
    );
}

export default AddMemberGroups;