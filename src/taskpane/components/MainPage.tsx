/*
 * Copyright IBM Corp. 2026
 * Licensed Materials - Property of IBM
 */

import { Tab, TabList } from "@fluentui/react-components";
import { useState } from "react";

import { AccountTab } from "./tabs/AccountTab";
import { QuickHelpTab } from "./tabs/QuickHelpTab";

type TabValue = "quickHelp" | "account";

export function MainPage() {
  const [selectedTab, setSelectedTab] = useState<TabValue>("quickHelp");

  return (
    <div className="page main-page">
      <TabList
        selectedValue={selectedTab}
        onTabSelect={(_, data) => setSelectedTab(data.value as TabValue)}
      >
        <Tab value="quickHelp">Quick help</Tab>
        <Tab value="account">Account</Tab>
      </TabList>
      <div className="tab-content">
        {selectedTab === "quickHelp" && <QuickHelpTab />}
        {selectedTab === "account" && <AccountTab />}
      </div>
    </div>
  );
}
