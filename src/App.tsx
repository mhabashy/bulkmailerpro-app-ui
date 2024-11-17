import { ColorScheme, ColorSchemeProvider, MantineProvider } from "@mantine/core"
import { useColorScheme, useHotkeys, useLocalStorage } from "@mantine/hooks";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, FirestoreProvider, StorageProvider, useFirebaseApp } from "reactfire";
import { Accounts } from "./accounts/Accounts";
import { CreateAccounts } from "./accounts/components/CreateAccounts";
import { EditAccounts } from "./accounts/components/EditAccount";
import Page404 from "./components/404";
import { Placeholder } from "./components/Placeholder";
import { Groups } from "./groups/Groups";
import { Home } from "./home/Home";
import { Login } from "./login/Login";
import { LoginIndex } from "./login/LoginIndex";
import { Settings } from "./settings/Settings";
import { userStore } from "./store/userStore";
import { Support } from "./support/Support";
import { CreateTemplate } from "./mail-templates/components/CreateTemplate";
import { EditTemplate } from "./mail-templates/components/EditTemplate";
import { Templates } from "./mail-templates/Templates";
import { ViewGroup } from "./groups/ViewGroup";
import { Notifications } from "@mantine/notifications";
import { Organizations } from "./organizations/Organizations";
import { BulkMailer } from "./bulkmailer/BulkMailer";
import { MailerLogs } from "./log/MailerLogs";
import AdvanceEditingGrapsJS from "./mail-templates/AdvanceEditingGrapesJS/AdvanceEditingGrapesJS";
import Unsubscribe from "./client/unsubscibe/Unsubscribe";
import AddSimpleSubscriberPage from "./client/add/AddSimpleSubscriberPage";
import AddAdvanceSubscriberPage from "./client/add/AddAdvanceSubscriberPage";

const App = () => {

  // COLOR SCHEME
  const preferredColorScheme = useColorScheme();
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: 'mantine-color-scheme',
    defaultValue: preferredColorScheme,
    getInitialValueInEffect: true,
  });
  const toggleColorScheme = (value?: ColorScheme) =>
  setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));
  useHotkeys([['mod+J', () => toggleColorScheme()]]);
  // END COLOR SCHEME

  const app = useFirebaseApp();
  const auth = getAuth(app);
  const storage = getStorage(app);
  const firestoreInstance = getFirestore(app);
  const uid = userStore((state: any) => state.uid);

  return (
    <AuthProvider sdk={auth}>
      <FirestoreProvider sdk={firestoreInstance}>
        {/* Might not need storage for all projects */}
        <StorageProvider sdk={storage}>
          <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
            <MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
                <Notifications />
                <BrowserRouter>
                  <Routes>
                    <Route path="/login" element={<LoginIndex />}>
                      <Route index element={<Login />} />
                    </Route>
                    <Route path="/unsubscribe/:orgId" element={<Unsubscribe />} />
                    <Route path="/add/simple" element={<Placeholder />} >
                      <Route />
                    </Route>
                    <Route path="/add/advance/:orgId/:groupId" element={<AddAdvanceSubscriberPage />} />
                    <Route path="/add/simple/:orgId/:groupId" element={<AddSimpleSubscriberPage />} />
                    {uid && <Route path="/" element={<Home />} >
                      <Route index element={<BulkMailer />} />
                      <Route path="/groups">
                        <Route index element={<Groups />} />
                        <Route path=":id" element={<ViewGroup />} />
                      </Route>
                      <Route path="/accounts" >
                        <Route index element={<Accounts />} />
                        <Route path="add" element={<CreateAccounts />} />
                        <Route path="edit/:id" element={<EditAccounts />} />
                      </Route>
                      <Route path="/templates" >
                        <Route index element={<Templates />} />
                        <Route path="add" element={<CreateTemplate />} />
                        <Route path="edit/:id" element={<EditTemplate />} />
                      </Route>
                      <Route path="/logs" element={<MailerLogs />} />
                      <Route path="/support" element={<Support />} />
                      <Route path="/organizations" element={<Organizations />} />
                      <Route path="/settings" element={<Settings />} />
                    </Route>}
                    {uid && <Route path="/advance-editor" element={<AdvanceEditingGrapsJS />} />}
                    {!uid && <Route path="/" element={<Navigate to="/login" />} />}
                    <Route path="*" element={<Page404 />} />
                  </Routes>
                </BrowserRouter>
            </MantineProvider>
          </ColorSchemeProvider>
        </StorageProvider>
      </FirestoreProvider>
    </AuthProvider>
  )
}

export default App
