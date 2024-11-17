import { Box, Button, LoadingOverlay, TextInput, Textarea } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { z } from "zod";
import { getHeaderJson } from "../../untils/http.untils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { userStore } from "../../store/userStore";

async function sendEmail(data: any) {
    const response = await fetch(`${import.meta.env.VITE_FUNCTIONS_BACKEND}/api/v1/support`, {
        method: 'POST',
        headers: await getHeaderJson(),
        body: JSON.stringify(data),
    });
    return response.json();
}



export const SubmitSupportEmail = (params: {
    typeOfSupport: "support" | "featureRequest";
}) => {
    const [messageSent, setMessageSent] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const defaultOrgUID = userStore((state: any) => state.defaultOrgUID);
    const uid = userStore((state: any) => state.uid);
    // const [visible] = useDisclosure(false);

    const createForm = useForm({
        //@ts-ignore
      schema: zodResolver(z.object({
        title: z.string().min(6, { message: 'Title name should have at least 6 letters' }),
        description: z.string().min(10, { message: 'Description name should have at least 10 letters' }),
      })),
      initialValues: {
        title: "",
        description: "",
      },
    });

    useEffect(() => {
        createForm.reset();
    }, []);
    

    const submitSupport = async (values: any) => {
        setIsSending(true);
        try {
            const response = await sendEmail({
                ...values,
                typeOfSupport: params.typeOfSupport,
                uid,
                defaultOrgUID,
            });
            if (response.error) {
                throw new Error(response.error);
            }
            setMessageSent(true);
        } catch (e) {
            console.error(e);
            showNotification({
                title: 'Error',
                message: 'There was an error sending your message. Please try again later.',
                color: 'red',
                autoClose: 5000,
            });
        } finally {
            setIsSending(false);
        }
    }
    return (
        <Box p="md" pos="relative">
            <LoadingOverlay visible={isSending} overlayBlur={2} />
            {messageSent ?  
            <div>
                <h3>Message Sent</h3>
                <p>Thank you for your message. { params.typeOfSupport == 'support' ? 'We will get back to you as soon as possible.' : 'We are appreciate your support.'}</p>
            </div>
            : 
            <form
                onSubmit={createForm.onSubmit((values) => submitSupport(values))}
            >
                <TextInput
                    required
                    placeholder="Title"
                    label="Enter a title"
                    {...createForm.getInputProps("title")}
                />
                <Textarea
                    required
                    label="Description"
                    placeholder="Enter a description"
                    {...createForm.getInputProps("description")}
                />
                <br/>
                <Button compact leftIcon={<FontAwesomeIcon icon={faEnvelope} />} type="submit">Send</Button>
            </form>}
        </Box>
    )
}