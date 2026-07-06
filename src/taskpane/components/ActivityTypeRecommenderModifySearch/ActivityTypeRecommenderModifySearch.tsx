// Copyright IBM Corp. 2026

import { PreviousOutline } from "@carbon/icons-react";
import { Button, ComboBox, Form, Stack, TextInput } from "@carbon/react";
import { useEffect, useMemo, useRef, useState } from "react";

import { fetchAreaMetadata, fetchUnitMetadata } from "../../../commands/metadata-service";
import { readMetadataFromSheet } from "../../../commands/metadata-sheet-manager";
import { createComboBoxConfig } from "../../../functions/utils";
import type { ActivityTypeRecomenderContext } from "../MainPage/MainPage";

const scopes = [
  { id: "1", text: "1" },
  { id: "2", text: "2" },
  { id: "3.1", text: "3.1" },
  { id: "3.2", text: "3.2" },
  { id: "3.3", text: "3.3" },
  { id: "3.4", text: "3.4" },
  { id: "3.5", text: "3.5" },
  { id: "3.6", text: "3.6" },
  { id: "3.7", text: "3.7" },
  { id: "3.8", text: "3.8" },
  { id: "3.9", text: "3.9" },
  { id: "3.10", text: "3.10" },
  { id: "3.11", text: "3.11" },
  { id: "3.12", text: "3.12" },
  { id: "3.13", text: "3.13" },
  { id: "3.14", text: "3.14" },
  { id: "3.15", text: "3.15" },
];

export interface ActivityTypeRecommenderModifySearchProps {
  onBack?: () => void;
  onSearch?: (searchParams: SearchParams) => void;
  onCancel?: () => void;
  context?: ActivityTypeRecomenderContext;
}

export interface SearchParams {
  activityName: string;
  country: { id: string; text: string } | null;
  state: { id: string; text: string } | null;
  unit: { id: string; text: string } | null;
  scope: { id: string; text: string } | null;
}

export default function ActivityTypeRecommenderModifySearch({
  onBack,
  onSearch,
  onCancel,
  context,
}: Readonly<ActivityTypeRecommenderModifySearchProps>) {
  const [activityName, setActivityName] = useState(context?.search || "");
  const [country, setCountry] = useState<{ id: string; text: string } | null>(
    context?.country ? { id: context.country, text: context.country } : null
  );
  const [state, setState] = useState<{ id: string; text: string } | null>(
    context?.stateProvince ? { id: context.stateProvince, text: context.stateProvince } : null
  );
  const [unit, setUnit] = useState<{ id: string; text: string } | null>(
    context?.unit ? { id: context.unit, text: context.unit } : null
  );
  const [scope, setScope] = useState<{ id: string; text: string } | null>(null);

  // Metadata state
  const [countries, setCountries] = useState<{ id: string; text: string }[]>([]);
  const [states, setStates] = useState<{ id: string; text: string }[]>([]);
  const [units, setUnits] = useState<{ id: string; text: string }[]>([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [metadataError, setMetadataError] = useState<string | null>(null);

  // Validation states
  const [activityNameInvalid, setActivityNameInvalid] = useState(false);
  const [countryInvalid, setCountryInvalid] = useState(false);

  // Track if metadata has been fetched to prevent redundant calls
  const metadataFetchedRef = useRef(false);

  // Fetch metadata on component mount
  useEffect(() => {
    // Skip if already fetched
    if (metadataFetchedRef.current) {
      return;
    }

    const loadMetadata = async () => {
      setIsLoadingMetadata(true);
      setMetadataError(null);

      try {
        // First, try to read metadata from the Excel sheet
        const sheetMetadata = await readMetadataFromSheet();

        if (sheetMetadata) {
          // Use cached metadata from sheet
          console.log("Using cached metadata from Excel sheet");

          const countryItems = sheetMetadata.countries.map((countryStr: string) => ({
            id: countryStr,
            text: countryStr,
          }));

          const stateItems = sheetMetadata.stateProvinces.map((stateStr: string) => ({
            id: stateStr,
            text: stateStr,
          }));

          const unitItems = sheetMetadata.units.map((unitStr: string) => ({
            id: unitStr,
            text: unitStr,
          }));

          setCountries(countryItems);
          setStates(stateItems);
          setUnits(unitItems);
        } else {
          // Fallback to API if sheet data is not available
          console.log("Sheet metadata not available, fetching from API");

          const [areaMetadata, unitMetadata] = await Promise.all([
            fetchAreaMetadata(),
            fetchUnitMetadata(),
          ]);

          // Transform area metadata to combobox format
          const countryItems = areaMetadata.countries.map((countryStr: string) => ({
            id: countryStr,
            text: countryStr,
          }));

          const stateItems = areaMetadata.stateProvinces.map((stateStr: string) => ({
            id: stateStr,
            text: stateStr,
          }));

          // Transform unit metadata to combobox format
          const unitItems = unitMetadata.units.map((unitStr: string) => ({
            id: unitStr,
            text: unitStr,
          }));

          setCountries(countryItems);
          setStates(stateItems);
          setUnits(unitItems);
        }

        // Mark as fetched
        metadataFetchedRef.current = true;
      } catch (error) {
        console.error("Failed to load metadata:", error);
        setMetadataError("Failed to load metadata. Please try again.");
      } finally {
        setIsLoadingMetadata(false);
      }
    };

    loadMetadata();
  }, []);

  const validateForm = (): boolean => {
    let isValid = true;

    // Validate activity name (required)
    if (!activityName || activityName.trim() === "") {
      setActivityNameInvalid(true);
      isValid = false;
    } else {
      setActivityNameInvalid(false);
    }

    // Validate country (required)
    if (country) {
      setCountryInvalid(false);
    } else {
      setCountryInvalid(true);
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const searchParams: SearchParams = {
      activityName,
      country,
      state,
      unit,
      scope,
    };
    onSearch?.(searchParams);
  };

  const handleCancel = () => {
    // Reset validation states
    setActivityNameInvalid(false);
    setCountryInvalid(false);
    onCancel?.();
  };

  const countryComboBoxProps = useMemo(
    () =>
      createComboBoxConfig({
        items: countries,
        selectedItem: country,
        setSelectedItem: setCountry,
        onSelectedItemChange: (selectedItem) => {
          if (countryInvalid && selectedItem) {
            setCountryInvalid(false);
          }
        },
      }),
    [countries, country, countryInvalid]
  );

  const stateComboBoxProps = useMemo(
    () =>
      createComboBoxConfig({
        items: states,
        selectedItem: state,
        setSelectedItem: setState,
      }),
    [states, state]
  );

  const unitComboBoxProps = useMemo(
    () =>
      createComboBoxConfig({
        items: units,
        selectedItem: unit,
        setSelectedItem: setUnit,
      }),
    [units, unit]
  );

  const scopeComboBoxProps = useMemo(
    () =>
      createComboBoxConfig({
        items: scopes,
        selectedItem: scope,
        setSelectedItem: setScope,
      }),
    [scope]
  );

  return (
    <Stack gap={3} className="modify-search-container">
      <div className="page-header">
        <div className="left">
          <Button
            className="back-btn"
            kind="ghost"
            onClick={onBack}
            hasIconOnly
            iconDescription="Go back"
          >
            <PreviousOutline size={20} />
          </Button>
        </div>

        <span className="heading-title">Modify search</span>

        <div className="right" />
      </div>

      {metadataError && (
        <div className="metadata-error" style={{ color: "red", padding: "0.5rem" }}>
          {metadataError}
        </div>
      )}

      <Form onSubmit={handleSubmit}>
        <Stack gap={5} className="modify-search-form">
          <TextInput
            id="activity-name"
            labelText="Activity name (Required)"
            value={activityName}
            onChange={(e) => {
              setActivityName(e.target.value);
              if (activityNameInvalid && e.target.value.trim() !== "") {
                setActivityNameInvalid(false);
              }
            }}
            invalid={activityNameInvalid}
            invalidText="Activity name is required"
            required
          />

          <ComboBox
            id="country"
            titleText="Country (Required)"
            {...countryComboBoxProps}
            invalid={countryInvalid}
            invalidText="Country is required"
            disabled={isLoadingMetadata}
            helperText={isLoadingMetadata ? "Loading countries..." : undefined}
          />

          <ComboBox
            id="state"
            titleText="State/province"
            {...stateComboBoxProps}
            disabled={isLoadingMetadata}
            helperText={isLoadingMetadata ? "Loading states..." : undefined}
          />

          <ComboBox
            id="unit"
            titleText="Unit"
            {...unitComboBoxProps}
            disabled={isLoadingMetadata}
            helperText={isLoadingMetadata ? "Loading units..." : undefined}
          />

          <ComboBox id="scope" titleText="Scope" {...scopeComboBoxProps} />

          <div className="footer-actions">
            <Button size="md" type="submit" kind="primary">
              Search
            </Button>

            <Button size="md" type="button" kind="secondary" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </Stack>
      </Form>
    </Stack>
  );
}
