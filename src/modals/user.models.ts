export enum OrganizationStatus {
    TRIAL = 'trial',
    SUBSCRIBER ='subscriber',
    ADMIN = 'admin',
}

export interface User {
    uid: string;
    displayName: string;
    photoUrl: string;
    email: string;
    accessToken: string;
    defaultCompany: string;
    companies: string[];
    status: OrganizationStatus;
}

// SHOULD MOVE TO A SEPARATE FILE
// export const userHasPermission = (user: User, permission: OrganizationStatus): boolean => {
//     if (user.status === OrganizationStatus.ADMIN && (permission === OrganizationStatus.ADMIN 
//                                             || permission === OrganizationStatus.SUBSCRIBER
//                                             || permission === OrganizationStatus.TRIAL)) {
//         return true;
//     } else if (user.status === OrganizationStatus.SUBSCRIBER && (permission === OrganizationStatus.SUBSCRIBER 
//                                             || permission === OrganizationStatus.TRIAL)) {
//         return true;
//     } else if (user.status === OrganizationStatus.TRIAL && permission === OrganizationStatus.TRIAL) {
//         return true;
//     }
//     return false;
// }

// export const userNotInTrial = (user: User): boolean => {
//     return user.status !== OrganizationStatus.TRIAL;
// }