import { Center, Loader, Select } from "@mantine/core";
import { userStore } from "../store/userStore";
import { useEffect, useState } from "react";

export interface ISelectCompanyProps {
    userUID: string;
    currentOrgUID: string;
};

export const SelectCompany = ({ userUID, currentOrgUID}: ISelectCompanyProps) => {
    const getOrgs = userStore((state: any) => state.getOrgs);
    const organizations = userStore((state: any) => state.organizations);
    const setCurrentOrg= userStore((state: any) => state.setCurrentOrg);
    const [orgs, setOrgs] = useState([]);

    async function getOrgsAsync(userUID: string) {
        await getOrgs(userUID);
    };

    useEffect(() => {
        setOrgs([]);
        getOrgsAsync(userUID);
    }, [currentOrgUID]);

    useEffect(() => {
        const dId = organizations.find((org: any) => org.id === localStorage.getItem('defaultOrgUID'));
        console.log(dId);
        if (!dId && organizations.length > 0) {
            setCurrentOrg(organizations[0].id);
            localStorage.setItem('defaultOrgUID', organizations[0].id);
        }
    }, [organizations]);

    useEffect(() => {
        setOrgs(organizations.map((org: any) => {
            return { value: org.id, label: org.name }
        }));
    }, [organizations]);

    return (
        <>
            {orgs.length > 0 ?
                <Select
                    label="Select Organizations"
                    placeholder="Pick one"
                    defaultValue={currentOrgUID}
                    value={currentOrgUID}
                    data={orgs}
                    onChange={(value) => {
                        setCurrentOrg(value);
                        if (value === currentOrgUID) return;
                        window.location.reload();
                    }}
                /> : 
                <Center>
                    <Loader />
                </Center>
            }
        </>
    )
};