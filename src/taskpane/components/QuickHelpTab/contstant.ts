// Copyright IBM Corp. 2026

import { EmissionScopeConfig } from "../EmissionScopeSection/types";

export const gettingStartedSteps = [
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

export const usefulFeatures: EmissionScopeConfig[] = [
  {
    iconName: "AiRecommend",
    title: "Get a recommended data type",
    formulas: [
      {
        description:
          "Use AI to help you choose the activity type  when you’re not sure which one to use. You then review the recommended data type and decide whether it is appropriate to your activity.",
        formulaSyntax:
          "=ENVIZI.RECOMMEND_ACTIVITY_TYPE(search,country,[stateProvince],[unit],[scope],[date])",
        link: {
          href: "https://www.ibm.com/docs/SSFJN8P/topics/t_ctr_calc_emissions_excel.html",
          title: "Learn more about the recommender",
        },
      },
    ],
  },
  {
    title: "Ensure values are valid",
    formulas: [
      {
        description:
          "Ensure that you select valid input values. Use the ribbon buttons on the IBM Envizi tab to add dropdowns to the activity type, unit, and location cells. Select a cell, then click the relevant button.",
        link: {
          href: "https://www.ibm.com/docs/SSFJN8P/topics/t_ctr_calc_emissions_excel.html",
          title: "Learn more about selecting valid values",
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
        formulaSyntax:
          "=ENVIZI.HEADERS([functionName],[input],[output],[includeActivityTypeRecommender])",
        link: {
          href: "https://www.ibm.com/docs/SSFJN8P/topics/t_calc_with_scope_own.html",
          title: "Learn more about adding column titles",
        },
      },
    ],
  },
];

export const functions: EmissionScopeConfig[] = [
  {
    iconName: "GasStation",
    title: "Scope 1 emissions",
    formulas: [
      {
        category: "Stationary",
        description:
          "Calculate emissions for stationary combustion sources, such as boilers, heaters, and other fixed fuel-based energy systems.",
        formulaSyntax: "=ENVIZI.STATIONARY(type, value, unit, country, [stateProvince], [date])",
      },
      {
        category: "Mobile",
        description: "Calculates emissions from fleet fuel consumption.",
        formulaSyntax: "=ENVIZI.MOBILE(type, value, unit, country, [stateProvince], [date])",
      },
      {
        category: "Fugitive",
        description:
          "Calculates emissions from leaks of greenhouse gasses (GHG) from refrigeration or air conditioning units.",
        formulaSyntax: "=ENVIZI.FUGITIVE(type, value, unit, country, [stateProvince], [date])",
      },
    ],
  },
  {
    iconName: "Flash",
    title: "Scope 2 emissions",
    formulas: [
      {
        category: "Location",
        description:
          "Calculates emissions from electricity grids that provide an organization with energy.",
        formulaSyntax:
          "=ENVIZI.LOCATION(type, value, unit, country, [stateProvince], [date], [powerGrid])",
      },
    ],
  },
  {
    iconName: "Van",
    title: "Scope 3 emissions",
    formulas: [
      {
        category: "Transportation and distribution",
        description:
          "Calculates emissions from business-related employee travel, employee commutes, and freight transport.",
        formulaSyntax:
          "=ENVIZI.TRANSPORTATION_AND_DISTRIBUTION(type, value, unit, country, [stateProvince], [date])",
      },
    ],
  },
  {
    iconName: "CalculatorCheck",
    title: "Custom calculations",
    formulas: [
      {
        description:
          "Calculate emissions outputs by providing custom inputs such as the factor set, activity data, location, and time period. This function streamlines emission calculations into a single, flexible sheet irrespective of the use cases.",
        formulaSyntax:
          "=ENVIZI.CALCULATION(type, value, unit, country, [stateProvince], [date], [powerGrid])",
      },
    ],
  },
  {
    iconName: "SearchLocate",
    title: "Find factor sets",
    formulas: [
      {
        description:
          "Search metadata that are related to available factor sets by any combination of the following parameters: Category - Usecase, Scope, source, region, or year.",
        formulaSyntax: "=ENVIZI.FACTOR(type, unit, country, [stateProvince], [date])",
      },
      {
        description:
          "Fetch relevant factor sets by filtering by location, activity, and published year.",
        formulaSyntax:
          "=ENVIZI.FACTOR_SEARCH(search,country,[stateProvince],[unit],[scope],[date],[page],[size])",
      },
    ],
  },
];
