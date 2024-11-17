import { z } from "zod";

export interface IAccount {
    id: string;
    name: string;
    email: string;
    host: string;
    port: number;
    username: string;
    password: string;
    unsubscribe: boolean;
    sendingLimitInSec: number;
    userUID?: string;
    default: boolean;
    createdAt: Date;
}

export const schemaAccount = z.object({
    name: z.string().min(2, { message: 'Name should have at least 2 letters' }),
    email: z.string().email({ message: 'Invalid email' }),
    host: z.string().min(2, { message: 'Invalid host' }),
    port: z.number().min(1, { message: 'Port should be at least 1' }),
    username: z.string().min(2, { message: 'SMTP Username should have at least 2 letters' }),
    password: z.string().min(2, { message: 'SMTP Password should have at least 2 letters' }),
    unsubscribe: z.boolean(),
    sendingLimitInSec: z.number().min(1, { message: 'Sending Limit should be at least 1' }),
});
