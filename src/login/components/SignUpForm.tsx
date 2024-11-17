import { faArrowLeft, faCancel, faCheck, faEnvelope, faLock, faSignIn, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Card, Divider, Group, TextInput, Text, Box, Popover, PasswordInput, Progress } from '@mantine/core';

import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { useState } from 'react';
import { PasswordRequirement, getStrength, requirementsPassword } from '../../untils/PasswordWithRequirement';

export interface ISignUpFormProps {
    goBack: () => void;
    onSubmit: (values: any) => void;
    logo: any;
    email?: string;
    password?: string;
}

export function SignUpForm (props: ISignUpFormProps) {
    const [popoverOpened, setPopoverOpened] = useState(false);
    const [value, setValue] = useState('');

    const checks = requirementsPassword.map((requirement, index) => (
      <PasswordRequirement key={index} label={requirement.label} meets={requirement.re.test(value)} />
    ));

    const strength = getStrength(value);
    const color = strength === 100 ? 'teal' : strength > 50 ? 'yellow' : 'red';

    const form = useForm({
      initialValues: {
        displayName: '',
        email: props.email || '',
        password: '',
        confirmPassword: '',
      },
      validate: {
        email: (value: string) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email')
      },
    });
    
    return (
        <>
            {props.logo}
            <Card.Section p="sm" className="d-flex flex-column align-items-start">
                <Button 
                  leftIcon={<FontAwesomeIcon icon={faArrowLeft} />} 
                  onClick={() => props.goBack()}
                  size="xs"
                  color="red"
                >
                  Go Back
                </Button>
                <h1>Sign Up</h1>
            </Card.Section>
            <Divider />
            <Group className="w-100">
                <form onSubmit={form.onSubmit((values) => {
                    const { password, confirmPassword } = values;
                    if (strength !== 100) {
                        showNotification({
                            message: 'Invalid Password',
                            title: 'Password is not strong enough.',
                            typeof: 'error'
                        });
                        return;
                    }
                    if (confirmPassword !== password) {
                        showNotification({
                            message: 'Password does not match',
                            title: 'Password Error',
                            typeof: 'error'
                        });
                        return;
                    }
                    // const payload = {
                    //     ...values,
                    //     password: passwordStrength,
                    // };
                    props.onSubmit(values);
                })} className="w-100">
                    <TextInput type='text' 
                        label="Full Name"
                        required
                        typeof="displayName"
                        icon={<FontAwesomeIcon icon={faUserCircle} />}
                        placeholder='Enter your full name'
                        {...form.getInputProps('displayName')}  />
                    <TextInput type='email' 
                        label="Email Address"
                        required
                        placeholder='Enter your email'
                        icon={<FontAwesomeIcon icon={faEnvelope} />}
                        typeof="email"
                        {...form.getInputProps('email')}  />
                    <Popover opened={popoverOpened} position="bottom" width="target" transitionProps={{ transition: 'pop' }}>
                        <Popover.Target>
                        <div
                            onFocusCapture={() => setPopoverOpened(true)}
                            onBlurCapture={() => setPopoverOpened(false)}
                        >
                        <PasswordInput
                            withAsterisk
                            label="Your password"
                            placeholder="Your password"
                            required
                            {...form.getInputProps('password')}
                            onChange={(e) => {
                                setValue(e.target.value);
                                form.setFieldValue('password', e.target.value);
                            }}
                            />
                        </div>
                        </Popover.Target>
                        <Popover.Dropdown>
                        <Progress color={color} value={strength} size={5} mb="xs" />
                        <PasswordRequirement label="Includes at least 6 characters" meets={value.length > 5} />
                        {checks}
                        </Popover.Dropdown>
                    </Popover>
                     <PasswordInput
                        placeholder="Confirm Password"
                        label="Confirm Password"
                        required
                        {...form.getInputProps('confirmPassword')}
                    />
                     
                    <Button type="submit" 
                            leftIcon={<FontAwesomeIcon icon={faSignIn} />} color="red"
                            className='mt-2 w-100'
                            >Sign Up</Button>
                </form>
            </Group>
        </>
    );
}
