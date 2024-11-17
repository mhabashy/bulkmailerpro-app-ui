import { faAdd, faEarth, faFileExcel, faPencil, faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Tooltip } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { AppLoader } from "../components/AppLoader";
import { CommonHeader } from "../components/CommonHeader";
import { groupStore } from "../store/groupStore";
import GroupAddMember from "./components/group-add-member";
import GroupEdit from "./components/group-edit";
import GroupImportMenu from "./components/group-import-menu";
import { GroupMembersTable } from "./components/group-members-table";
import GroupSignupMemberInfo from "./components/group-signup-member-info";
import { IMember } from "../modals/groups.modals";


export const ViewGroup = () => {
    const [openedAddDrawer, setCloseAddDrawer] = useState(false);
    const [openedExportDrawer, setCloseExportDrawer] = useState(false);
    const [openedEditGroupDrawer, setCloseEditGroupDrawer] = useState(false);
    const [openedGroupAPIInfoDrawer, setCloseGroupAPIInfoDrawer] = useState(false);
    const { id } = useParams();
    const isLoading = groupStore((state: any) => state.isLoading);
    const getGroup = groupStore((state: any) => state.getGroup);
    const group = groupStore((state: any) => state.group);
    // const members = groupStore((state: any) => state.members);


    // const totalSubscribed = useMemo(() => {
    //   const tempMembers =  members.filter((member: IMember) => member.subscribed);
    //   return tempMembers.length;
    // }, [members]);
  
    useEffect(() => {
        getGroup(id);
    }, [id]);

    return (
      <>
        <GroupAddMember
          drawerOpened={openedAddDrawer}
          group={group}
          setDrawerOpened={setCloseAddDrawer}
        />
        <GroupImportMenu
          drawerOpened={openedExportDrawer}
          setDrawerOpened={setCloseExportDrawer}
        />
        <GroupEdit
          drawerOpened={openedEditGroupDrawer}
          setDrawerOpened={setCloseEditGroupDrawer}
          group={group}
        />
        <GroupSignupMemberInfo 
          groupId={id ?? ""}
          drawerOpened={openedGroupAPIInfoDrawer}
          setDrawerOpened={setCloseGroupAPIInfoDrawer}
        />
        <CommonHeader title="View Group" backButton={true}>
          <Button
            className="m-2"
            onClick={() => setCloseAddDrawer(true)}
            compact
            leftIcon={<FontAwesomeIcon icon={faAdd} />}
          >
            Add Member
          </Button>
          <Button
            className="m-2"
            compact
            color="gray"
            leftIcon={<FontAwesomeIcon icon={faFileExcel} />}
            onClick={() => setCloseExportDrawer(true)}
          >
            Import/Excel Members
          </Button>
          <Button
            className="m-2"
            compact
            color="gray"
            leftIcon={<FontAwesomeIcon icon={faPencil} />}
            onClick={() => setCloseEditGroupDrawer(true)}
          >
            Edit Group
          </Button>
          <Button
            className="m-2"
            compact
            color="gray"
            leftIcon={<FontAwesomeIcon icon={faEarth} />}
            onClick={() => setCloseGroupAPIInfoDrawer(true)}
          >
            APIs
          </Button>
        </CommonHeader>
        {isLoading && group ? (
          <AppLoader />
        ) : (
          <div>
            <h1>
              {group.default && (
                <Tooltip label="Default Group" className="mr-2">
                  <FontAwesomeIcon icon={faStar} color="orange" />
                </Tooltip>
              )}{" "}
              {group.name} { group && group.totalMembers != null && <span>( {group.totalMembers} )</span>}
            </h1>
            <p>{group.description}</p>
            <GroupMembersTable group={group} />
          </div>
        )}
      </>
    );
};

