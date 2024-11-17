import { Button, Checkbox, Switch, TextInput } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { useNavigate } from "react-router-dom";
import { CommonHeader } from "../../components/CommonHeader";
import { schemaTemplate } from "../../modals/template.modals";
import { templateStore } from "../../store/templateStore";
import HTMLEditor from "../../components/html-editor/HTMLEditor";

export function CreateTemplate() {
  const isLoading = templateStore((store: any) => store.isLoading);
  const createTemplate = templateStore((store: any) => store.createTemplate);
  const navigate = useNavigate();

  const createForm = useForm({
    // @ts-ignore
    schema: zodResolver(schemaTemplate),
    initialValues: {
      name: "",
      subject: "",
      body: "",
      default: true,
    }
  });

  const saveTemplate = async (values: any) => {
    try {
      const a = await createTemplate(values);
      if (a) {
        navigate("../edit/" + a);
        showNotification({
          title: "Success",
          message: "Template created successfully! You can now edit it.",
        });
      }
    } catch (e: any) {
      showNotification({
        title: "Error",
        message: e?.message || 'Something went wrong',
      });
    }
  };

  return (
    <>
      <CommonHeader title="Add Template" backButton={true} />
      <form onSubmit={createForm.onSubmit((values) => saveTemplate(values))}>
        <TextInput
          placeholder="Template Name"
          label="Template Name"
          required
          {...createForm.getInputProps("name")}
        />
        <TextInput
          placeholder="Subject"
          label="Subject"
          {...createForm.getInputProps("subject")}
        />
        <Switch
          className="mt-2 mb-2"
          label="Set as default template"
          checked={createForm.values.default}
          {...createForm.getInputProps("default")}
        />
        {/* <HTMLEditor
          allowAttachments={false}
          permanent={true}
          html={createForm.values.body}
          setContent={(value: any) => createForm.setFieldValue("body", value)}
        /> */}
        <Button type="submit" className="mt-2" loading={isLoading}>
          Create Template
        </Button>
      </form>
    </>
  );
}
