// Copyright IBM Corp. 2026

import {
  Button,
  MessageBar,
  MessageBarActions,
  MessageBarBody,
  MessageBarTitle,
} from "@fluentui/react-components";
import { DismissRegular } from "@fluentui/react-icons";

export type AnnouncementBarButtonAction = {
  label: string;
  href: string;
  size?: "small" | "medium" | "large";
};

export interface AnnouncementBarProps {
  title: string;
  body: string;
  intent: "info" | "warning" | "error" | "success";
  actions: AnnouncementBarButtonAction[];
  onDismiss?: () => void;
}

export function AnnouncementBar({ title, body, intent, actions, onDismiss }: Readonly<AnnouncementBarProps>) {
  return (
    <MessageBar intent={intent} layout="multiline">
      <MessageBarBody>
        <MessageBarTitle>{title}</MessageBarTitle>
        <p>{body}</p>
      </MessageBarBody>

      <MessageBarActions
        containerAction={
          <Button aria-label="dismiss" appearance="transparent" icon={<DismissRegular />} onClick={onDismiss} />
        }
      >
        {actions.map((action) => (
          <Button
            key={action.href}
            appearance="outline"
            size={action.size ?? "medium"}
            as="a"
            href={action.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {action.label}
          </Button>
        ))}
      </MessageBarActions>
    </MessageBar>
  );
}
