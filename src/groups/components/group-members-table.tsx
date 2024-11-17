import { ScrollArea, Table, TextInput, Text, ActionIcon, Tooltip, Button } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import { AppLoader } from "../../components/AppLoader";
import { IGroup, IMember } from "../../modals/groups.modals";
import { groupStore } from "../../store/groupStore";
import GroupEditMember from "./group-edit-member";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faQuestionCircle, faTrash } from "@fortawesome/free-solid-svg-icons";
import ConfirmButton from "../../components/ConfirmButton";
import { useDebouncedValue, useIntersection } from "@mantine/hooks";

interface IGroupMembersTableProps {
  group: IGroup;
}

export function GroupMembersTable({ group }: IGroupMembersTableProps) {
    const [openedEditDrawer, setCloseEditDrawer] = useState(false);
    const [member, setMember] = useState<IMember>();
    const members = groupStore((state: any) => state.members);
    const isMemberLoading = groupStore((state: any) => state.isMemberLoading);
    const getMembers = groupStore((state: any) => state.getMembers);
    const deleteMember = groupStore((state: any) => state.deleteMember);
    const isSearch = groupStore((state: any) => state.isSearch);
    const [searchValue, setSearchValue] = useState('');
    const [debouncedSearchValue] = useDebouncedValue(searchValue, 300);
    const searchMembers = groupStore((state: any) => state.searchMembers);

    useEffect(() => {
        getMembers();
    }, []);

    const openEditDrawer = (member: IMember) => {
        setMember(member);
        setCloseEditDrawer(true);
    };

    useMemo(() => {
      searchMembers(searchValue);
    }, [debouncedSearchValue]);

    const rows = members.map((member: IMember) => (
      <tr key={member.id}>
        <td>{member.email}</td>
        <td>{member.fullName}</td>
        <td>{member.specialIdentifier}</td>
        <td>{member.subscribed ? "Yes" : "No"}</td>
        <td className="d-flex flex-row">
          <ActionIcon onClick={() => openEditDrawer(member)} color="gray">
            <FontAwesomeIcon icon={faEdit} />
          </ActionIcon>
          <ConfirmButton
            size="xs"
            onConfirm={() => {
              deleteMember(member.id);
            }}
            icon={<FontAwesomeIcon icon={faTrash} />}
            iconOnly={true}
            message={"Are you sure you want to delete member?"}
            color="red"
          />
        </td>
      </tr>
    ));

    return isMemberLoading ? (
      <AppLoader />
    ) : (
      <>
        <GroupEditMember
          member={member}
          openedDrawerEditMember={openedEditDrawer}
          setDrawerOpenedEditMember={setCloseEditDrawer}
        />
        <TextInput
          label="Search Members"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <ScrollArea>
          <Table horizontalSpacing="md" verticalSpacing="xs" striped highlightOnHover>
            <thead>
              <tr>
                <th>Email</th>
                <th>Full Name</th>
                <th>
                  Special Identifier{" "}
                  <Tooltip
                    label={`This could be the unique identifier, and can be added in any link.`}
                    children={<FontAwesomeIcon icon={faQuestionCircle} />}
                  />
                </th>
                <th>
                  Subscribed
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length > 0 ? (
                rows
              ) : (
                <tr>
                  <td colSpan={4}>
                    <Text weight={500} align="center">
                      No members found
                    </Text>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </ScrollArea>
        {((group?.totalMembers ?? 0)) > members.length && !isSearch && <Button
          onClick={() => getMembers(true)}
          variant="outline"
          className="w-100"
        >LOAD MORE</Button>}
      </>
    );
};

