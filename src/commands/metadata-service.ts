// Copyright IBM Corp. 2026

import { Metadata } from "emissions-api-sdk";

import { ensureClient } from "../functions/client";

/**
 * Activity type endpoints for metadata.types
 */
export const ACTIVITY_TYPE_ENDPOINTS = [
  "location",
  "stationary",
  "mobile",
  "fugitive",
  "transportation-and-distribution",
  "economic-activity",
  "real-estate",
  "calculation", // This is for "All"
] as const;

export type ActivityTypeEndpoint = (typeof ACTIVITY_TYPE_ENDPOINTS)[number];

/**
 * Metadata for activity types organized by endpoint
 */
export interface ActivityTypesMetadata {
  [endpoint: string]: string[];
}

/**
 * Area metadata structure
 */
export interface AreaMetadata {
  countries: string[]; // Format: "alpha3code(countryName)"
  stateProvinces: string[];
  powerGrids: string[];
}

/**
 * Unit metadata structure
 */
export interface UnitMetadata {
  units: string[]; // Format: "unitSymbol(unitName)"
}

/**
 * Complete metadata structure
 */
export interface CompleteMetadata {
  activityTypes: ActivityTypesMetadata;
  areas: AreaMetadata;
  units: UnitMetadata;
  timestamp: string;
}

/**
 * Fetches activity types for a specific endpoint
 */
async function fetchActivityTypesForEndpoint(endpoint: ActivityTypeEndpoint): Promise<string[]> {
  try {
    await ensureClient();
    
    // For calculation endpoint, call without parameters to get all types
    const endpointParam = endpoint === "calculation" ? undefined : endpoint;
    
    const response = await Metadata.getTypes(endpointParam);
    
    // Response structure: { types: string[] }
    // Use optional chaining for cleaner null checks
    if (!response?.types || !Array.isArray(response.types)) {
      return [];
    }
    
    return response.types;
  } catch (error) {
    console.error(`Failed to fetch activity types for endpoint ${endpoint}:`, error);
    return [];
  }
}

/**
 * Fetches all activity types for all endpoints in parallel
 * Uses Promise.all for optimal performance
 */
export async function fetchAllActivityTypes(): Promise<ActivityTypesMetadata> {
  const activityTypes: ActivityTypesMetadata = {};
  
  // Fetch all endpoints in parallel for better performance
  const promises = ACTIVITY_TYPE_ENDPOINTS.map((endpoint) =>
    fetchActivityTypesForEndpoint(endpoint).then((types) => ({ endpoint, types }))
  );
  
  const results = await Promise.all(promises);
  
  // Map results back to the activityTypes object
  for (const { endpoint, types } of results) {
    activityTypes[endpoint] = types;
  }
  
  return activityTypes;
}

/**
 * Helper function to format country string
 */
function formatCountry(alpha3: string, countryName: string): string {
  const trimmedAlpha3 = alpha3.trim();
  const trimmedCountryName = countryName.trim();
  return `${trimmedAlpha3} (${trimmedCountryName})`;
}

/**
 * Helper function to process state/province list
 */
function processStateProvinces(alpha3: string, stateProvList: string[]): string[] {
  if (!Array.isArray(stateProvList)) return [];
  
  const trimmedAlpha3 = alpha3.trim();
  return stateProvList
    .filter(stateProv => stateProv)
    .map(stateProv => `${trimmedAlpha3} - ${stateProv.trim()}`);
}

/**
 * Helper function to process power grid list
 */
function processPowerGrids(alpha3: string, powerGridList: string[]): string[] {
  if (!Array.isArray(powerGridList)) return [];
  
  const trimmedAlpha3 = alpha3.trim();
  return powerGridList
    .filter(powerGrid => powerGrid)
    .map(powerGrid => `${trimmedAlpha3} - ${powerGrid.trim()}`);
}

/**
 * Helper function to deduplicate and sort array
 */
function deduplicateAndSort(items: string[]): string[] {
  return Array.from(new Set(items)).sort((a, b) => a.localeCompare(b));
}

/**
 * Fetches area metadata (countries, states, powergrids)
 */
export async function fetchAreaMetadata(): Promise<AreaMetadata> {
  try {
    await ensureClient();
    
    const response = await Metadata.getArea();
    
    // Response structure: { locations: Location[] }
    if (!response?.locations || !Array.isArray(response.locations)) {
      return { countries: [], stateProvinces: [], powerGrids: [] };
    }
    
    const countries: string[] = [];
    const stateProvinces: string[] = [];
    const powerGrids: string[] = [];
    
    // Process each location entry
    for (const location of response.locations) {
      if (!location || typeof location !== "object") continue;
      
      const { alpha3, countryName, stateProvinces: stateProvList, powerGrids: powerGridList } = location;
      
      // Add country in format: "alpha3code (countryName)"
      if (alpha3 && countryName) {
        countries.push(formatCountry(alpha3, countryName));
      }
      
      // Add state/provinces with country code prefix
      if (alpha3 && stateProvList) {
        stateProvinces.push(...processStateProvinces(alpha3, stateProvList));
      }
      
      // Add power grids with country code prefix
      if (alpha3 && powerGridList) {
        powerGrids.push(...processPowerGrids(alpha3, powerGridList));
      }
    }
    
    return {
      countries: deduplicateAndSort(countries),
      stateProvinces: deduplicateAndSort(stateProvinces),
      powerGrids: deduplicateAndSort(powerGrids),
    };
  } catch (error) {
    console.error("Failed to fetch area metadata:", error);
    return { countries: [], stateProvinces: [], powerGrids: [] };
  }
}

/**
 * Fetches unit metadata
 */
export async function fetchUnitMetadata(): Promise<UnitMetadata> {
  try {
    await ensureClient();
    
    const response = await Metadata.getUnits();
    
    // Response structure: { units: Unit[] } where Unit = { unit: string, unitName: string }
    // Use optional chaining for cleaner null checks
    if (!response?.units || !Array.isArray(response.units)) {
      return { units: [] };
    }
    
    const units: string[] = [];
    
    // Process each unit entry
    for (const unitEntry of response.units) {
      if (!unitEntry || typeof unitEntry !== "object") continue;
      
      const { unit, unitName } = unitEntry;
      
      // Add unit in format: "unitSymbol (unitName)" with single space
      // Trim all values to remove any leading/trailing spaces
      if (unit && unitName) {
        const trimmedUnit = unit.trim();
        const trimmedUnitName = unitName.trim();
        units.push(`${trimmedUnit} (${trimmedUnitName})`);
      }
    }
    
    // Remove duplicates and sort using Array.from instead of spread
    // Use localeCompare for reliable alphabetical sorting
    const result = {
      units: Array.from(new Set(units)).sort((a, b) => a.localeCompare(b)),
    };
    
    return result;
  } catch (error) {
    console.error("Failed to fetch unit metadata:", error);
    return { units: [] };
  }
}

/**
 * Fetches all metadata (types, areas, units)
 */
export async function fetchAllMetadata(): Promise<CompleteMetadata> {
  const [activityTypes, areas, units] = await Promise.all([
    fetchAllActivityTypes(),
    fetchAreaMetadata(),
    fetchUnitMetadata(),
  ]);
  
  const result = {
    activityTypes,
    areas,
    units,
    timestamp: new Date().toISOString(),
  };
  
  return result;
}

// Made with Bob
