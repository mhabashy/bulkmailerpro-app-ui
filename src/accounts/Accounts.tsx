import { faAdd, faEdit, faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ActionIcon, Box, Button, Card, Tooltip, Text, Drawer } from "@mantine/core";
import _ from "lodash";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "reactfire";
import { AppLoader } from "../components/AppLoader";
import { CommonHeader } from "../components/CommonHeader";
import ConfirmButton from "../components/ConfirmButton";
import { EmptyState } from "../components/EmptyState";
import { IAccount } from "../modals/accounts.modals";
import { accountStore } from "../store/accountStore";
import { textDescriptions } from "../untils/text-descriptions";
import { CreateAccounts } from "./components/CreateAccounts";

export const Accounts = () => {
  const { data: user} = useUser();
  const navigate = useNavigate();
  const accounts = accountStore((state: any) => state.accounts);
  const isLoading = accountStore((state: any) => state.isLoading);
  const getAccounts = accountStore((state: any) => state.getAccounts);
  const deleteAccount = accountStore((state: any) => state.deleteAccount);
  const setToDefault = accountStore((state: any) => state.setToDefault);
  const [openAdd, setOpenAdd] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      getAccounts();
    }
  }, [user]);

  return (
    <>
      <Drawer opened={openAdd} 
        position="right"
        padding="md"
        size="xl"
        onClose={() => setOpenAdd(false)}>
        <CreateAccounts close={() => setOpenAdd(false)} />
      </Drawer>
      <CommonHeader title="Accounts">
        <Button
          leftIcon={<FontAwesomeIcon icon={faAdd} />}
          color="green"
          onClick={() => {
            setOpenAdd(true);
          }}
          size="xs"
        >
          Add Account
        </Button>
      </CommonHeader>
      {textDescriptions.accounts['en-US']}
      {isLoading ? (
        <AppLoader />
      ) : accounts.length > 0 ? (
        <Box pt="md">
          {accounts.map((account: IAccount) => (
            <Card
              key={account.id}
              p="md"
              shadow="xs"
              radius="xs"
              className="d-flex flex-row justify-content-between align-items-center mb-3"
            >
              <div className="d-flex flex-row align-items-center">
                {account.default && (
                  <Tooltip label="Default Account" className="mr-2">
                    <FontAwesomeIcon icon={faStar} color="orange" />
                  </Tooltip>
                )}
                <Text 
                  className="ml-1"
                  onClick={() => navigate(`/accounts/edit/${account.id}`)} style={{'cursor': 'pointer'}}>
                  {account.name}
                </Text>
              </div>
              <div className="d-flex flex-row">
                {!account.default && (
                  <ActionIcon
                    color="orange"
                    variant="filled"
                    className="mr-2"
                    onClick={() => setToDefault(account.id)}
                  >
                    <FontAwesomeIcon icon={faStar} />
                  </ActionIcon>
                )}
                <ConfirmButton
                  iconOnly={true}
                  size="sm"
                  onConfirm={() => deleteAccount(account)}
                />
                <ActionIcon
                  onClick={() => navigate(`/accounts/edit/${account.id}`)}
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
          <h2>No Email Accounts Found!</h2>
          <Button
            leftIcon={<FontAwesomeIcon icon={faAdd} />}
            size="xs"
            m="md"
            color="green"
            onClick={() => setOpenAdd(true)}
          >
            Add Email Account
          </Button>
        </EmptyState>
      )}
    </>
  );
}
