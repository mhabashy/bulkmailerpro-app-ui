import { Center } from "@mantine/core";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { LogoColumn } from "./LogoColumn";
import { LogoRows } from "./LogoRow";

function Page404() {
    const navigate = useNavigate();
    useEffect(() => {
        setTimeout(() => {
            navigate('/login');
        }, 4000);
    });

    return (
        <Center>
            <div className="d-flex flex-column align-items-center">
                <div style={{height: '100px', width: '40vh'}}>
                    <LogoColumn />
                </div>
                <br/>
                <h1>404</h1>
                <h3>Page not found</h3>
                <p>Redirecting ...</p>
            </div>
        </Center>
    )
}

export default Page404;