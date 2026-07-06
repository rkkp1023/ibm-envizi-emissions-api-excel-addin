// Copyright IBM Corp. 2026

import { Close } from "@carbon/icons-react";
import { Tab } from "@fluentui/react-components";
import { type ReactNode } from "react";

export interface DismissibleTabProps {
  value: string;
  icon?: ReactNode;
  label: string;
  onDismiss: () => void;
}

export function DismissibleTab({ value, icon, label, onDismiss }: Readonly<DismissibleTabProps>) {
  const handleDismiss = (e: React.MouseEvent<HTMLSpanElement>) => {
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
        <span
          role="button"
          tabIndex={0}
          aria-label="Close tab"
          className="dismissible-tab-close"
          onClick={handleDismiss}
          onPointerDown={blockTabSelect}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.stopPropagation();
              onDismiss();
            }
          }}
        >
          <Close />
        </span>
      </span>
    </Tab>
  );
}
