import { faEdit, faSave, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Card, Switch, TextInput } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import _ from "lodash";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppLoader } from "../../components/AppLoader";
import { CommonHeader } from "../../components/CommonHeader";
import HTMLEditor from "../../components/html-editor/HTMLEditor";
import { schemaTemplate } from "../../modals/template.modals";
import { templateStore } from "../../store/templateStore";

export function EditTemplate () {
  const { id } = useParams();
  const navigate = useNavigate();
  const updateTemplate = templateStore((state: any) => state.updateTemplate);
  const deleteTemplate = templateStore((state: any) => state.deleteTemplate);
  const isLoading = templateStore((state: any) => state.isLoading);
  const getTemplate = templateStore((state: any) => state.getTemplate);
  const template = templateStore((state: any) => state.template);
  const [html, setHtml] = useState<string>("");
  const [templateLoaded, setTemplateLoaded] = useState<boolean>(false);

  const updateForm = useForm({
    // @ts-ignore
    schema: zodResolver(schemaTemplate),
    initialValues: {
      name: "",
      subject: "",
      body: "",
      default: false,
    },
  });

  useEffect(() => {
    getTemplate(id);
  }, [id]);

  useEffect(() => {
    if (!_.isEmpty(template)) {
      updateForm.setValues(template);
      setHtml(template.body);
      setTemplateLoaded(true);
    }
  }, [template]);

  const updateTemplateHandler = async (values: any) => {
    try {
      const a = await updateTemplate(id, values);      
      if (a) {
        navigate("../");
      }
    } catch (e: any) {
      showNotification({
        title: "Error",
        message: e?.message || "Something went wrong",
      });
    }
  };

  const goToAdanceEditor = async () => {
    localStorage.setItem("templateId", id!);
    localStorage.setItem("template", html);
    await navigate("/advance-editor");
  }

  return (
    <>
      <CommonHeader title="Edit Template" backButton={true} />
      {isLoading ? (
        <AppLoader />
      ) : (
        <form
          onSubmit={updateForm.onSubmit((values) =>
            updateTemplateHandler(values)
          )}
        >
          <TextInput
            placeholder="Template Name"
            label="Template Name"
            required
            {...updateForm.getInputProps("name")}
          />
          <TextInput
            placeholder="Subject"
            label="Subject"
            {...updateForm.getInputProps("subject")}
          />
          <Switch
            className="mt-2 mb-2"
            label="Set as default template"
            checked={updateForm.values.default}
            {...updateForm.getInputProps("default")}
          />
          <Card>
            You can use the source code button here and paste in your template or you can use our advanced editor to create your template.
            &nbsp; &nbsp; <Button compact leftIcon={<FontAwesomeIcon icon={faEdit} />} onClick={goToAdanceEditor}>Advanced Editor</Button>
          </Card>
          <HTMLEditor
            allowAttachments={false}
            html={html ?? ""}
            setContent={(value: any) => {
              setHtml(value);
              updateForm.setFieldValue("body", value);
            }}
            permanent={true}
          />
          <div className="d-flex flex-row align-items-center mt-2">
            {/* <div className="mr-2">
              <ConfirmButton
                size="sm"
                onConfirm={async () => {
                  await deleteTemplate(id);
                  navigate("../templates");
                }}
                icon={<FontAwesomeIcon icon={faTrash} />}
                text="Delete Template"
                message="Are you sure you want to delete this template?"
              />
            </div> */}
            <Button leftIcon={<FontAwesomeIcon icon={faSave} />} type="submit">
              Update Template
            </Button>
          </div>
        </form>
      )}
    </>
  );
}
