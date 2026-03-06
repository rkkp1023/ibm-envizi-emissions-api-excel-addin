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
 * Fetches all activity types for all endpoints
 */
export async function fetchAllActivityTypes(): Promise<ActivityTypesMetadata> {
  const activityTypes: ActivityTypesMetadata = {};
  
  for (const endpoint of ACTIVITY_TYPE_ENDPOINTS) {
    activityTypes[endpoint] = await fetchActivityTypesForEndpoint(endpoint);
  }
  
  return activityTypes;
}

/**
 * Fetches area metadata (countries, states, powergrids)
 */
export async function fetchAreaMetadata(): Promise<AreaMetadata> {
  try {
    await ensureClient();
    
    const response = await Metadata.getArea();
    
    // Response structure: { locations: Location[] }
    // Use optional chaining for cleaner null checks
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
      
      // Add country in format: "alpha3code(countryName)"
      if (alpha3 && countryName) {
        countries.push(`${alpha3}(${countryName})`);
      }
      
      // Add state/provinces if present
      if (stateProvList && Array.isArray(stateProvList)) {
        stateProvinces.push(...stateProvList);
      }
      
      // Add power grids if present
      if (powerGridList && Array.isArray(powerGridList)) {
        powerGrids.push(...powerGridList);
      }
    }
    
    // Remove duplicates and sort using Array.from instead of spread
    // Use localeCompare for reliable alphabetical sorting
    const result = {
      countries: Array.from(new Set(countries)).sort((a, b) => a.localeCompare(b)),
      stateProvinces: Array.from(new Set(stateProvinces)).sort((a, b) => a.localeCompare(b)),
      powerGrids: Array.from(new Set(powerGrids)).sort((a, b) => a.localeCompare(b)),
    };
    
    return result;
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
      
      // Add unit in format: "unitSymbol(unitName)"
      if (unit && unitName) {
        units.push(`${unit}(${unitName})`);
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
