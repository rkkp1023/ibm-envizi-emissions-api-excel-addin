// Copyright IBM Corp. 2026

import { AiRecommend } from "@carbon/icons-react";
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Button,
  Image,
  Text,
} from "@fluentui/react-components";
import {
  Open16Regular,
  PanelSeparateWindow20Regular,
  PlayCircleFilled,
} from "@fluentui/react-icons";

import { EmissionScopeSection } from "../EmissionScopeSection";
import { EmissionScopeConfig } from "../EmissionScopeSection/types";

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

const usefulFeatures: EmissionScopeConfig[] = [
  {
    iconName: "RecommendedAI",
    title: "Get a recommended data type",
    formulas: [
      {
        description:
          "Get AI to help select a data type when you’re not sure which one to use. You then review the recommended data type and decide whether it is appropriate to your activity.",
        formulaSyntax: "=ENVIZI.RECOMMEND(search,country,[stateProvince],[data],[page],[size])",
        link: {
          title: "Learn more about data type recommender",
          href: "",
        },
      },
    ],
  },
  {
    title: "Ensure values are valid",
    formulas: [
      {
        description:
          "Ensure that you select valid and up-to-date input values. Use the ribbon buttons on the IBM Envizi tab to add dropdowns to the activity type, unit, and location cells. Select a cell, then click the relevant button.",
        link: {
          title: "Learn more about selecting valid values",
          href: "",
        },
      },
    ],
  },
  {
    title: "Match column titles to the template",
    formulas: [
      {
        description:
          "If you use your own template, you can add the input and output column titles from the Envizi template. You can then follow the function exactly as written and column titles, such as CO2e and CH4, match the calculated results.",
        formulaSyntax: "=ENVIZI.HEADERS((function Name),[input])",
        link: {
          title: "Learn more about adding column titles",
          href: "",
        },
      },
    ],
  },
];

function UsefulFeaturesAccordionItem() {
  const iconMap: Record<string, React.ReactNode> = {
    RecommendedAI: <AiRecommend />,
  };

  return (
    <AccordionItem value="useful-features">
      <AccordionHeader>Useful features</AccordionHeader>
      <AccordionPanel>
        <section className="accordion-content">
          <span>
            Get AI help to select a data type, ensure that you enter valid activity data, units, and
            locations, and align the column titles in your spreadsheet with the Envizi template.
          </span>

          {usefulFeatures.map((feature) => (
            <EmissionScopeSection
              key={feature.title}
              icon={iconMap[feature.iconName]}
              title={feature.title}
              formulas={feature.formulas}
            />
          ))}
          <div className="learn-more-btn">
            <Button
              as="a"
              iconPosition="after"
              icon={<Open16Regular />}
              href="https://www.ibm.com/docs/en/SSFJN8P/topics/c_ctr_new_emissions_excel.html"
              rel="noopener noreferrer"
              target="_blank"
            >
              Learn more about features
            </Button>
          </div>
        </section>
      </AccordionPanel>
    </AccordionItem>
  );
}

function gettingStartedAccordionItem() {
  <AccordionItem value="getting-started">
    <AccordionHeader>Getting started</AccordionHeader>
    <AccordionPanel>
      <section className="accordion-content">
        <p>
          Calculate greenhouse gas (GHG) emissions directly in your spreadsheet. You enter your
          data, and Microsoft Excel uses verified emission factors to automatically calculate
          emissions in tonnes of CO₂ equivalent. No extra tools or steps needed.
        </p>

        {false && (
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
        )}

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
          href="https://ibm.github.io/ibm-envizi-emissions-api-excel-addin"
          rel="noopener noreferrer"
          target="_blank"
        >
          Excel add-in documentation
        </Button>
      </section>
    </AccordionPanel>
  </AccordionItem>;
}

export function QuickHelpTab() {
  return (
    <div className="home-panel">
      <Accordion multiple collapsible defaultOpenItems={["getting-started", "useful-features"]}>
        {gettingStartedAccordionItem()}
        {UsefulFeaturesAccordionItem()}
      </Accordion>
    </div>
  );
}
