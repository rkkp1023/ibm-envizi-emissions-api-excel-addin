// Copyright IBM Corp. 2026

import {
  AiRecommend,
  CalculatorCheck,
  Flash,
  GasStation,
  SearchLocate,
  Van,
} from "@carbon/icons-react";
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Button,
  Image,
  Text,
  makeStyles,
} from "@fluentui/react-components";
import {
  Open16Regular,
  PanelSeparateWindow20Regular,
  PlayCircleFilled,
} from "@fluentui/react-icons";
import { useState } from "react";

import { getEnableEnviziLogin } from "../../../common/env";
import { EmissionScopeSection } from "../EmissionScopeSection";
import { EmissionScopeConfig } from "../EmissionScopeSection/types";
import { functions, gettingStartedSteps, usefulFeatures } from "./contstant";

const useVideoSectionStyles = makeStyles({
  imageWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    paddingInline: "12px",
    marginBlockEnd: "16px",
  },
  imageContainer: {
    position: "relative",
    cursor: "pointer",
    padding: "0",
  },
  playButtonOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    "& svg": {
      fontSize: "42px",
    },
  },
  imagePlaceholder: {
    display: "flex",
    justifyContent: "center",
  },
});

interface StepItemProps {
  title: string;
  description: string;
}

interface EmissionScopeSectionsProps {
  features: EmissionScopeConfig[];
  learnMoreLink: string;
  learnMoreText: string;
}

interface ExternalLinkButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

// Map of Carbon icon names to their components
const carbonIconComponents = {
  AiRecommend,
  GasStation,
  Flash,
  Van,
  CalculatorCheck,
  SearchLocate,
};

// Generate icon map with React elements
const iconMap: Record<string, React.ReactNode> = Object.entries(carbonIconComponents).reduce(
  (acc, [iconName, IconComponent]) => {
    acc[iconName] = <IconComponent size={24} />;
    return acc;
  },
  {} as Record<string, React.ReactNode>
);

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

function EmissionScopeSections({
  features,
  learnMoreLink,
  learnMoreText,
}: Readonly<EmissionScopeSectionsProps>): React.ReactElement {
  return (
    <>
      {features.map((feature, index) => (
        <EmissionScopeSection
          key={feature.title}
          icon={iconMap[feature.iconName]}
          title={feature.title}
          formulas={feature.formulas}
          isFirst={index === 0}
        />
      ))}
      <div className="learn-more-btn">
        <ExternalLinkButton href={learnMoreLink}>{learnMoreText}</ExternalLinkButton>
      </div>
    </>
  );
}

function ExternalLinkButton({
  href,
  children,
  className,
}: Readonly<ExternalLinkButtonProps>): React.ReactElement {
  return (
    <Button
      as="a"
      iconPosition="after"
      icon={<Open16Regular />}
      href={href}
      rel="noopener noreferrer"
      target="_blank"
      className={className}
    >
      {children}
    </Button>
  );
}

function GettingStartedAccordionItem(): React.ReactElement {
  const styles = useVideoSectionStyles();

  // Initialize state directly from localStorage
  const [showVideoSection] = useState(() => {
    return localStorage.getItem("enableVideoSection") === "true";
  });

  const documentUrl = getEnableEnviziLogin()
    ? "SSFJN8P/topics/c_ctr_new_emissions_excel.html"
    : "api-calculating-emissions-in-microsoft-excel";

  const handleImageClick = () => {
    // Open media page in a separate dialog window using generic redirect page
    const currentPath = window.location.pathname;
    const rootPath = currentPath.substring(0, currentPath.lastIndexOf("/"));
    const videoUrl = "https://mediacenter.ibm.com/media/1_700skqlt";
    const redirectUrl = `${window.location.origin}${rootPath}/redirect.html?url=${videoUrl}`;
    Office.context.ui.displayDialogAsync(
      redirectUrl,
      { height: 75, width: 75, promptBeforeOpen: false },
      (asyncResult) => {
        if (asyncResult.status === Office.AsyncResultStatus.Failed) {
          console.error("Failed to open video dialog:", asyncResult.error.message);
        }
      }
    );
  };

  return (
    <AccordionItem value="getting-started">
      <AccordionHeader>Getting started</AccordionHeader>
      <AccordionPanel>
        <section className="accordion-content">
          <p>
            Calculate greenhouse gas (GHG) emissions directly in your spreadsheet. You enter your
            data, and Microsoft Excel uses verified emission factors to automatically calculate
            emissions in tonnes of CO₂ equivalent. No extra tools or steps needed.
          </p>

          {showVideoSection && (
            <div className={styles.imageWrapper}>
              <Button className={styles.imageContainer} onClick={handleImageClick}>
                <Image alt="How to play" src="assets/excel-how-to.png" fit="cover" />
                <div className={styles.playButtonOverlay}>
                  <PlayCircleFilled />
                </div>
              </Button>
              <div className={styles.imagePlaceholder}>
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

          <ExternalLinkButton
            href={`https://www.ibm.com/docs/envizi-esg-suite?topic=${documentUrl}`}
          >
            Excel add-in documentation
          </ExternalLinkButton>
        </section>
      </AccordionPanel>
    </AccordionItem>
  );
}

function UsefulFeaturesAccordionItem(): React.ReactElement {
  const learnMoreTopic = getEnableEnviziLogin()
    ? "SSFJN8P/topics/c_ctr_new_emissions_excel.html"
    : "api-calculating-emissions-in-microsoft-excel";
  const learnMoreFeatureLink = `https://www.ibm.com/docs/envizi-esg-suite?topic=${learnMoreTopic}`;

  return (
    <AccordionItem value="useful-features">
      <AccordionHeader>Useful features</AccordionHeader>
      <AccordionPanel>
        <section className="accordion-content">
          <span>
            Get AI help to select a data type, ensure that you enter valid activity data, units, and
            locations, and align the column titles in your spreadsheet with the Envizi template.
          </span>

          <EmissionScopeSections
            features={usefulFeatures}
            learnMoreLink={learnMoreFeatureLink}
            learnMoreText="Learn more about features"
          />
        </section>
      </AccordionPanel>
    </AccordionItem>
  );
}

function FunctionsAccordionItem(): React.ReactElement {
  return (
    <AccordionItem value="functions">
      <AccordionHeader>Functions</AccordionHeader>
      <AccordionPanel>
        <section className="accordion-content">
          <EmissionScopeSections
            features={functions}
            learnMoreLink="https://www.ibm.com/docs/envizi-esg-suite?topic=reference-functions-in-emissions-calculations-in-excel"
            learnMoreText="View all functions"
          />
        </section>
      </AccordionPanel>
    </AccordionItem>
  );
}

export function QuickHelpTab() {
  return (
    <div className="home-panel">
      <Accordion multiple collapsible defaultOpenItems={["getting-started", "useful-features"]}>
        <GettingStartedAccordionItem />
        {getEnableEnviziLogin() && <UsefulFeaturesAccordionItem />}
        <FunctionsAccordionItem />
      </Accordion>
    </div>
  );
}
