// Copyright IBM Corp. 2026

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Button,
  Image,
  Text,
} from "@fluentui/react-components";
import { useState } from "react";

import {
  Open16Regular,
  PanelSeparateWindow20Regular,
  PlayCircleFilled,
} from "@fluentui/react-icons";
import { ApiCredentials } from "../../../common/credentials";
import { getEnableEnviziLogin } from "../../../common/env";
import { useAuth } from "../../hooks";
import { SignUpMessageBanner } from "../SignUpMessageBanner";

interface StepItemProps {
  title: string;
  description: string;
}

function StepItem({ title, description }: Readonly<StepItemProps>) {
  return (
    <div className="text-block">
      <Text size={300} weight="semibold">
        {title}
      </Text>
      <p>{description}</p>
    </div>
  );
}

const gettingStartedSteps = [
  {
    title: "1. Select a sheet",
    description: "Select the sheet for your emissions type, for example, S1. Stationary.",
  },
  {
    title: "2. Enter your activity data",
    description: "In the input table, add data like fuel use and type, location, and date range.",
  },
  {
    title: "3. Calculate emissions",
    description: "After you add your data, your emissions are calculated in the output table.",
  },
];

export function QuickHelpTab() {
  const { state } = useAuth();
  const [showSignUpBanner] = useState(
    () => getEnableEnviziLogin() && (state.credentials as ApiCredentials).apiKey
  );

  return (
    <div className="home-panel">
      {showSignUpBanner && <SignUpMessageBanner />}
      <Accordion multiple collapsible defaultOpenItems={["getting-started", "resources"]}>
        <AccordionItem value="getting-started">
          <AccordionHeader>Getting started</AccordionHeader>
          <AccordionPanel>
            <section className="accordion-content">
              <p>
                Calculate greenhouse gas (GHG) emissions directly in your spreadsheet. You enter
                your data, and Microsoft Excel uses verified emission factors to automatically
                calculate emissions in tonnes of CO₂ equivalent. No extra tools or steps needed.
              </p>
              <div className="image-wrapper">
                <div className="image-container">
                  <Image alt="How to play" src="assets/excel-how-to.png" fit="cover" />
                  <div className="play-button-overlay">
                    <PlayCircleFilled />
                  </div>
                </div>
                <div className="image-placeholder">
                  <Text>How to use excel add-in (placeholder)</Text>
                  <PanelSeparateWindow20Regular />
                </div>
              </div>

              <Text size={400} weight="semibold">
                Using the Envizi template
              </Text>
              {gettingStartedSteps.map((step) => (
                <StepItem key={step.title} title={step.title} description={step.description} />
              ))}
              <Button
                as="a"
                iconPosition="after"
                icon={<Open16Regular />}
                href="https://www.ibm.com/docs/envizi-esg-suite?topic=api-calculating-emissions-in-microsoft-excel"
              >
                Excel add-in documentation
              </Button>
            </section>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
