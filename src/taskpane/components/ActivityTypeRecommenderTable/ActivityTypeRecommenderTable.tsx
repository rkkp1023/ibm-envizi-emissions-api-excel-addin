// Copyright IBM Corp. 2026

import { Earth } from "@carbon/icons-react";
import {
  AILabel,
  DataTable,
  FormLabel,
  PaginationNav,
  RadioButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@carbon/react";
import { makeStyles } from "@griffel/react";
import { useState } from "react";

export interface ActivityTypeRecommendation {
  id: string;
  activityType: string;
  confidence: number;
  activityDescription: string;
  region?: string;
  scope?: string;
  units?: string[];
}

interface ActivityRecommenderTableProps {
  recommendations: ActivityTypeRecommendation[];
  onSelect?: (selectedRecommendation: ActivityTypeRecommendation) => void;
}

const useStyles = makeStyles({
  tableConatiner: {
    "& .cds--data-table": {
      width: "100%",
      minWidth: "600px",
      tableLayout: "fixed",

      "& th:first-child, & td:first-child": {
        minWidth: "250px",
        width: "50vw",
      },

      "& th:nth-child(2), & td:nth-child(2)": {
        minWidth: "100px",
        width: "20vw",
      },

      "& th:nth-child(3), & td:nth-child(3)": {
        minWidth: "250px",
        width: "30vw",
      },
    },
  },
});

const headers = [
  {
    key: "activityType",
    header: "Activity type",
    decorator: <AILabel autoAlign size="md"></AILabel>,
  },
  { key: "confidence", header: "Confidence", decorator: <AILabel autoAlign size="md"></AILabel> },
  { key: "description", header: "Description", decorator: <AILabel autoAlign size="md"></AILabel> },
];

export default function ActivityTypeRecommenderTable({
  recommendations,
  onSelect,
}: ActivityRecommenderTableProps) {
  const styles = useStyles();
  const [selectedId, setSelectedId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  const handleRadioChange = (id: string) => {
    setSelectedId(id);
    const selectedRecommendation = recommendations.find((r) => r.id === id);
    if (selectedRecommendation && onSelect) {
      onSelect(selectedRecommendation);
    }
  };

  const startIndex = currentPage * pageSize;
  const endIndex = startIndex + pageSize;
  const totalItems = Math.ceil(recommendations.length / pageSize);
  const paginatedRecommendations = recommendations.slice(startIndex, endIndex);

  return (
    <div className="activity-type-table-container">
      <DataTable rows={paginatedRecommendations} headers={headers}>
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
          <TableContainer className={styles.tableConatiner}>
            <Table {...getTableProps()} size="md">
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })} key={header.key}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, index) => {
                  const isSelected = selectedId === row.id;
                  // Access data directly from paginatedRecommendations using index
                  const rowData = paginatedRecommendations[index];

                  return (
                    <TableRow
                      {...getRowProps({ row })}
                      key={row.id}
                      className={isSelected ? "activity-type-selected-row" : ""}
                    >
                      <TableCell>
                        <div className="activity-type-table-row__activity-cell">
                          <div className="activity-type-table-row__radio-wrapper">
                            <RadioButton
                              id={`radio-${row.id}`}
                              name="activity-selection"
                              value={row.id}
                              checked={isSelected}
                              onChange={() => handleRadioChange(row.id)}
                              labelText=""
                            />
                          </div>

                          <div className="activity-type-table-row__content">
                            <div>{rowData.activityType}</div>
                            <div className="activity-type-table-row__metadata">
                              <FormLabel className="activity-type-table-row__region">
                                <Earth size={16} />
                                Global
                              </FormLabel>

                              <div className="activity-type-table-row__details-list">
                                <FormLabel className="activity-type-table-row__details-item">
                                  {rowData.scope}
                                </FormLabel>
                                <FormLabel className="activity-type-table-row__details-item">
                                  {rowData.units?.join(", ")}
                                </FormLabel>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="activity-type-table-row__confidence-cell">
                        {rowData.confidence}%
                      </TableCell>
                      <TableCell>{rowData.activityDescription}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
      <div className="activity-type-pagination-container">
        <PaginationNav
          itemsShown={pageSize}
          page={currentPage}
          totalItems={totalItems}
          onChange={(newPage) => {
            setCurrentPage(newPage);
          }}
        />
      </div>
    </div>
  );
}
