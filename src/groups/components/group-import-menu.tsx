import { Button, Divider, Drawer, Group, LoadingOverlay, Progress, Text, rem } from "@mantine/core";
import { groupStore } from "../../store/groupStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExcel } from "@fortawesome/free-solid-svg-icons";
import { Dropzone, MIME_TYPES, MS_EXCEL_MIME_TYPE } from "@mantine/dropzone";
import { showNotification } from "@mantine/notifications";
import { useState } from "react";
import { ref, uploadBytesResumable, getStorage } from "firebase/storage";
import { firebaseApp } from "../../config";

type GroupImportMenu = {
  drawerOpened: boolean;
  setDrawerOpened: (value: boolean) => void;
};

function GroupImportMenu(props: GroupImportMenu) {
  const isMemberLoading = groupStore((state: any) => state.isMemberLoading);
  const group = groupStore((state: any) => state.group);
  const uid = groupStore((state: any) => state.uid);
  const isExporting = groupStore((state: any) => state.isExporting);
  const addMembersToGroupByExcel = groupStore((state: any) => state.addMembersToGroupByExcel);
  const exportMembersFromGroupByExcel = groupStore((state: any) => state.exportMembersFromGroupByExcel);
  const [progresspercent, setProgresspercent] = useState(100);
  const [fileError, setFileError] = useState <string | null>(null);
  const storage = getStorage(firebaseApp, import.meta.env.VITE_STORAGE_BUCKET_TEMP);
  const { setDrawerOpened, drawerOpened } = props;
  const errorMessage = groupStore((state: any) => state.errorMessage);

  return (
    <Drawer
      opened={drawerOpened}
      onClose={() => setDrawerOpened(false)}
      title="Import Members to Group"
      padding="xl"
      size="xl"
      position="right"
      closeOnClickOutside={true}
    >
      <LoadingOverlay visible={isExporting} overlayBlur={2} />
      <Dropzone
        onDrop={(files) => {
          if (files.length > 1) {
            setFileError("Only one file can be uploaded at a time");
            showNotification({
              title: "File rejected",
              message: "Only one file can be uploaded at a time",
            });
          }
          const file = files[0];
          let formData = new FormData();
          formData.append("group_id", group.id);
          formData.append("file", file);
          const storedName = `${file.name}`;
          const storageRef = ref(
            storage,
            `tempfiles/${group.id}/${storedName}`
          );
          const uploadTask = uploadBytesResumable(storageRef, file);

          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress = Math.round(
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              );
              setProgresspercent(progress);
            },
            (error) => {
              alert(error);
            },
            async () => {
              const check = await addMembersToGroupByExcel(
                {
                  org_id: uid,
                  group_id: group.id,
                  file_name: storedName,
                },
                group.id
              );
              console.log(`check:`);
              console.log(check);
              if (check) {
                setDrawerOpened(false);
              } else {
                setFileError("File is not in correct format");
                showNotification({
                  title: "File rejected",
                  message: "File is not in correct format",
                  color: "red",
                });
              }
            }
          );
        }}
        onReject={(files) => {
          setFileError("File size is too big");
          showNotification({
            title: "File rejected",
            message: "File size is too big",
            color: "red",
          });
        }}
        maxSize={3 * 1024 ** 2 * 2}
        accept={MS_EXCEL_MIME_TYPE}
        {...props}
      >
        <Group
          position="center"
          spacing="xl"
          style={{ minHeight: rem(220), pointerEvents: "none" }}
        >
          <Dropzone.Accept>
            <FontAwesomeIcon icon={faFileExcel} />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <div className="flex-column">
              <FontAwesomeIcon icon={faFileExcel} />
              <span color="red">{fileError}</span>
            </div>
          </Dropzone.Reject>
          <Dropzone.Idle>
            {progresspercent !== 100 && (
              <Progress
                className="w-100"
                value={progresspercent}
                animate={true}
              />
            )}
          </Dropzone.Idle>
          <div className="flex-column align-items-center align-justify-center">
            <Text ta="center" size="xl" inline>
              DRAG EXCEL HERE OR CLICK TO SELECT A FILE
            </Text>
            <Text ta="center" size="sm" color="dimmed" inline mt={7}>
              Attach Excel File where Columns Email, Special Identifer, First Name, Last Name, 10mb
            </Text>
            <Text ta="center" size="sm" color="dimmed" inline mt={7}>
              or
            </Text>
            <Text ta="center" size="sm" color="dimmed" inline mt={7}>
              Attach Excel File where Columns Email, Special Identifer, Full
              Name 10mb
            </Text>
            <br />
            <Text ta="center" size="sm" color="dimmed" inline mt={7}>
              Important: Email Address is the only one that is important and required for application to work. So, you can have only one column.
            </Text>
          </div>
        </Group>
      </Dropzone>
      <br />
      <Divider />
      <br />
      <Button
        size="lg"
        className="m-2"
        leftIcon={<FontAwesomeIcon icon={faFileExcel} />}
        fullWidth
        onClick={() => exportMembersFromGroupByExcel(group.id)}
        loading={isMemberLoading}
      >
       Download Excel Sheet
      </Button>
    </Drawer>
  );
}

export default GroupImportMenu;
