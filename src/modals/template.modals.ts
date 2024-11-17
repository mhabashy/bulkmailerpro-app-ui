import { z } from "zod";
export interface ITemplate {
    id: string,
    name: string,
    subject: string,
    body: string,
    default: boolean,
    userUID: string,
}

export const schemaTemplate = z.object({
    name: z.string().min(2, { message: 'Name should have at least 2 letters' }),
    subject: z.string().min(2, { message: 'Subject should have at least 2 letters' }),
    body: z.string().min(2, { message: 'HTML should have at least 2 letters' }),
    default: z.boolean(),
});