// Copyright IBM Corp. 2026

import { Tab, TabList } from "@fluentui/react-components";
import { useState } from "react";

import { AccountTab } from "./AccountTab/AccountTab";
import { QuickHelpTab } from "./QuickHelpTab/QuickHelpTab";
import { ResourcesTab } from "./ResourcesTab/ResourcesTab";

type TabValue = "quickHelp" | "account" | "resources";

export function MainPage() {
  const [selectedTab, setSelectedTab] = useState<TabValue>("quickHelp");
  return (
    <div className="page main-page">
      <TabList
        selectedValue={selectedTab}
        onTabSelect={(_, data) => setSelectedTab(data.value as TabValue)}
      >
        <Tab value="quickHelp">Quick help</Tab>
        <Tab value="resources">Resources</Tab>
        <Tab value="account">Account</Tab>
      </TabList>
      <div className="tab-content">
        {selectedTab === "quickHelp" && <QuickHelpTab />}
        {selectedTab === "resources" && <ResourcesTab />}
        {selectedTab === "account" && <AccountTab />}
      </div>
    </div>
  );
}
