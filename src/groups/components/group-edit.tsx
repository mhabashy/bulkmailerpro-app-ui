import { faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Center, Divider, Drawer, Loader, Switch, TextInput } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmButton from '../../components/ConfirmButton';
import { IGroup, schemaGroups } from '../../modals/groups.modals';
import { groupStore } from '../../store/groupStore';

type GroupEditProps = {
    drawerOpened: boolean;
    setDrawerOpened: (value: boolean) => void;
    group: IGroup
};

function GroupEdit({ drawerOpened, setDrawerOpened, group }: GroupEditProps) {
  const isLoading = groupStore((state: any) => state.isLoading);
  const updateGroup = groupStore((state: any) => state.updateGroup);
  const deleteGroup = groupStore((state: any) => state.deleteGroup);
  const navigator = useNavigate();
  const isDeleting = groupStore((state: any) => state.isDeleting);

  const updateGroupForm = useForm({
    //@ts-ignore
    schema: zodResolver(schemaGroups),
    initialValues: {
      name: group.name,
      description: group.description,
      default: group.default,
    },
  });

  useEffect(() => {
    updateGroupForm.setValues({
      name: group.name,
      description: group.description,
      default: group.default,
    });
  }, [group]);

  const onUpdateGroup = async (values: any) => {
    try {
      const a = await updateGroup(group.id, values);
      if (a) {
        setDrawerOpened(false);
      }
    } catch (e: any) {
      showNotification({
        title: "Error",
        message: e?.message || "Something went wrong",
      });
    }
  };

  return (
    <Drawer
      opened={drawerOpened}
      onClose={() => setDrawerOpened(false)}
      title="Edit Group"
      position="right"
      padding="xl"
      size="xl"
      closeOnClickOutside={false}
    >
      <form
        className="m-2"
        onSubmit={updateGroupForm.onSubmit((values) => onUpdateGroup(values))}
      >
        <TextInput
          placeholder="Group Name"
          label="Group Name"
          required
          {...updateGroupForm.getInputProps("name")}
        />
        <TextInput
          placeholder="Description"
          label="Description"
          {...updateGroupForm.getInputProps("description")}
        />
        <br />
        <Switch
          label="Default"
          checked={updateGroupForm.values.default}
          {...updateGroupForm.getInputProps("default")}
        />
        <br />
        <Button
          type="submit"
          fullWidth
          leftIcon={<FontAwesomeIcon icon={faPencil} />}
          loading={isLoading}
        >
          Update Group
        </Button>
        <br />
        <Divider />
        <br />
        {isDeleting ? <Center><Loader /></Center> : <ConfirmButton
          size="sm"
          compact={true}
          onConfirm={async () => {
            await deleteGroup(group.id);
            navigator(-1);
          }}
          icon={<FontAwesomeIcon icon={faTrash} />}
          text="Delete Group"
          message="Are you sure you want to delete this group?"
        />}
      </form>
    </Drawer>
  );
}

export default GroupEdit;