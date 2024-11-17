import { Timestamp } from "firebase/firestore";
import { ATTACHMENT_STATUS } from "../modals/attachents.modals";

export interface IEmailRecipient {
    fullName: string;
    email: string;
    specialId: string;
};

export interface IAttachment {
    path?: string;
    filename: string;
    status: ATTACHMENT_STATUS;
    file: File;
};

export interface IEmailPayload {
    from: string;
    subject: string;
    body: string;
    host: string;
    port: number;
    accountName: string;
    auth: {
        user: string;
        password: string;
    },
    sendAtString: string;
    hasUnsubscribe: boolean;
    to: IEmailRecipient[];
    attachments: { path: string | undefined, filename: string }[];
    sendAt: string;
};
