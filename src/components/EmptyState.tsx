import { Center } from "@mantine/core";
import { LogoColumn } from "./LogoColumn";
import { LogoRows } from "./LogoRow";

export interface IEmptyStateProps {
    children: React.ReactNode;
}

export function EmptyState (props: IEmptyStateProps) {
  return (
    <div className="h-100 w-100">
        <Center className="d-flex flex-column">
            <LogoColumn />
            {props.children}
        </Center>
    </div>
  );
}
