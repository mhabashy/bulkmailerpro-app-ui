import { Card } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { createUserWithEmailAndPassword, FacebookAuthProvider, GithubAuthProvider, GoogleAuthProvider, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, UserCredential } from "firebase/auth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "reactfire";
import { AppLoader } from "../components/AppLoader";
import { LogoRows } from "../components/LogoRow";
import { LOGIN_MODES } from "../modals/login.modals";
import { userStore } from "../store/userStore";
import ForgetPassword from "./components/ForgetPassword";
import LoginForm from "./components/LoginForm";
import { SignUpForm } from "./components/SignUpForm";
import { useSearchParams } from "react-router-dom";

export const Login = () => {
    const isLoading: boolean  = userStore((state: any) => state.isLoading);
    const setLoading = userStore((state: any) => state.setIsLoading);
    const setSignUser = userStore((state: any) => state.setSignUser);
    const [loginMode, setLoginMode] = useState<LOGIN_MODES>(LOGIN_MODES.LOGIN);
    const [searchParams] = useSearchParams();
    const [email, setEmail] = useState<string>('');
    const auth = useAuth();
    const navigate = useNavigate();
 

    console.log(`Env: ${import.meta.env.VITE_PROJECT_ID}`)

    const handleSubmit = async (values: any) => {

        try {
            setLoading(true);
            const displayName = (values?.user?.displayName || values.displayName);     
            const res = await setSignUser(displayName, values?.user?.accessToken,
                        values?.user?.uid, values?.user?.photoURL, (values?.user?.email || values.email));
            showNotification(
                {
                    title: 'Success',
                    message: `Welcome ${res.displayName}`,
                }
            );
            setTimeout(() => {
                /// DON'T USE navigate() here, it will cause error and using a timer just in case
                window.location.href = '/';
            }, 1000);
        } catch (e: any) {
            setLoading(false);
            showNotification({
                message: e.message,
                typeof: 'error',
            });
        }
    }

    const login = async (values: any) => {
        try {
            setLoading(true);
            const res: UserCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
            await handleSubmit({ ...res, ...values });
        } catch (e: any) {
            let message = "";
            switch (e.code) {
                case "auth/invalid-password":
                    message = "Password provided is not corrected";
                    break;
                case "auth/invalid-email":
                    message = "Email provided is invalid";
                    break;
                case "auth/user-not-found":
                    message = "Email not found!";
                    break;
                default:
                    message = "Invalid Email/Password";
            }
            setLoading(false);
            showNotification({
                message,
                title: 'Error',
            });
        }
    }

    // Sign with Google
    const signWithGoogle = async () => {
        try {
            const res = await signInWithPopup(auth, new GoogleAuthProvider());
            await handleSubmit(res);
        } catch (e: any) {
            showNotification({
                message: e.message,
                title: 'Error',
            });
        }
    }

    // Sign With Facebook
    const signWithFacebook = async () => {
        try {
            const res = await signInWithPopup(auth, new FacebookAuthProvider());
            await handleSubmit(res);
        } catch (e: any) {
            showNotification({
                message: e.message,
                title: 'Error',
            });
        }
    }

    // Sign With Github
    const signWithGithub = async () => {
        try {
            const res = await signInWithPopup(auth, new GithubAuthProvider());
            await handleSubmit(res);
        } catch (e: any) {
            showNotification({
                message: e.message,
                title: 'Error',
            });
        }
    }

    // Set Login Mode
    const goBackToLogin = () => {
        setLoginMode(LOGIN_MODES.LOGIN);
    }

    // Create Firebase email/password user
    const createUser = async (values: any) => {
        let res: UserCredential;
        try {
            setLoading(true);
            res = await createUserWithEmailAndPassword(auth, values.email, values.password);
            await sendEmailVerification(res.user);
            await handleSubmit({ ...res, ...values });
            navigate('/');
        } catch (e: any) {
            setLoading(false);
            showNotification({
                message: e.message.replace("Firebase:", ""),
                title: 'Error',
            });
        }
    }

    // Forget Password with Firebase
    const forgetPassword = async (values: any) => {
        try {
            setLoading(true);
            await sendPasswordResetEmail(auth, values.email);
            setLoading(false);
            showNotification({
                message: `Password reset email sent to ${values.email}`,
                title: 'Success',
            });
            goBackToLogin();
        } catch (e: any) {
            setLoading(false);
            showNotification({
                message: e.message,
                title: 'Error',
            });
        }
    }

    useEffect(() => {
        if (searchParams.get('email')) {
            setEmail(searchParams.get('email') || '');
        }
        if (searchParams.get('org') && searchParams.get('pending') && searchParams.get('email')) {
            localStorage.setItem('pendingOrg', searchParams.get('org') || '');
            localStorage.setItem('pendingId', searchParams.get('pending') || '');
            localStorage.setItem('pendingEmail', searchParams.get('email') || '');
        }
    }, [searchParams]);

    return (
        <>
        {isLoading ? <AppLoader /> :
        <Card shadow="xl" p="lg" m="lg" style={{ width: 700, margin: 'auto' }}>
          {loginMode == LOGIN_MODES.LOGIN && <LoginForm
                                                logo={<LogoRows />}
                                                onSubmit={login}
                                                setForgetPassword={() => setLoginMode(LOGIN_MODES.FORGOT_PASSWORD)}
                                                setSignUp={() => setLoginMode(LOGIN_MODES.SIGNUP)}
                                                setEmail={setEmail}
                                                signWithGoogle={signWithGoogle}
                                                signWithFacebook={signWithFacebook}
                                                signWithGithub={signWithGithub}
                                              />}
          {loginMode == LOGIN_MODES.SIGNUP && <SignUpForm logo={<LogoRows />} email={email} onSubmit={createUser} goBack={goBackToLogin} />}
          {loginMode == LOGIN_MODES.FORGOT_PASSWORD && <ForgetPassword logo={<LogoRows />} email={email} onSubmit={forgetPassword}  goBack={goBackToLogin}  />}
        </Card> }
        </>
    );
}
