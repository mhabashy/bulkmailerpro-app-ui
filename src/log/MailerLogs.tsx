import { Card, Divider, Flex, Progress, Text } from "@mantine/core";
import { AppLoader } from "../components/AppLoader";
import { useFirestore, useFirestoreCollectionData } from "reactfire";
import { DocumentData, collection, orderBy, query } from "firebase/firestore";
import _ from "lodash";
import ConfirmButton from "../components/ConfirmButton";
import { mailerStore } from "../store/mailerStore";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import './mailer_logs.scss';
import { Link } from "react-router-dom";
import { textDescriptions } from "../untils/text-descriptions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";

function addSecondsToDateAndReturnDate(date: Date, seconds: number) {  
    return dayjs(date).add(seconds / (1000 * 60 * 60), 'seconds').toDate();
}

function isTimedOut(date: Date, seconds: number) {
    const expireDate = addSecondsToDateAndReturnDate(date, seconds);
    const now = new Date();
    return now > expireDate;
}
const getPercent = (num: number, totalNumber: number) => {
    return Math.round((num / totalNumber) * 100);
}

function FailedLogOrPercent(params: {log: DocumentData, percentCalc: number, timeOut: boolean}) {
    const { percentCalc, timeOut } = params;
    return (timeOut && percentCalc != 100) ? (
        <div>
            <h4 className="failed-title">Failed</h4>
            <p>Time send expired - not all completed all the way. Likely SMTP limit was meet. It completed {percentCalc}%</p>
        </div>
    ) : percentCalc === 100 ? <Flex direction="row" align="center"><FontAwesomeIcon color="teal" icon={faCheckCircle} size="xl" /> <Text m="xs" color="teal" weight="bold">COMPLETED</Text></Flex> : <Text>{percentCalc}%</Text>;
}


function ListOfRejectedEmails(params: {rejectedEmails: string[]} = {rejectedEmails: []}) {
    const { rejectedEmails } = params;
    const [showReject, setShowReject] = useState(false);
    if ((rejectedEmails || []).length > 0) {
        return showReject ? (
            <Card>
                <div>
                    <h4>Rejected Emails</h4>
                    <ul>
                        {rejectedEmails.map((email, index) => (
                            <li key={index}>{email}</li>
                        ))}
                    </ul>
                </div>
            </Card>) : <Link to="#" onClick={() => setShowReject(true)}>Show Rejected Emails</Link>;
    }
    return <Text size="sm">
        There where no rejected emails.
    </Text>;
}

function ShowProgress(log: DocumentData) {
    const percentCalc = useMemo(() => getPercent(log.totalQueueCompleted, log.totalQueues), [log.totalQueueCompleted, log.totalQueues]);
    const timeOut = useMemo(() => isTimedOut(new Date(log.sendAtString), log.lastSeconds + 20000), [log.sendAtString, log.lastSeconds]);
    return <>
        {(!timeOut && percentCalc < 100) && <Progress
            value={percentCalc}
            sections={[
                { value: percentCalc, color: 'cyan' },
            ]}
            color={percentCalc === 100 ? "green" : "blue"}
        ></Progress>}
        
        <FailedLogOrPercent log={log} percentCalc={percentCalc} timeOut={timeOut} />
        {timeOut && <ListOfRejectedEmails rejectedEmails={log.rejected} />}
    </>;
}


export function MailerLogs() {
    let logs: DocumentData[] = [];
    const firebase = useFirestore();
    const mrFirebase = collection(firebase, 'organizations', localStorage.getItem("defaultOrgUID") as string, 'mailer');
    // const mrqFirebaseDoc = collection(useFirestore(), 'orgagnizations', localStorage.getItem("defaultOrgUID") as string, 'mailer');
    const mailerQuery = query(mrFirebase, orderBy("createTime", "desc"));
    const deleteEmail = mailerStore((state: any) => state.deleteEmail);

    
    const {status, data } = useFirestoreCollectionData(mailerQuery, {
      idField: 'id',
    });

    logs = data;

    return (
        <div>
            <h2>Mailer Log</h2>
            <Divider />
            {textDescriptions.log['en-US']}
            <br/>
            <br/>
            {status === 'loading' && <AppLoader />}
            {status === 'success' && logs.length === 0 && <Card>No Emails found</Card>}
            {status === 'error' && <Card>Error loading logs</Card>}
            {status === 'success' && logs.length > 0 && logs.map((log: any, index: number) => (
                <Card key={index} className="mb-2" shadow="md" radius="md" >
                    <div>
                        <h3>{log.subject}</h3>
                        <ShowProgress {...log} />
                    </div>
                    <br/>
                    <div className="d-flex flex-row justify-content-between align-items-center">
                        <div>
                            <p>Created: {log.createTime.toDate().toLocaleString()}</p>
                            {log.createTime.toDate() > new Date(log.sendAtString) && <p>Send Time: {new Date(log.sendAtString).toLocaleString()}</p>}
                        </div>
                        <div>
                            <ConfirmButton
                                text="Delete"
                                message="Are you sure you want to delete this mailer?"
                                onConfirm={async () => {
                                    await deleteEmail(log.id);
                                } } size={"xs"}                            
                            />
                        </div>
                    </div>
                </Card>
            ))}
            <br/>
            <br/>
            <br/>
        </div>
    );
};