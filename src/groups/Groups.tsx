import { faAdd, faCancel, faEdit, faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ActionIcon, Box, Button, Card, Tooltip } from "@mantine/core";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLoader } from "../components/AppLoader";
import { CommonHeader } from "../components/CommonHeader";
import ConfirmButton from "../components/ConfirmButton";
import { EmptyState } from "../components/EmptyState";
import { IGroup, IMember } from "../modals/groups.modals";
import { groupStore } from "../store/groupStore";
import { GroupAdd } from "./components/group-add";
import './groups.scss';
import { textDescriptions } from "../untils/text-descriptions";
import _ from "lodash";

export const Groups = () => {
  const isLoading = groupStore((state: any) => state.isLoading);
  const groups = groupStore((state: any) => state.groups);
  const getGroups = groupStore((state: any) => state.getGroups);
  const setToDefault = groupStore((state: any) => state.setToDefault);
  const navigate = useNavigate();
  
  const [addDrawer, setAddDrawer] = useState(false);

  useEffect(() => {
    getGroups();
  }, []);
  
  return (
    <>
      <GroupAdd
        drawerOpened={addDrawer}
        drawerOnClose={() => setAddDrawer(false)}
      />
      <CommonHeader title="Groups">
        <Button
          leftIcon={<FontAwesomeIcon icon={faAdd} />}
          color="green"
          onClick={() => setAddDrawer(true)}
          size="xs"
        >
          Add Group
        </Button>
      </CommonHeader>
      {textDescriptions.groups['en-US']}
      {isLoading ? (
        <AppLoader />
      ) : groups.length > 0 ? (
        <Box pt="md">
          {groups.map((group: IGroup) => (
            <Card
              key={group.id}
              p="md"
              shadow="xs"
              radius="xs"
              className="d-flex flex-row justify-content-between align-items-center mb-3"
            >
              <a className="d-flex flex-row align-items-center w-100 a-pointer" 
                  onClick={() => navigate(`/groups/${group.id}`)}>
                {group.default && (
                  <Tooltip label="Default Group" className="mr-2">
                    <FontAwesomeIcon icon={faStar} color="orange" />
                  </Tooltip>
                )}
                  {group.name} {_.identity( group.totalMembers) ? `(${group.totalMembers})` : '(0)'}
              </a>
              <div className="d-flex flex-row align-items-center">
                {!group.default && (
                  <ConfirmButton
                    size="xs"
                    onConfirm={async () => {
                      await setToDefault(group.id, true);
                    }}
                    compact={true}
                    color="orange"
                    icon={<FontAwesomeIcon icon={faStar} />}
                    text="Set Default"
                    message="Are you sure you want set to default?"
                  />
                )}
                {group.default && groups.length > 1 && (
                  <ConfirmButton
                    size="xs"
                    onConfirm={async () => {
                      await setToDefault(group.id, false);
                    }}
                    compact={true}
                    icon={<FontAwesomeIcon icon={faCancel} />}
                    text="Remove Default"
                    message="Are you sure you want to remove default?"
                    color="gray"
                  />
                )}

                <ActionIcon
                  onClick={() => navigate(`/groups/${group.id}`)}
                  color="blue"
                  variant="filled"
                  className="ml-2"
                >
                  <FontAwesomeIcon icon={faEdit} />
                </ActionIcon>
              </div>
            </Card>
          ))}
        </Box>
      ) : (
        <EmptyState>
          <h2>No Groups Found!</h2>
          <Button
            leftIcon={<FontAwesomeIcon icon={faAdd} />}
            size="xs"
            m="md"
            color="green"
            onClick={() => setAddDrawer(true)}
          >
            Add Group
          </Button>
        </EmptyState>
      )}
    </>
  );
}
