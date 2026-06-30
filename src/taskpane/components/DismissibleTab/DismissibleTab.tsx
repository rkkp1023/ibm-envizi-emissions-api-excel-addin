// Copyright IBM Corp. 2026

import { Close } from "@carbon/icons-react";
import { Button, Theme } from "@carbon/react";
import { Tab } from "@fluentui/react-components";
import { type ReactNode } from "react";
import { useCarbonTheme } from "../../hooks";

export interface DismissibleTabProps {
  value: string;
  icon?: ReactNode;
  label: string;
  onDismiss: () => void;
}

export function DismissibleTab({ value, icon, label, onDismiss }: Readonly<DismissibleTabProps>) {
  const theme = useCarbonTheme();
  const handleDismiss = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onDismiss();
  };

  // Fluent Tab captures pointer-down to trigger tab selection.
  // Stopping pointer-down here prevents the tab from activating when
  // the dismiss button is clicked, regardless of how Carbon wraps the click.
  const blockTabSelect = (e: React.PointerEvent<HTMLSpanElement>) => {
    e.stopPropagation();
  };

  return (
    <Tab value={value}>
      <span className="dismissible-tab-content">
        {icon}
        <span className="dismissible-tab-label">{label}</span>
        <Theme theme={theme.theme}>
          <span onPointerDown={blockTabSelect}>
            <Button
              hasIconOnly
              kind="ghost"
              size="sm"
              renderIcon={Close}
              iconDescription="Close tab"
              aria-label="Close tab"
              onClick={handleDismiss}
            ></Button>
          </span>
        </Theme>
      </span>
    </Tab>
  );
}
