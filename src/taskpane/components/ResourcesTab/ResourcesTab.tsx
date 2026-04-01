/*
 * Copyright IBM Corp. 2026
 */

import { Link } from "@fluentui/react-components";
import { getEnableEnviziLogin } from "../../../common/env";
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

const getResourceSections = (supportLink: string, formId: string) => [
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
        href: `https://your.feedback.ibm.com/jfe/form/${formId}`,
        text: "Provide feedback",
      },
      {
        href: supportLink,
        text: "Contact IBM",
      },
    ],
  },
];

export function ResourcesTab() {
  const { data: subscriptionData } = useAccountSubscription();

  const supportLink =
    !subscriptionData || subscriptionData.subscriptionType === "trial"
      ? "mailto:enviziemissionsapi@ibm.com"
      : "https://www.ibm.com/mysupport";

  const formId = getEnableEnviziLogin() ? "SV_1YXxfTEf9MKci8u" : "SV_7Vh96izZeRghY34";

  const resourceSections = getResourceSections(supportLink, formId);

  return (
    <div className="resouce">
      <div className="stack-gap-16">
        <p>
          Everything you need to get started, build, and succeed with the Envizi Emissions API Excel
          add-in.
        </p>
        {resourceSections.map((section) => (
          <ResourceSection key={section.title} title={section.title} links={section.links} />
        ))}
      </div>
    </div>
  );
}
