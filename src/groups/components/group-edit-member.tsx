import { Button, Checkbox, Divider, Drawer, LoadingOverlay, TextInput } from '@mantine/core';
import { IMember, schemaMembers } from '../../modals/groups.modals';
import { groupStore } from '../../store/groupStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import ConfirmButton from '../../components/ConfirmButton';
import { useForm, zodResolver } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { useEffect } from 'react';

type GroupEditMember = {
    member: IMember | undefined,
    openedDrawerEditMember: boolean,
    setDrawerOpenedEditMember: (value: boolean) => void,
};

function GroupEditMember({ member, openedDrawerEditMember, setDrawerOpenedEditMember }: GroupEditMember) {
    const deleteMember = groupStore((state: any) => state.deleteMember);
    const updateMember = groupStore((state: any) => state.updateMember);
    const isMemberLoading = groupStore((state: any) => state.isMemberLoading);
    const updateMemberForm = useForm({
      //@ts-ignore
        schema: zodResolver(schemaMembers),
        initialValues: {
            firstName: member?.firstName,
            middleName: member?.middleName,
            lastName: member?.lastName,
            email: member?.email,
            specialIdentifier: member?.specialIdentifier,
            subscribed: member?.subscribed ?? false,
        }
    });

    useEffect(() => {
      updateMemberForm.setValues({
        firstName: member?.firstName,
        middleName: member?.middleName,
        lastName: member?.lastName,
        email: member?.email,
        specialIdentifier: member?.specialIdentifier,
        subscribed: member?.subscribed ?? false,
      });
    }, [member]);

    const onUpdateMember = async (values: any) => {
        try {
            const check = await updateMember(member?.id, values);
            if (check) {
                setDrawerOpenedEditMember(false);
            }
        } catch (error: any) {
            showNotification({
                typeof: "error",
                message: error?.message ?? "Something went wrong",
            })
        }
    };
    

    return (
      <Drawer
        opened={openedDrawerEditMember}
        onClose={() => setDrawerOpenedEditMember(false)}
        title={`Edit Member (${member?.fullName})`}
        padding="xl"
        position="right"
        size="xl"
      >
        <LoadingOverlay visible={isMemberLoading} overlayBlur={2} />
        <form onSubmit={updateMemberForm.onSubmit(onUpdateMember)}>
          <TextInput
            label="First Name"
            placeholder="First Name"
            {...updateMemberForm.getInputProps("firstName")}
          />
          <TextInput
            label="Middle Name"
            placeholder="Middle Name"
            {...updateMemberForm.getInputProps("middleName")}
          />
          <TextInput
            label="Last Name"
            placeholder="Last Name"
            {...updateMemberForm.getInputProps("lastName")}
          />
          <TextInput
            label="Email"
            placeholder="Email"
            {...updateMemberForm.getInputProps("email")}
          />
          <TextInput
            label="Special Identifier"
            placeholder="Special Identifier"
            {...updateMemberForm.getInputProps("specialIdentifier")}
          />
          <Checkbox
            label="Subscribed (Receive emails)"
            mt="md"
            {...updateMemberForm.getInputProps("subscribed", { type: "checkbox" })}
          />
          <br/>
          <Button
            type="submit"
            fullWidth
            leftIcon={<FontAwesomeIcon icon={faPencil} />}
          >
            Update Member
          </Button>
        </form>
        <br />
        <Divider />
        <br />
        <ConfirmButton
          size={"xs"}
          onConfirm={() => {
            deleteMember(member?.id);
            setDrawerOpenedEditMember(false);
          }}
          compact
          icon={<FontAwesomeIcon icon={faTrash} />}
          color="red"
          text="Delete Member"
          message="Are you sure you want to delete this member?"
        />
      </Drawer>
    );
}

export default GroupEditMember;