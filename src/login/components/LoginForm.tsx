import { faGoogle, faFacebook, faGithub } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope, faLock, faSignIn } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Card, Divider, Group, PasswordInput, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import _ from "lodash";
import { ReactElement } from "react";

export interface ILoginFormProps {
    onSubmit: (values: any) => void;
    logo: ReactElement;
    setSignUp: () => any;
    setForgetPassword: () => any;
    signWithGoogle: () => any;
    signWithFacebook: () => any;
    signWithGithub: () => any;
    setEmail: (email: string) => any;
}

export default function LoginForm (props: ILoginFormProps) {
    const form = useForm({
        initialValues: { 
            email: '',
            password: '',
        },
        validate: {
            email: (value: string) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
        },
    });
    
    return (
        <>
        {props.logo}
            <Card.Section p="sm" className="d-flex flex-column align-items-start">
                <div className="align-self-center"></div>
                <h1>Sign In</h1>
            </Card.Section>
            <Divider />
            <Group className="w-100">
                <form onSubmit={form.onSubmit((values) => props.onSubmit(values))} className="w-100">
                    <TextInput type='email'
                        label="Email Address"
                        required
                        typeof="email"
                        icon={<FontAwesomeIcon icon={faEnvelope} />}
                        placeholder="Enter your email"
                        {...form.getInputProps('email')} 
                        onBlur={(e: any) => props.setEmail(e.target.value)}
                        />
                    <TextInput
                        required
                        label="Password"
                        icon={<FontAwesomeIcon icon={faLock} />}
                        placeholder="Enter your password"
                        type="password"
                        {...form.getInputProps('password')}
                    />
                    <Button 
                        className="w-100 mt-3"
                        type="submit"
                        radius={20}
                        leftIcon={<FontAwesomeIcon icon={faSignIn} />}
                        color="red">Sign In</Button>
                </form>
            </Group>
            <Group className="d-flex flex-row flex-wrap" mt="sm" >
                <Button className="flex-grow-1" color="orange" compact onClick={props.setForgetPassword}>Forgot Password</Button>
                <Button className="flex-grow-1" color="green" compact onClick={props.setSignUp}>Create Account</Button>
            </Group>
            <br />
            <Divider />
            <Divider />
            <Group m="sm" className="d-flex justify-content-center">
                <Button 
                leftIcon={<FontAwesomeIcon icon={faGoogle} />}
                onClick={props.signWithGoogle}
                className="flex-grow-1"
                color="red">Sign In with Google</Button>
                {/* <Button remove for now
                leftIcon={<FontAwesomeIcon icon={faFacebook} />}
                onClick={props.signWithFacebook}
                className="flex-grow-1"
                color="blue">Sign In with Facebook</Button> */}
                <Button 
                leftIcon={<FontAwesomeIcon icon={faGithub} />}
                onClick={props.signWithGithub}
                className="flex-grow-1"
                color="gray">Sign In with Github</Button>
            </Group>
        </>
    );
}
