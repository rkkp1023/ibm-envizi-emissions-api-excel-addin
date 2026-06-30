// Copyright IBM Corp. 2026

import { AiRecommend } from "@carbon/icons-react";
import { Tab, TabList, TabPanels, Tabs } from "@carbon/react";
import { makeStyles } from "@griffel/react";

import { ActivityTypeRecommenderContent } from "../ActivityTypeRecommenderContent/ActivityTypeRecommenderContent";
import { ActivityTypeRecomenderContext } from "../MainPage/MainPage";

const useStyles = makeStyles({
  tabList: {
    "& .cds--tab--list": {
      width: "100%",
    },
  },
});

export interface ActivityRecommenderProps {
  context?: ActivityTypeRecomenderContext;
  onClose?: () => void;
}

export function ActivityTypeRecommender({ context, onClose }: Readonly<ActivityRecommenderProps>) {
  const styles = useStyles();

  return (
    <Tabs dismissable onTabCloseRequest={onClose}>
      <TabList fullWidth={true} className={styles.tabList}>
        <Tab>
          <span className="activity-tab-item">
            <AiRecommend />
            <span>Envizi Activity type recommender</span>
          </span>
        </Tab>
      </TabList>
      <TabPanels>
        <div className="recommender-wrapper">
          <ActivityTypeRecommenderContent context={context} onClose={onClose} />
        </div>
      </TabPanels>
    </Tabs>
  );
}
