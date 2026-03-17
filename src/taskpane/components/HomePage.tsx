/*
 * Copyright IBM Corp. 2026
 * Licensed Materials - Property of IBM
 */

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Link,
} from "@fluentui/react-components";
import { useState } from "react";

import { SignUpMessageBanner } from "./SignUpMessageBanner";

interface StepItemProps {
  title: string;
  description: string;
}

interface ResourceSectionProps {
  title: string;
  links: Array<{
    href: string;
    text: string;
  }>;
}

function StepItem({ title, description }: Readonly<StepItemProps>) {
  return (
    <div className="text-block">
      <p className="text-header">{title}</p>
      <p>{description}</p>
    </div>
  );
}

function ResourceSection({ title, links }: Readonly<ResourceSectionProps>) {
  return (
    <div>
      <p className="block-header">{title}</p>
      <div className="stack-gap-8">
        {links.map((link) => (
          <Link key={link.href} href={link.href} target="_blank">
            {link.text}
          </Link>
        ))}
      </div>
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

const resourceSections = [
  {
    title: "Documentation",
    links: [
      {
        href: "https://www.ibm.com/docs/en/envizi-esg-suite?topic=modules-trial-user-only-envizi-ghg-emissions-api",
        text: "IBM product documentation",
      },
      {
        href: "https://ibm.github.io/ibm-envizi-emissions-api-excel-addin",
        text: "Excel add-in documentation",
      },
    ],
  },
  {
    title: "Community",
    links: [
      {
        href: "https://community.ibm.com/community/user/communities/community-home?CommunityKey=6853271a-0a5c-45f9-a9a2-0186706f68ec",
        text: "IBM Envizi Community",
      },
      {
        href: "https://www.ibm.com/think/author/envizi",
        text: "IBM Envizi blog",
      },
    ],
  },
  {
    title: "Support",
    links: [
      {
        href: "https://your.feedback.ibm.com/jfe/form/SV_7Vh96izZeRghY34",
        text: "Provide feedback",
      },
      {
        href: "mailto:enviziemissionsapi@ibm.com",
        text: "Contact IBM",
      },
    ],
  },
];

const getInitialBannerState = (): boolean => {
  return localStorage.getItem("showSignUpBanner") === "true";
};

export function HomePage() {
  const [showSignUpBanner] = useState<boolean>(getInitialBannerState);

  return (
    <div className="home-panel">
      {showSignUpBanner && <SignUpMessageBanner />}
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

        <AccordionItem value="resources">
          <AccordionHeader>Resources</AccordionHeader>
          <AccordionPanel>
            <section className="accordion-content">
              <p>
                Everything you need to get started, build, and succeed with the Envizi Emissions API
                Excel add-in.
              </p>
              <div className="stack-gap-16">
                {resourceSections.map((section) => (
                  <ResourceSection
                    key={section.title}
                    title={section.title}
                    links={section.links}
                  />
                ))}
              </div>
            </section>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
