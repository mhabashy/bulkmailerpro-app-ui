import { Card, Divider, Text } from "@mantine/core";
import { SubmitSupportEmail } from "./components/SubmitSupportEmail";
import { textDescriptions } from "../untils/text-descriptions";

export const Support = () => {


  return (
    <div>
      <h2>Support</h2>
      <Divider />
      {textDescriptions.support['en-US']}
      <br/>
      <br/>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Text size="md">
          Need Help?
        </Text>
        <SubmitSupportEmail typeOfSupport="support" />
      </Card>
      <br/>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Text size="md">
          Feature Request
        </Text>
        <Text size="sm">
          Have a feature request? Let us know! Bulkmailer Pro is constantly evolving and we would love to hear your ideas.
        </Text>
        <SubmitSupportEmail typeOfSupport="featureRequest" />
      </Card>
      <br/>
      <br/>
      <br/>
    </div>
  );
}
