export interface IGroup {
    name: string;
    id: string;
    checked: boolean;
    groupName?: string;
}

export interface IMembers {
    email: string;
    firstName?: string;
    fullName?: string;
    lastName?: string;
    middleName?: string;
    searchText?: string[];
    specialIdentifier?: string;
}

export interface IGroupMembers {
    groupId: string;
    groupName: string;
    groupDescription?: string;
    memberInfo?: IMembers;
}