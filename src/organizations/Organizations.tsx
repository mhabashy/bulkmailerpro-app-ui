import { Button, Divider, Flex, Loader, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { doc } from "firebase/firestore";
import { useFirestore, useFirestoreDoc } from "reactfire";
import { CommonHeader } from "../components/CommonHeader";
import { AppLoader } from "../components/AppLoader";
import ConfirmButton from "../components/ConfirmButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCancel, faMoneyBill, faTrash } from "@fortawesome/free-solid-svg-icons";
import { userStore } from "../store/userStore";
import { OrgAdmin } from "./components/OrgAdmin";
import { OrgListUsers } from "./components/OrgListUsers";
import { useNavigate } from "react-router-dom";
import { AddOrganizations } from "./components/AddOrganizations";
import _, { set } from "lodash";
import { ChangeOrgNameModal } from "./components/ChangeOrgNameModal";
import { useEffect } from "react";

export const Organizations = () => {
    const defaultOrgUID = userStore((state: any) => state.defaultOrgUID);
    const buySubscriptionFunc = userStore((state: any) => state.buySubscription);
    const cancelSubscriptionFunc = userStore((state: any) => state.cancelSubscription);
    const deleteOrganization = userStore((state: any) => state.deleteOrganization);
    const organizations = userStore((state: any) => state.organizations);
    const getOrgs = userStore((state: any) => state.getOrgs);
    
    const uid = userStore((state: any) => state.uid);
    const firebase = useFirestore();

    console.log(organizations);

    let mrFirebase = doc(firebase, 'organizations', defaultOrgUID as string);

    const {status = 'loading', data } = useFirestoreDoc(mrFirebase);

    useEffect(() => {
        if (status === 'success' && !data) {
            localStorage.removeItem('defaultOrgUID');
            window.location.href = '/login';
        }
    }, [status, data]);


    const buySubscription = async () => {
         try {
            await buySubscriptionFunc();
         } catch (e: any) {
            console.error(e);
            showNotification({
                title: 'Error',
                message: `Issue with buying subscription: ${e.message}`,
                color: 'red',
            });
         }
    }

    const cancelSubscription = async (subscriptionId: string) => {
        try {
            await cancelSubscriptionFunc(subscriptionId);
            showNotification({
                title: 'Success',
                message: 'Subscription cancelled successfully, please wait couple of seconds for the changes to take effect.',
                color: 'green',
            });
        } catch (e: any) {
            console.error(e);
            showNotification({
                title: 'Error',
                message: `Issue with cancelling subscription: ${e.message}`,
                color: 'red',
            });
        }
    }

    const BuyButton = () => {
        return <Button 
                    color="teal"
                    size="md" 
                    leftIcon={<FontAwesomeIcon icon={faMoneyBill} />} 
                    onClick={() => buySubscription()}
                >Buy a subscription</Button>
    }

    const SubscriptionUI = () => {
        switch (data.get('status')) {
            case 'active':
                return <ConfirmButton 
                                size={"xs"} 
                                text="Cancel Subscription"
                                message="Are you sure you want to cancel your subscription?"
                                icon={<FontAwesomeIcon icon={faCancel} />}
                                onConfirm={async () => cancelSubscription(data.get('stripeSubscriptionId')) } />
            case 'canceled':
                return <BuyButton />;
            case 'incomplete':
                return <Loader size="xs" />
            default:
                return <BuyButton />;
        }
    }

    return (
        <>
            <CommonHeader title="Organizations">
                <AddOrganizations />
            </CommonHeader>
            <Divider />
            {
                status === 'loading' && <AppLoader />
            }
            {
                status === 'error' && <p>Error loading data</p>
            }
            {
                status === 'success' && <>
                    <Flex direction="row">
                        <Text size="lg" weight="bold">Current organization: {data.get('name')}</Text>
                        <ChangeOrgNameModal org={data} />
                    </Flex>
                    <Flex direction="row" pt="md" justify="space-between" align="center">
                        <Text>Bulk Mailer Pro offers a standard subscription for $24.99 USD a month. This plan allows your organization to send out emails seamlessly.</Text>
                        <SubscriptionUI />
                    </Flex>
                    <Text size="sm" color="gray">Please note that we will delete all data from inactive accounts after a couple of months of inactivity. This helps us keep overhead costs down.</Text>
                </>
            }
            <br/>
            {
                status === 'success' && <>
                
                    <OrgAdmin org={data} />
                    <OrgListUsers org={data} />
                    {data.get('status') !== 'active' && _.includes(data.get('admins'), uid) &&
                        <ConfirmButton
                            size="xs"
                            text={`Delete Organization`}
                            message={`Are you sure you want to delete this organization? (This will remove all data for ${data.get('name')})`}
                            icon={<FontAwesomeIcon icon={faTrash} />}
                            onConfirm={async () => {
                                if (await deleteOrganization(defaultOrgUID)) {
                                    showNotification({
                                        title: 'Success',
                                        message: 'Organization deleted successfully',
                                        color: 'green',
                                    });
                                    const orgs = await getOrgs(uid);
                                    if (orgs.length > 0) {
                                        localStorage.setItem('defaultOrgUID', orgs[0].id);
                                        window.location.reload();
                                    } else {
                                        localStorage.removeItem('defaultOrgUID');
                                        window.location.href = '/login';
                                    }
                                } else {
                                    showNotification({
                                        title: 'Error',
                                        message: 'Failed to delete organization',
                                        color: 'red',
                                    });
                                }
                            
                            }}
                        />}
                </>
            }
            <br/>
            <br/>
            <br/>
            <br/>
            <br/>
        </>
    )
};