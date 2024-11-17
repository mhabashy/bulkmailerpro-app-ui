import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, CheckIcon, Checkbox, Divider, List, Modal, Switch, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import _ from "lodash";
import { useEffect, useState } from "react";
// import mailerSlice, { selectMailer } from "../../store/mailer.slice";
import './email-manager.scss';
import { mailerStore } from "../../../store/mailerStore";

function EmailManager(params: any) {
    const recipients = mailerStore((state: any) => state.recipients);
    const changeChecked = mailerStore((state: any) => state.changeChecked);
    const [ opened, setOpened ] = useState(false);
    const [ isFullName , setIsFullName ] = useState(true);
    const addRecipient = mailerStore((state: any) => state.addRecipient);
    const [viewListRecipients, setViewListRecipients] = useState([] as any[]); 
    const [searchPharse, setSearchPharse] = useState('');

    useEffect(() => {
      setViewListRecipients(recipients);
    }, [recipients]);

    useEffect(() => {
      const temp = _.filter(recipients, e => e.fullName.includes(searchPharse) || e.email.includes(searchPharse));
      setViewListRecipients(temp);
    }, [searchPharse, recipients]);

    const form = useForm({
      initialValues: { 
        firstName: '',
        lastName: '',
        fullName: '',
        email: '',
      },
    
      validate: {
        email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      },
    });
    
    const save = () => {
      const recipient = _.find(recipients, e => e.email === form.values.email);
      if (recipient) {
        alert("This email already exists");
        return;
      }
      const tempRecipient = form.values;
      if (isFullName) {
        tempRecipient.firstName = form.values.fullName.split(" ")[0];
        tempRecipient.lastName = form.values.fullName.split(" ")[-1];
        addRecipient({...tempRecipient, checked: true});
      } else {
        const fullName = `${form.values.firstName} ${form.values.lastName}`;
        addRecipient({...form.values, fullName, checked: true});
      }
      setOpened(false);
    }


    return (
        <>
            <Modal
                opened={opened}
                onClose={() => setOpened(false)}
                title="Add Recipient"
                padding="xl"
                size="xl"
            >
                <form onSubmit={form.onSubmit(() => save())}>
                    <Switch 
                      label="Use Full Name"
                      checked={isFullName}
                      onChange={(event) => setIsFullName(event.currentTarget.checked)} />
                    <Divider className="mt-2 mb-2"></Divider>
                    <TextInput
                      placeholder="Email Address"
                      label="Email Address"
                      required
                      {...form.getInputProps('email')}
                    />
                    {isFullName && 
                    <TextInput
                      placeholder="Full Name"
                      label="Full Name"
                      {...form.getInputProps("fullName")}
                    />}
                    {!isFullName && <>
                        <TextInput
                        placeholder="First Name"
                        label="First Name"
                        {...form.getInputProps("firstName")}
                        />
                        <TextInput
                        placeholder="Last Name"
                        label="Last Name"
                        {...form.getInputProps("lastName")}
                        />
                    </>}
                    <br/>
                    <Button 
                      leftIcon={<FontAwesomeIcon icon={faAdd} />} 
                      color="color"
                      type="submit"
                      className="w-100"
                    >
                      Add Recipient
                    </Button>
                </form>
            </Modal>
            <div className="email-manager">
                <Button 
                  leftIcon={<FontAwesomeIcon icon={faAdd} />} 
                  color="color"
                  onClick={() => setOpened(true)}
                  className="mb-2"
                >
                  Add Recipient
                </Button>
                <Divider />
                <TextInput
                  placeholder="Search"
                  label="Search"
                  required
                  onChange={(event) => setSearchPharse(event.currentTarget.value)}
                />
                <br />
                <List
                    spacing="xs"
                    size="sm"
                    center
                    icon={<CheckIcon />}
                >
                    {viewListRecipients.map((element: any, index: number) => 
                        <List.Item key={`mailer-item-${index}`}>
                            <Checkbox
                                checked={element.checked}
                                onChange={(e: any) => {
                                  changeChecked(element.id, e.currentTarget.checked);
                                }}
                                label={`${element.fullName} - ${element.email}`}
                            /> 
                        </List.Item>
                    )} 
                </List>
            </div>
        </>
    )
}

export default EmailManager;