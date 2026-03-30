// Copyright IBM Corp. 2026

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
} from "@fluentui/react-components";

interface StepItemProps {
  title: string;
  description: string;
}

function StepItem({ title, description }: Readonly<StepItemProps>) {
  return (
    <div className="text-block">
      <p className="text-header">{title}</p>
      <p>{description}</p>
    </div>
  );
}

const gettingStartedSteps = [
  {
    title: "1. Choose a template (optional)",
    description: "In the Excel template, select the appropriate tab for your emissions type.",
  },
  {
    title: "2. Enter your activity data",
    description:
      "In the input table, add data like fuel use and type, location and the date range.",
  },
  {
    title: "3. Calculate emissions",
    description:
      "Once you've inputted your data, you can use the add-in functions to calculate your emissions in the output table.",
  },
];

export function QuickHelpTab() {
  return (
    <div className="home-panel">
      <Accordion multiple collapsible defaultOpenItems={["getting-started", "resources"]}>
        <AccordionItem value="getting-started">
          <AccordionHeader>Getting started</AccordionHeader>
          <AccordionPanel>
            <section className="accordion-content">
              <p>
                Get started with the Emissions API Excel add-in. You can use this add-in with our
                Excel template, or your own spreadsheet.
              </p>
              {gettingStartedSteps.map((step) => (
                <StepItem key={step.title} title={step.title} description={step.description} />
              ))}
            </section>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
