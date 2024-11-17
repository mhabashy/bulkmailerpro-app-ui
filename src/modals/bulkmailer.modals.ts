import { z } from "zod";

export const schemaMailer = z.object({
    accountId: z.string(),
    groupIds: z.array(z.string()),
    subject: z.string().min(2, { message: 'Subject should have at least 2 letters' }),
    body: z.string().min(2, { message: 'Body should have at least 2 letters' }),
});