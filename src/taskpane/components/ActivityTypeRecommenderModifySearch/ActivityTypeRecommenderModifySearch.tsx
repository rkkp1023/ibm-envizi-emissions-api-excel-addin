// Copyright IBM Corp. 2026

import { PreviousOutline } from "@carbon/icons-react";
import { Button, ComboBox, Form, InlineNotification, Stack, TextInput } from "@carbon/react";
import { useEffect, useMemo, useState } from "react";

import { fetchAreaMetadata, fetchUnitMetadata } from "../../../commands/metadata-service";
import { readMetadataFromSheet } from "../../../commands/metadata-sheet-manager";
import { createComboBoxConfig } from "../../utils/comboBoxConfig";
import type { ActivityTypeRecomenderContext } from "../MainPage/MainPage";

const scopes = ["1", "2", "3.1", "3.2", "3.3", "3.4", "3.5", "3.6", "3.7", "3.8", "3.9", "3.10", "3.11", "3.12", "3.13", "3.14", "3.15"].map(
  (id) => ({ id, text: id })
);

export interface ActivityTypeRecommenderModifySearchProps {
  onBack?: () => void;
  onSearch?: (searchParams: SearchParams) => void;
  onCancel?: () => void;
  context?: ActivityTypeRecomenderContext;
  showNoResultsNotification?: boolean;
  disableBack?: boolean;
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
  showNoResultsNotification = false,
  disableBack = false,
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

  // Fetch metadata on component mount
  useEffect(() => {
    if (isLoadingMetadata) {
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
            disabled={disableBack}
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

      {showNoResultsNotification && (
        <div className="error-notification">
          <InlineNotification
            kind="error"
            title="No results"
            subtitle="No recommendations are available for the provided input. Please change the parameters and try again."
            lowContrast
            hideCloseButton
            className="error-notification"
          />
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
