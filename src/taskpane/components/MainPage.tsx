/*
 * Copyright IBM Corp. 2026
 * Licensed Materials - Property of IBM
 */

import { Tab, TabList } from "@fluentui/react-components";
import { useState } from "react";

import { AccountPage } from "./AccountPage";
import { HomePage } from "./HomePage";
import { ResourcesTab } from "./tabs/ResourcesTab";

type TabValue = "home" | "account" | "resources";

export function MainPage() {
  const [selectedTab, setSelectedTab] = useState<TabValue>("home");

  return (
    <div className="page main-page">
      <TabList
        selectedValue={selectedTab}
        onTabSelect={(_, data) => setSelectedTab(data.value as TabValue)}
      >
        <Tab value="home">Home</Tab>
        <Tab value="resources">Resources</Tab>
        <Tab value="account">Account</Tab>
      </TabList>
      <div className="tab-content">
        {selectedTab === "home" && <HomePage />}
        {selectedTab === "resources" && <ResourcesTab />}
        {selectedTab === "account" && <AccountPage />}
      </div>
    </div>
  );
}
