import { faBuilding, faEnvelope, faEnvelopesBulk, faFileAlt, faFileInvoice, faGear, faMoon, faSignOut, faSun, faTicket, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AppShell, Burger, Text, Header, MediaQuery, Navbar, useMantineTheme, Divider, Avatar, ActionIcon, useMantineColorScheme, Tooltip, UnstyledButton, Group, Button } from '@mantine/core';
import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import ConfirmButton from '../components/ConfirmButton';
import { LogoRows } from '../components/LogoRow';
import { MyAvator } from '../components/MyAvator';
import { userStore } from '../store/userStore';
import { SelectCompany } from '../components/SelectCompany';
import { AcceptInviteToOrgModal } from './components/AcceptInviteToOrgModal';
import { DocumentData } from 'firebase/firestore';
import { textDescriptions } from '../untils/text-descriptions';

export const Home = () => {
  const theme = useMantineTheme();
  const signOutUser = userStore((state: any) => state.signOutUser);
  const { photoUrl, uid, defaultOrgUID} = userStore((state: any) => state);
  const [opened, setOpened] = useState(false);
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const getOrg = userStore((state: any) => state.getOrg);
  const navigate = useNavigate();
  let org: DocumentData;
  let lang: string = 'en-US';

  const goToUrl = (url: string) => {
    setOpened(false);
    navigate(url);
  }

  useEffect(() => { // MAYBE USE THIS LATER
    const fetchData = async () => {
      if (defaultOrgUID) {
        org = await getOrg(defaultOrgUID);
      }
    };

    fetchData();
  }, [defaultOrgUID] as const);

  return (
    <AppShell
      styles={{
        main: {
          background:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
      }}
      navbarOffsetBreakpoint="md"
      asideOffsetBreakpoint="sm"
      fixed
      navbar={
        <Navbar
          p="md"
          hiddenBreakpoint="sm"
          hidden={!opened}
          width={{ sm: 200, lg: 300 }}
        >
          {uid && <SelectCompany userUID={uid} currentOrgUID={defaultOrgUID} />}
          <Navbar.Section grow mt="md">
            <UnstyledButton className="w-100 mb-2" onClick={() => goToUrl("/")}>
              <Tooltip
                withArrow
                position='top'
                label={textDescriptions.bulkmailer[lang]}
              >
                <Group>
                  <Avatar size={40} color="blue">
                    <FontAwesomeIcon icon={faEnvelope} />
                  </Avatar>
                  <div>
                    <Text>Bulk Mailer</Text>
                  </div>
                </Group>
              </Tooltip>
            </UnstyledButton>
            <UnstyledButton
              className="w-100 mb-2"
              onClick={() => goToUrl("/groups")}
            >
              <Tooltip
                withArrow
                position='top'
                label={textDescriptions.groups[lang]}
              >
                <Group>
                  <Avatar size={40} color="blue">
                    <FontAwesomeIcon icon={faUsers} />
                  </Avatar>
                  <div>
                    <Text>Groups</Text>
                  </div>
                </Group>
              </Tooltip>
            </UnstyledButton>
            <UnstyledButton
              className="w-100 mb-2"
              onClick={() => goToUrl("/accounts")}
            >
              <Tooltip
                withArrow
                position='top'
                label={textDescriptions.accounts[lang]}
              >
                <Group>
                  <Avatar size={40} color="blue">
                    <FontAwesomeIcon icon={faEnvelopesBulk} />
                  </Avatar>
                  <div>
                    <Text>Accounts</Text>
                  </div>
                </Group>
              </Tooltip>
            </UnstyledButton>
            <UnstyledButton
              className="w-100 mb-2"
              onClick={() => goToUrl("/templates")}
            >
              <Tooltip
                withArrow
                position='top'
                label={textDescriptions.templates[lang]}
              >
                <Group>
                  <Avatar size={40} color="blue">
                    <FontAwesomeIcon icon={faFileInvoice} />
                  </Avatar>
                  <div>
                    <Text>Templates</Text>
                  </div>
                </Group>
              </Tooltip>
            </UnstyledButton>
            <UnstyledButton 
              className='w-100 mb-2'
              onClick={() => goToUrl('/organizations')}
            >
              <Tooltip
                withArrow
                position='top'
                label={textDescriptions.organizations[lang]}
              >
                <Group>
                  <Avatar size={40} color="blue">
                    <FontAwesomeIcon icon={faBuilding} />
                  </Avatar>
                  <div>
                    <Text>Organizations</Text>
                  </div>
                </Group>
              </Tooltip>
            </UnstyledButton>
            <UnstyledButton
              className="w-100 mb-2"
              onClick={() => goToUrl("/logs")}
            >
              <Tooltip
                withArrow
                position='top'
                label={textDescriptions.log[lang]}
              >
                <Group>
                  <Avatar size={40} color="blue">
                    <FontAwesomeIcon icon={faFileAlt} />
                  </Avatar>
                  <div>
                    <Text>Log</Text>
                  </div>
                </Group>
              </Tooltip>
            </UnstyledButton>
            <UnstyledButton
              className="w-100 mb-2"
              onClick={() => goToUrl("/support")}
            >
              <Tooltip
                withArrow
                position='top'
                label={textDescriptions.support[lang]}
              >
                <Group>
                  <Avatar size={40} color="blue">
                    <FontAwesomeIcon icon={faTicket} />
                  </Avatar>
                  <div>
                    <Text>Support</Text>
                  </div>
                </Group>
              </Tooltip>
            </UnstyledButton>
          </Navbar.Section>
          <Navbar.Section>
            <Divider />
            <div className="d-flex flex-row m-2 align-items-center flex-wrap">
              <MyAvator
                size="md"
                src={photoUrl}
                displayName={userStore((state: any) => state.displayName)}
              />
              <div className="d-flex flex-column m-2">
                <Text size="md" weight="bold">
                  {userStore((state: any) => state.displayName)}
                </Text>
                <Text size="xs" weight="bold">
                  {userStore((state: any) => state.email)}
                </Text>
              </div>
              <div className="d-flex flex-row flex-grow-1 justify-content-around align-items-center">
                <Tooltip
                    withArrow
                    label="Sign Out"
                  >
                  <Button
                    onClick={() => {
                      navigate('/login');
                      signOutUser();
                    }}
                    color="red"
                    compact
                    radius="xl"
                  >
                    <FontAwesomeIcon icon={faSignOut} /> Sign Out
                  </Button>
                </Tooltip>
                <Tooltip
                  withArrow
                  label="Change App Theme"
                >
                  <ActionIcon
                    variant="filled"
                    onClick={() => toggleColorScheme()}
                  >
                    <FontAwesomeIcon
                      icon={colorScheme == "dark" ? faSun : faMoon}
                    />
                  </ActionIcon>
                </Tooltip>
                <Tooltip
                  withArrow
                  label="User Settings"
                >
                  <ActionIcon
                    variant="filled"
                    color="secondary"
                    onClick={() => {
                      setOpened(false);
                      navigate("/settings");
                    }}
                  >
                    <FontAwesomeIcon icon={faGear} />
                  </ActionIcon>
                </Tooltip>
              </div>
              <Text size="xs" align="center" m="xl">
                &copy; {new Date().getFullYear()} by Angel Michael Dev Inc
                <br/>
                <br/>
              </Text>
            </div>
          </Navbar.Section>
        </Navbar>
      }
      header={
        <Header height={70} p="md">
          <div className="h-100 d-flex align-items-center justify-content-between">
            <div className="flex-grow-1 d-flex flex-row align-items-center">
              <MediaQuery largerThan="sm" styles={{ display: "none" }}>
                <Burger
                  opened={opened}
                  onClick={() => setOpened((o) => !o)}
                  size="sm"
                  color={theme.colors.gray[6]}
                  mr="xl"
                />
              </MediaQuery>
              <Text className="flex-grow-1 align-items-center mt-4">
                <div style={{ height: "50px", width: "200px" }}>
                  <LogoRows />
                </div>
              </Text>
            </div>
          </div>
          <AcceptInviteToOrgModal />
        </Header>
      }
    >
      <Outlet />
    </AppShell>
  );
}
