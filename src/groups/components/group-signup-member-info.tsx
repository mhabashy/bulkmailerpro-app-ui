import { Code, Drawer } from "@mantine/core";

export default function GroupSignupMemberInfo(
    { 
        groupId, 
        drawerOpened, 
        setDrawerOpened 
    } : { 
        groupId: string, 
        drawerOpened: boolean, 
        setDrawerOpened: (value: boolean) => void
    }
) {
    const orgId = localStorage.getItem("defaultOrgUID") ?? "";
    return (
        <Drawer
          opened={drawerOpened}
          onClose={() => {
            setDrawerOpened(false);
          }}
          title={<h4 className="m-2">API for group</h4>}
          size="xl"
          position="right"
        >
            <h2>API Information</h2>
            <p>You can use the following to add members to group from your own website. (Only email is required)</p>
            <Code block>
                <pre>
                    {`curl -X POST ${import.meta.env.VITE_FUNCTIONS_BACKEND}/api/v1/signup/group/${orgId}/${groupId} -H "Content-Type: application/json" -d '{
                        "email": "example@example.com",
                        "firstName": "John",
                        "lastName": "Doe",
                        "middleName": "A",
                        "specialIdentifier": "12345"
                    }'`
                    }
                </pre>
            </Code>
            <p>Unsubscribe a email account from group you can use the following</p>
            {/* <Code block>
                <pre>
                    {
                        `curl -v -X POST ${import.meta.env.VITE_FUNCTIONS_BACKEND}/unsubscribe/${orgId}/members/${groupId} -H "Content-Type: application/json" -d '{"action": "unsubscribe", "email": "example@example.com"}'`
                    }
                </pre>
            </Code>
            <p>Or simply you can use add email address and unknown will be filled for the rest.</p> */}
            <Code block>
                <pre>
                    {`curl -X POST ${import.meta.env.VITE_FUNCTIONS_BACKEND}/api/v1/signup/group/${orgId}/${groupId} \
    -H "Content-Type: application/json" \
    -d '{"email": "example@example.com"}'
`}
                </pre>
            </Code>
            <br />
            {/* <h2>IFrame</h2>
            <p>Simple URL</p>
            <Code block>
                <pre>
                    {`${import.meta.env.VITE_APP_DOMAIN}/add/simple/${orgId}/${groupId}`}
                </pre>
            </Code>
            <br/>
            <p>IFrame</p>
            <br/>
            <Code block>
                <pre>
                    <iframe 
                        src={`${import.meta.env.VITE_APP_DOMAIN}/add/simple/8fXf4cg3JiiEJBfjnN8e/CUMMjFxH6Uazc61xMIHG`}
                        height="400px"
                        width="500px"
                    ></iframe>                
                </pre>
            </Code>
            <p>Advance URL</p>
            <Code block>
                <pre>
                    {`${import.meta.env.VITE_APP_DOMAIN}/add/advance/${orgId}/${groupId}`}
                </pre>
            </Code>
            <br/>
            <p>IFrame</p>
            <br/>
            <Code block>
                <pre>
                    <code>
                        <iframe 
                            src={`${import.meta.env.VITE_APP_DOMAIN}/add/advance/8fXf4cg3JiiEJBfjnN8e/CUMMjFxH6Uazc61xMIHG`}
                            height="600px"
                            width="500px"
                        ></iframe>   
                    </code>
                </pre>
            </Code> */}
        </Drawer>
    );
}