import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ActionIcon, Button, Center, Flex, Popover, Text } from "@mantine/core";
import { useState } from "react";

export interface IThemeSwitchProps {
  size: "xs" | "sm" | "md" | "lg";
  icon?: any;
  text?: string;
  color?:
    | "red"
    | "green"
    | "blue"
    | "yellow"
    | "purple"
    | "pink"
    | "orange"
    | "gray"
    | "black"
    | "white";
  loading?: boolean;
  message?: string;
  onConfirm: () => any;
  iconOnly?: boolean;
  compact?: boolean;
}

function ConfirmButton({
  size = "xs",
  icon,
  text,
  color,
  loading,
  message,
  onConfirm,
  iconOnly,
  compact,
}: IThemeSwitchProps) {
  const [opened, setOpened] = useState(false);

  return (
    <Popover
      opened={opened}
      onClose={() => setOpened(false)}
      position="top"
      transitionProps={{ transition: "pop" }}
      withArrow
      width="auto"
      withinPortal={true}
    >
      <Popover.Target>
        <Flex>
          {iconOnly ? (
            <ActionIcon
              variant="filled"
              onClick={() => setOpened((o) => !o)}
              loading={loading ?? false}
              color={color ?? "red"}
            >
              {icon ?? <FontAwesomeIcon icon={faTrash} />}
            </ActionIcon>
          ) : (
            <Button
              leftIcon={icon ?? <FontAwesomeIcon icon={faTrash} />}
              color={color ?? "red"}
              loading={loading ?? false}
              compact={compact}
              onClick={() => setOpened((o) => !o)}
            >
              {text ?? "Delete"}
            </Button>
          )}
        </Flex>
      </Popover.Target>
      <Popover.Dropdown>
        <Flex direction={"column"}>
          <Center>
            <Text className="mb-2">{message ?? "Confirm Delete?"}</Text>
          </Center>
          <div className="d-flex flex-row justify-content-between">
            <Button
              color="red"
              mr={2}
              size={size}
              onClick={() => setOpened(false)}
            >
              Cancel
            </Button>
            <Button
              color="green"
              size={size}
              onClick={() => {
                setOpened(false);
                onConfirm();
              }}
            >
              Yes
            </Button>
          </div>
        </Flex>
      </Popover.Dropdown>
    </Popover>
  );
}

export default ConfirmButton;
