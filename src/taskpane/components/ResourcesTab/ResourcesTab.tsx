/*
 * Copyright IBM Corp. 2026
 */

import { Link } from "@fluentui/react-components";
import { getEnviziExcelAddInOverviewUrl } from "../../../common/env";
import { useAccountSubscription } from "../../hooks";

interface ResourceSectionProps {
  title: string;
  links: Array<{
    href: string;
    text: string;
  }>;
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

const getResourceSections = (supportLink: string) => {
  const resources = [
    {
      title: "Overview",
      links: [
        {
          href: getEnviziExcelAddInOverviewUrl(),
          text: "Excel add-in overview page",
        },
      ],
    },
    {
      title: "Documentation",
      links: [
        {
          href: "https://www.ibm.com/docs/envizi-esg-suite?topic=SSFJN8P/topics/c_ctr_new_emissions_excel.html",
          text: "Excel add-in documentation",
        },
      ],
    },
    {
      title: "Community",
      links: [
        {
          href: "https://community.ibm.com/community/user/communities/community-home?CommunityKey=6853271a-0a5c-45f9-a9a2-0186706f68ec",
          text: "IBM Envizi community",
        },
        {
          href: "https://www.ibm.com/think/author/envizi",
          text: "IBM Envizi blog",
        },
        {
          href: "https://www.ibm.com/products/envizi/emissions-calculations",
          text: "IBM Envizi website",
        },
      ],
    },
    {
      title: "Support",
      links: [
        {
          href: "https://your.feedback.ibm.com/jfe/form/SV_1YXxfTEf9MKci8u",
          text: "Provide feedback",
        },
        {
          href: supportLink,
          text: "Contact IBM",
        },
      ],
    },
  ];

  return resources;
};

export function ResourcesTab() {
  const { data: subscriptionData } = useAccountSubscription();

  const supportLink =
    !subscriptionData || subscriptionData.subscriptionType === "trial"
      ? "mailto:enviziemissionsapi@ibm.com"
      : "https://www.ibm.com/mysupport";

  const resourceSections = getResourceSections(supportLink);

  return (
    <div className="resouce">
      <div className="stack-gap-16">
        <p>
          Everything that you need to get started, build, and succeed with Envizi Emissions
          Calculations.
        </p>
        {resourceSections.map((section) => (
          <ResourceSection key={section.title} title={section.title} links={section.links} />
        ))}
      </div>
    </div>
  );
}
