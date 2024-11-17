import { faCancel, faList } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Modal, Progress } from "@mantine/core";
import { mailerStore } from "../../../store/mailerStore";
import { useNavigate } from "react-router-dom";

export const MailerSetupLoader = ({ opened, setOpened} : { opened: boolean, setOpened: Function}) => { 
    const loadingIntoQueueTotal = mailerStore((state: any) => state.loadingIntoQueueTotal);
    const currentLoadedIntoQueue = mailerStore((state: any) => state.currentLoadedIntoQueue);
    // const loadingError = mailerStore((state: any) => state.loadingError);
    const totalRecipientErroredOut = mailerStore((state: any) => state.totalRecipientErroredOut);
    const totalRecipientQueued = mailerStore((state: any) => state.totalRecipientQueued);

    const persentage = (currentLoadedIntoQueue / loadingIntoQueueTotal) * 100;
    const errorPersentage = (totalRecipientErroredOut / loadingIntoQueueTotal) * 100;
    const navigate = useNavigate();

    return <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        padding="xl"
        withCloseButton={false}
    >
        {(persentage + errorPersentage) == 100 ? <h2>Processing Complete</h2> : <h2>Sending to queue...</h2>}
        <Progress
            size="xl"
            sections={[
                { value: persentage, color: 'cyan' },
                { value: errorPersentage, color: 'red' },
            ]}
        />
        <p className="mt-2">Emails Queued: {totalRecipientQueued}</p>
        {(persentage + errorPersentage) == 100 && <div>
            <br />
            <div className="d-flex flex-row justify-content-between w-100">
                <Button
                    className="mt-2 mr-2"
                    type="button"
                    onClick={() => setOpened(false)}
                    leftIcon={<FontAwesomeIcon icon={faCancel} />}
                >
                    Close
                </Button>
                {/* <Button
                    className="mt-2 mr-2"
                    type="button"
                    leftIcon={<FontAwesomeIcon icon={faReply} />}
                >
                    Reset
                </Button> */}

                <Button
                    className="mt-2"
                    type="button"
                    onClick={() => {
                        setOpened(false);
                        navigate('/logs');
                    }}
                    leftIcon={<FontAwesomeIcon icon={faList} />}
                >
                    View Log
                </Button>
            </div>
        </div>}
</Modal>
};
