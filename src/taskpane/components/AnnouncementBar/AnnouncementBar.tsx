// Copyright IBM Corp. 2026

import {
  Button,
  MessageBar,
  MessageBarActions,
  MessageBarBody,
  MessageBarTitle,
} from "@fluentui/react-components";

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
}

export function AnnouncementBar({ title, body, intent, actions }: Readonly<AnnouncementBarProps>) {
  return (
    <MessageBar intent={intent} layout="multiline">
      <MessageBarBody className="">
        <MessageBarTitle>{title}</MessageBarTitle>
        <p>{body}</p>
      </MessageBarBody>

      <MessageBarActions>
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
