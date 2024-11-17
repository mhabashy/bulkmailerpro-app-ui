import { z } from "zod";

export interface IGroup {
    id?: string;
    name?: string;
    description?: string;
    totalMembers?: number;
    members?: IMember[];
    default?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IMember {
    id?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    fullName: string;
    email: string;
    specialIdentifier?: string;
    searchText?: string;
    checked?: boolean;
    subscribed: boolean;
}

export const schemaGroups = z.object({
    name: z.string().min(2, { message: 'Name should have at least 2 letters' }),
    description: z.string().optional().nullable(),
    default: z.boolean(),
});

export const schemaMembers = z.object({
    firstName: z.string().min(2, { message: 'First name should have at least 2 letters' }),
    middleName: z.string().optional().nullable(),
    lastName: z.string().min(2, { message: 'Last name should have at least 2 letters' }),
    email: z.string().email({ message: 'Email is not valid' }),
    specialIdentifier: z.string().optional().nullable(),
});