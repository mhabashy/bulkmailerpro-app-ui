import { Button, Drawer, Switch, TextInput } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { useNavigate } from "react-router-dom";
import { schemaGroups } from "../../modals/groups.modals";
import { groupStore } from "../../store/groupStore";

type GroupAddProps = {
  drawerOpened: boolean;
  drawerOnClose: () => void;
};

export function GroupAdd({drawerOpened, drawerOnClose}: GroupAddProps) {
  const isLoading = groupStore((state: any) => state.isLoading);
  const createGroup = groupStore((state: any) => state.createGroup);
  const navigate = useNavigate();

  const createForm = useForm({
    //@ts-ignore
    schema: zodResolver(schemaGroups),
    initialValues: {
      name: "",
      description: null,
      default: true,
    }
  });

  const submitGroup = async (values: any) => {
    try {
      const id = await createGroup(values);
      drawerOnClose();
      setTimeout(() => {
        navigate("/groups/" + id );
      }, 1000);
    } catch (error: any) {
      showNotification({
        typeof: "error",
        message: error?.message ?? "Something went wrong",
      })
    }
  };

  return (
    <>
      <Drawer
        opened={drawerOpened}
        onClose={drawerOnClose}
        title={<h4 className="m-2">Add Group</h4>}
        size="xl"
        position="right"
      >
        <form
          onSubmit={createForm.onSubmit((values) => submitGroup(values))}
          className="m-2"
        >
          <TextInput
            placeholder="Group Name"
            label="Group Name"
            required
            {...createForm.getInputProps("name")}
          />
          <TextInput
            placeholder="Description"
            label="Description"
            {...createForm.getInputProps("description")}
          />
          <Switch
            className="mt-2 mb-2"
            label="Set as default group"
            checked={createForm.values.default}
            {...createForm.getInputProps("default")}
          />
          <Button
            type="submit"
            color="green"
            className="mt-2"
            loading={isLoading}
            fullWidth
          >
            Add Group
          </Button>
        </form>
      </Drawer>
    </>
  );
}
