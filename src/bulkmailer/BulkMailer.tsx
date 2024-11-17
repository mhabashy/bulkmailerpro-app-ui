import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useFirestore, useFirestoreDoc, useStorage, useUser } from "reactfire";
import { AppLoader } from "../components/AppLoader";
import { CommonHeader } from "../components/CommonHeader";
import { schemaMailer } from "../modals/bulkmailer.modals";
import { mailerStore } from "../store/mailerStore";
import { useForm, zodResolver } from "@mantine/form";
import { Alert, Box, Button, Card, Center, CloseButton, Drawer, Flex, List, Loader, MultiSelect, Select, TextInput, Textarea, ThemeIcon, Tooltip } from "@mantine/core";
import { IMember } from "../modals/groups.modals";
import EmailManager from "./components/email-manager/email-manager";
import _, { set } from "lodash";
import "./bulkmailer.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faCheckCircle, faClock, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { ScheduleModal } from "./components/schedule-modal/schedule-modal";
import HTMLEditor from "../components/html-editor/HTMLEditor";
import { IAttachment, IEmailPayload } from "./bulkmailer-interfaces";
import { MailerSetupLoader } from "./components/mailer-setup-loader/mailer-setup-loader";
import { showNotification } from "@mantine/notifications";
import dayjs from "dayjs";
import { ATTACHMENT_STATUS } from "../modals/attachents.modals";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import { firebaseApp } from "../config";
import { userStore } from "../store/userStore";
import { doc } from "firebase/firestore";
import { CreateAccounts } from "../accounts/components/CreateAccounts";
import { GroupAdd } from "../groups/components/group-add";

let body = "";

export const BulkMailer = () => {
  const { data: user} = useUser();
  const recipients = mailerStore((state: any) => state.recipients);
  const accounts = mailerStore((state: any) => state.accounts);
  const groups = mailerStore((state: any) => state.groups);
  const templates = mailerStore((state: any) => state.templates);
  const getAccountsGroupsTemplates = mailerStore((state: any) => state.getAccountsGroupsTemplates);
  const isLoading = mailerStore((state: any) => state.isLoading);
  const [openedEmailManager, setOpenedEmailManager] = useState(false);
  const getRecipients = mailerStore((state: any) => state.getRecipients);
  const submitMessage = mailerStore((state: any) => state.submitMessage);
  const checkedRecipients = (recipients?.filter((r: IMember) => r.checked));
  const [attachmentList, setAttachmentList] = useState<IAttachment[]>([]);
  const [openedSchedule, setOpenedSchedule] = useState(false);
  const [openLoading, setOpenLoading] = useState(false);
  const [bodyHTML, setHTML] = useState('');
  const defaultOrgUID = userStore((state: any) => state.defaultOrgUID);
  const firebase = useFirestore();

  const htmlInput = useRef<any>();

  const mrFirebase = doc(firebase, 'organizations', defaultOrgUID as string);
  const {status: orgLoadingStatus, data: org } = useFirestoreDoc(mrFirebase);
  const isSubscribed = orgLoadingStatus === 'success' && org && org.get('status') === 'active';
  const [openAddAccount, setOpenAddAccount] = useState(false);
  const [openAddGroup, setOpenAddGroup] = useState(false);

  const createForm = useForm({
    //@ts-ignore
    schema: zodResolver(schemaMailer),
    initialValues: {
      accountId: null,
      groupIds: [],
      subject: "",
      body: "",
    },
  });
  
  useEffect(() => {
    body = bodyHTML;
  }, [bodyHTML])

  const submitMailer = async (values: any) => {
    const getAccount = _.find(accounts, e => e.id === values.accountId);
    if (!isSubscribed) {
        showNotification({
            message: 'Subscription is inactive, please activate a subscription to send emails',
            title: 'Error',
        });
        return;
    }
    if (user && !user.emailVerified) {
        showNotification({
            message: 'Email not verified, please verify your email to send emails',
            title: 'Error',
        });
        return;
    }
    if (attachmentList.length > 0 && _.filter(attachmentList, e => e.status === ATTACHMENT_STATUS.PENDING).length > 0) {
        showNotification({
            message: 'Attachments are still uploading, please wait',
            title: 'Error',
        });
        return;
     }
    if (values['sentAt'] && dayjs(values['sentAt']).isBefore(dayjs())) {
        showNotification({
            message: 'Send at date cannot be in the past',
            title: 'Error',
        });
        return;
    }
    if (!getAccount) {
        showNotification({
            message: 'Account not found',
            title: 'Error',
        });
        return;
    }
    if (checkedRecipients.length === 0) {
        showNotification({
            message: 'No recipients selected',
            title: 'Error',
        });
        return;
    }
    if (body === '') {
        showNotification({
            message: 'Body is required',
            title: 'Error',
        });
        return;
    }
    if (values.subject === '') {
        showNotification({
            message: 'Subject is required',
            title: 'Error',
        });
        return;
    }
    const payload: IEmailPayload  = {
        from: getAccount.email,
        subject: values.subject,
        body,
        host: getAccount.host,
        port: getAccount.port,
        accountName: getAccount.name,
        sendAtString: values['sendAt'] ? values['sendAt'] : new Date().toISOString(),
        auth: {
            user: getAccount.username,
            password: getAccount.password,
        },
        hasUnsubscribe: true,
        to: [],
        attachments: attachmentList.map((a: IAttachment) => ({ path: a.path, filename: a.filename })),
        sendAt: values['sendAt'] ? values['sendAt'] : new Date().toISOString(),
    };
    setOpenLoading(true);
    submitMessage(payload);
  };

 useEffect(() => {
    const storage = getStorage(firebaseApp, import.meta.env.VITE_STORAGE_BUCKET);
    const orgId = localStorage.getItem('defaultOrgUID');
    const filesPending = _.filter(attachmentList, (e: IAttachment) => e.status === ATTACHMENT_STATUS.PENDING);
    _.forEach(filesPending, (v: IAttachment, index: number) =>{
        const tempFileName = `${v.filename.split('.')[0]}-${new Date().getTime()}.${v.filename.split('.')[1]}`;
        uploadBytes(ref(storage, `${orgId}/${tempFileName}`), v.file).then((t: any) => {
            attachmentList[index].status = ATTACHMENT_STATUS.COMPLETED;
            attachmentList[index].path = `${import.meta.env.VITE_TEMP_FILE_PATH}/${orgId}/${tempFileName}`;
        }).catch((e: any) => {
            attachmentList[index].status = ATTACHMENT_STATUS.FAILED;
        }).finally(() => {
            setAttachmentList(_.cloneDeep(attachmentList));
        });
    });
  }, [attachmentList]);

  const addAttachment = async (files: IAttachment[]) => {
    setAttachmentList([...attachmentList, ...files]);
  };

  useEffect(() => {
    if (user) {
        getAccountsGroupsTemplates();
    }
  }, [user]);
  
  useEffect(() => {
    if (accounts.length > 0) {
        const defaultAccount = _.find(accounts, e => e.default);
        createForm.setFieldValue("accountId", defaultAccount.id);
    }
  }, [accounts]);

  useEffect(() => {
      if (groups.length > 0) {
          const defaultGroups = _.filter(groups, e => e.default) as IMember[];
          const defaultGroupIds = _.map(defaultGroups, e => e.id) as never[];  
          createForm.setFieldValue("groupIds", defaultGroupIds);
          getRecipients(defaultGroupIds);
      }
  }, [groups]);

  useEffect(() => {
    if (templates.length > 0) {
        const defaultTemplate = _.find(templates, e => e.default);
        if (defaultTemplate) {
            createForm.setFieldValue("templateId", defaultTemplate.id);
            createForm.setFieldValue("subject", defaultTemplate.subject);
            setHTML(defaultTemplate.body);
        }
    }
  }, [templates])

  const CloseAttachmentButton = (props: any) => {
    return (
        <Tooltip label="Remove Attachment" offset={10} position="right">
            <CloseButton onClick={props.onClick} color="red" />
        </Tooltip>
    );
  };

  const removeAttachmentFromList = (index: number) => {
    const newAttachmentList = _.cloneDeep(attachmentList);
    newAttachmentList.splice(index, 1);
    setAttachmentList(newAttachmentList);
  };

  const SendButtons = () => {
    return <><Flex
                                    gap={10}
                                    direction={{ xxxs: 'column', xxs: 'column', xs: 'column', sm: 'column', md: 'row', lg: 'row', xl: 'row' }}
                                    justify={{ xxxs: 'center', xxs: 'center', xs: 'center', sm: 'center', md: 'start', lg: 'start', xl: 'start'}}
                                >
                                    <Button
                                        type="submit"
                                        color="blue"
                                        disabled={!isSubscribed}
                                        leftIcon={<FontAwesomeIcon icon={faPaperPlane} />}
                                        fullWidth={true}
                                    >
                                        Send
                                    </Button>
                                    <Button
                                        type="button"
                                        leftIcon={<FontAwesomeIcon icon={faCalendarAlt} />}
                                        color="green"
                                        disabled={!isSubscribed}
                                        onClick={() => {
                                            // if (_.isNil(subject) || subject === '') {
                                            //     showNotification({
                                            //         message: 'Subject is required',
                                            //         title: 'Error',
                                            //     });
                                            // }  else if (_.filter(recipients, e => e.active).length === 0) {
                                            //     showNotification({
                                            //         message: 'No recipients selected',
                                            //         title: 'Error',
                                            //     });
                                            // } else {
                                            setOpenedSchedule(true);
                                            // }
                                        }}
                                    >
                                        Schedule
                                    </Button>
                                </Flex>
    </>;
  }


  const AlertSubscription = () => {
    if (orgLoadingStatus === 'loading' || isSubscribed) {
        return <></>;
    }
    return <Alert color="red" title="Subscription Inactive">
                                    Your subscription is inactive. Please activate a subscription to send emails.
                                    &nbsp; <Link to="/organizations" target="_blank">Activate Subscription</Link>
                                </Alert>;
  }

  const AlertNotVerfied = () => {
    if (user && !user.emailVerified) {
        return <Alert color="red" title="Email Not Verified" m="sm">
            Your email is not verified. Email should gone out to your email box (Please check your spam). Please verify your email to continue sending emails.
            &nbsp; <Link to="/settings" target="_blank">Verify Email</Link>
        </Alert>;
    }
    return <></>;
  }

  
  return (
    <>
        <CommonHeader title="Mailer"></CommonHeader>
        {
            isLoading ? (
                <AppLoader />
            ) : (
                <>
                    <Drawer
                        opened={openedEmailManager}
                        title="Email Manager"
                        onClose={() => setOpenedEmailManager(false)}
                        padding="md"
                        size="xl"
                    >
                        <EmailManager />
                    </Drawer>
                    <Drawer
                        opened={openAddAccount}
                        onClose={() => {setOpenAddAccount(false); getAccountsGroupsTemplates();}}
                        padding="md"
                        size="xl"
                        position="right"
                    >
                        <CreateAccounts close={() => {setOpenAddAccount(false); getAccountsGroupsTemplates();}} />
                    </Drawer>
                    <GroupAdd
                        drawerOpened={openAddGroup}
                        drawerOnClose={() => {setOpenAddGroup(false); getAccountsGroupsTemplates();}}
                    />
                    <ScheduleModal 
                        opened={openedSchedule} 
                        setOpened={setOpenedSchedule} 
                        submitForm={(scheduleValues: any) => {
                            console.log('Schedule Values: ', scheduleValues);
                            const receivedDate =  (scheduleValues.date).toISOString().split('T')[0];
                            const setDateTime = dayjs(receivedDate).set('hour', scheduleValues.time.slice(0,2)).set('minute', scheduleValues.time.slice(3));
                            setOpenedSchedule(false);
                            console.log('Scheduled at: ', setDateTime.toISOString());
                            submitMailer({
                                accountId: createForm.values.accountId,
                                body,
                                subject: createForm.values.subject,
                                groupIds: createForm.values.groupIds,
                                sendAt: setDateTime.toISOString(),
                            });
                        }}
                    />
                    <MailerSetupLoader opened={openLoading} setOpened={setOpenLoading}    />
                    <AlertNotVerfied />
                    {accounts.length === 0 && <Alert color="red" title="No Accounts Found" m="sm">No accounts found. Please create an account to continue. <a href="#" onClick={() => setOpenAddAccount(true)}>Create An Account</a> </Alert>}
                    {groups.length === 0 && <Alert color="red" title="No Groups Found" m="sm">No groups found. Please create a group email recipient to continue. <a href="#" onClick={() => setOpenAddGroup(true)} >Create A Group</a></Alert>}
                    <Box pl="sm" pr="sm" pb="sm">
                        <AlertSubscription />
                    </Box>
                    <form 
                        onSubmit={createForm.onSubmit((values) => submitMailer({
                            ...values,
                            accountId: values.accountId,
                            body,
                            subject: values.subject,
                            groupIds: values.groupIds,
                        }))}
                        className="m-2">
                        <Select
                            label="Email Account"
                            placeholder="Select Email Account"
                            data={
                                accounts.map((account: any) => ({
                                    value: account.id,
                                    label: `${account.name} <${account.email}>`,
                                }))
                            }
                            required
                            {...createForm.getInputProps("accountId")}
                        />
                        {templates.length > 0 && 
                            <Select
                                label="Template"
                                placeholder="Select Template"
                                data={
                                    templates.map((template: any) => ({
                                        value: template.id,
                                        label: template.name,
                                    }))
                                }
                                required
                                {...createForm.getInputProps("templateId")}

                                onChange={(value) => {
                                    const selectedTemplate = _.find(templates, e => e.id === value);
                                    if (selectedTemplate) {
                                        createForm.setFieldValue("subject", selectedTemplate.subject);
                                        setHTML(selectedTemplate.body);
                                        createForm.setFieldValue("templateId", value);
                                    }
                                }}
                            />
                        }
                        <MultiSelect
                            data={
                                groups.map((group: any) => ({
                                    value: group.id,
                                    label: group.name,
                                }))
                            }
                            label="Group"
                            placeholder="Select Group"
                            required
                            {...createForm.getInputProps("groupIds")}
                            onChange={(value) => {
                                createForm.setFieldValue("groupIds", value as never[]);
                                getRecipients(value as never[]);
                            }}
                        />
                        <Textarea 
                            label={"Recipients ( "  + checkedRecipients.length + " )"}
                            placeholder="Recipients"
                            value={
                                _.join(_.map(checkedRecipients, e =>  `${e.fullName} <${e.email}>`), ', ')
                            }
                            readOnly
                        />
                        <a href="#" className="small-link" onClick={() => setOpenedEmailManager(true)}>Edit Recipients</a>
                        <TextInput
                        placeholder="Subject"
                        label="Subject"
                        required
                        {...createForm.getInputProps("subject")}
                        />
                        {attachmentList.length > 0 && (
                        <Card shadow="xs" padding="md" radius="md" className="mt-2 mb-2">
                            <List
                                spacing="xs"
                                size="sm"
                                icon={
                                    <ThemeIcon color="blue" size={24} radius="xl">
                                        <FontAwesomeIcon icon={faClock} />
                                    </ThemeIcon>
                                }
                                className="w-100"
                            >
                            {attachmentList.map((a: IAttachment, index: number) => (
                                <List.Item
                                    icon={ a.status === ATTACHMENT_STATUS.COMPLETED ?
                                        <ThemeIcon color="teal" size={24} radius="xl">
                                            <FontAwesomeIcon icon={faCheckCircle} />
                                        </ThemeIcon> : null
                                    }
                                    key={`attachment-${index}`}
                                >
                                    <div className="d-flex flex-row justify-content-between align-items-center">
                                        <div className="w-100">{a.filename}</div>
                                        <CloseAttachmentButton onClick={() => removeAttachmentFromList(index)} />
                                    </div>
                                </List.Item>
                            ))}
                            </List>
                        </Card>
                        )}
                        <HTMLEditor
                            allowAttachments={true} 
                            permanent={false}
                            html={bodyHTML}
                            ref={htmlInput}
                            setContent={(value: any) => {
                                body = value;
                                
                            }}
                            attachment={(files: any) => addAttachment(files)}
                            />
                        <br/>
                            {
                                orgLoadingStatus === 'loading' ? <Loader /> :
                                orgLoadingStatus === 'error' ? <p>Error loading data</p> :
                                orgLoadingStatus === 'success' && org.get('status') === 'active' ?
                                <SendButtons />:
                                <Flex direction="column">
                                    <AlertSubscription />
                                    <br/>
                                    <SendButtons />
                                </Flex>
                            }
                    </form>
                </>
            )
        }
    </>
  );
};
