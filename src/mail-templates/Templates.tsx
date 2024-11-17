import { faAdd, faCopy, faEdit, faFileCirclePlus, faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ActionIcon, Box, Button, Card, Tooltip } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { AppLoader } from "../components/AppLoader";
import { CommonHeader } from "../components/CommonHeader";
import ConfirmButton from "../components/ConfirmButton";
import { EmptyState } from "../components/EmptyState";
import { templateStore } from "../store/templateStore";
import {ITemplate} from "../modals/template.modals";
import { useEffect } from "react";
import { textDescriptions } from "../untils/text-descriptions";

export const Templates = () => {
  const navigate = useNavigate();
  const isLoading = templateStore((store: any) => store.isLoading);
  const getTemplates = templateStore((store: any) => store.getTemplates);
  const deleteTemplate = templateStore((store: any) => store.deleteTemplate);
  const templates = templateStore((store: any) => store.templates);
  const createTemplate = templateStore((store: any) => store.createTemplate);
  const updateTemplate = templateStore((store: any) => store.updateTemplate);

  const setToDefault = (t: ITemplate) => {
    updateTemplate(t.id, { ...t, default: true });
  };

  useEffect(() => {
    getTemplates();
  }, []);

  return (
    <>
      <CommonHeader title="Templates">
        <Button
          leftIcon={<FontAwesomeIcon icon={faAdd} />}
          color="green"
          onClick={() => navigate("/templates/add")}
          size="xs"
        >
          Add Template
        </Button>
      </CommonHeader>
      {textDescriptions.templates['en-US']}
      {isLoading ? (
        <AppLoader />
      ) : templates.length > 0 ? (
        <Box pt="md">
          {templates.map((template: any) => (
            <Card
              key={template.id}
              p="md"
              shadow="xs"
              radius="xs"
              className="d-flex flex-row justify-content-between align-items-center mb-3"
            >
              <div className="d-flex flex-row align-items-center">
                {template.default && (
                  <Tooltip label="Default Template" position="right" className="mr-2">
                    <FontAwesomeIcon icon={faStar} color="orange" />
                  </Tooltip>
                )}
                {template.name}
              </div>
              <div className="d-flex flex-row">
                {!template.default && (
                  <Tooltip label="Set Template to default" position="left" key={`set-default-button-${template.id}`}>
                    <ActionIcon
                      color="orange"
                      variant="filled"
                      className="mr-2"
                      onClick={() => setToDefault(template)}
                    >
                      <FontAwesomeIcon icon={faStar} />
                    </ActionIcon>
                  </Tooltip>
                )}
                <ConfirmButton iconOnly={true} size="sm" onConfirm={() => deleteTemplate(template)} />
                <Tooltip label="Edit" offset={10} position="left" key={`edit-button-${template.id}`}>
                  <ActionIcon
                    onClick={() => navigate(`/templates/edit/${template.id}`)}
                    color="blue"
                    variant="filled"
                    className="ml-2"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Edit in Advance Editor" offset={10} className="mr-2" position="left" key={`edit-advance-editor-${template.id}`}>
                  <ActionIcon
                    onClick={() => {
                      localStorage.setItem("templateId", template.id);
                      localStorage.setItem("template", template.body);
                      navigate("/advance-editor");
                    }}
                    color="green"
                    variant="filled"
                    className="ml-2">
                    <FontAwesomeIcon icon={faFileCirclePlus} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Copy Template" offset={10} position="left" key={`copy-template-${template.id}`}>
                  <ActionIcon
                    onClick={async () => {
                      await createTemplate(
                        {
                          name: template.name + " - Copy",
                          subject: template.subject,
                          body: template.body,
                          default: false,
                        }
                      );
                      getTemplates();
                    }}
                    color="yellow"
                    variant="filled"
                    className="ml-2"
                  >
                    <FontAwesomeIcon icon={faCopy} />
                  </ActionIcon>
                </Tooltip>
              </div>
            </Card>
          ))}
        </Box>
      ) : (
        <EmptyState>
          <h2>No Templates Found!</h2>
          <Button
            leftIcon={<FontAwesomeIcon icon={faAdd} />}
            size="xs"
            m="md"
            color="green"
            onClick={() => navigate("/templates/add")}
          >
            Add Template
          </Button>
        </EmptyState>
      )}
    </>
  );
}