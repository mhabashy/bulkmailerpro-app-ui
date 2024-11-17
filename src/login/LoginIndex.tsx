import { Center, useMantineColorScheme } from "@mantine/core";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { ThemeSwitch } from "../components/ThemeSwitch";
import { userStore } from "../store/userStore";
import './login.scss';

export const LoginIndex = () => {
    const { colorScheme } = useMantineColorScheme();
    const signOutUser  = userStore((state: any) => state.signOutUser);

    useEffect(() => {
        signOutUser();
    }, []);

    return (
        <div className={`d-flex flex-column p-2 h-100 main-div ${colorScheme}`}>
            <ThemeSwitch size={"md"} />
            <Center className="h-100">
                <Outlet></Outlet>
            </Center>
        </div>
    );
}