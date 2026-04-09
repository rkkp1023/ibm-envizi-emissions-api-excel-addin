=========
Reference
=========

This section describes all available custom functions provided by IBM Envizi for Excel.

Each function calls the IBM Envizi Emissions API from Excel to calculate greenhouse gas (GHG) emissions based on provided inputs.

General Notes
-------------

- All functions must be entered directly into Excel cells.
- Arguments in square brackets (``[ ]``) are optional.
- Errors are returned as Excel error messages.
- Units must follow the supported unit conventions defined in Envizi.

Functions
---------

Location-based Emissions
~~~~~~~~~~~~~~~~~~~~~~~~

**Syntax**

.. code-block:: none

   =ENVIZI.LOCATION(type, value, unit, country, [stateProvince], [date], [powerGrid])

**Parameters**

- ``type`` – Activity type
- ``value`` – Numeric activity value
- ``unit`` – Unit of measurement (default: kWh if not specified)
- ``country`` – ISO alpha-3 country code
- ``stateProvince`` *(optional)* – Geographic state or province
- ``date`` *(optional)* – Activity date
- ``powerGrid`` *(optional)* – Power grid region identifier

---

**Alternate Syntax (factorId)**

.. code-block:: none

   =ENVIZI.LOCATION_BY_FACTORID(factorId, value, [unit])

- ``factorId`` – Factor ID from Envizi
- ``value`` – Numeric activity value
- ``unit`` *(optional)* – Unit of measurement

**Outputs**

.. list-table::
   :header-rows: 1
   :widths: 20 80

   * - Column
     - Description
   * - ``Total CO2e``
     - The total emissions expressed as carbon dioxide equivalent (CO2e). This is the sum of all GHGs weighted by their global warming potential (GWP).
   * - ``CO2``
     - Direct carbon dioxide (CO2) emissions reported separately.
   * - ``CH4``
     - Methane (CH4) emissions reported separately.
   * - ``N2O``
     - Nitrous oxide (N2O) emissions reported separately.
   * - ``HFC``
     - Hydrofluorocarbon (HFC) emissions reported separately.
   * - ``PFC``
     - Perfluorocarbon (PFC) emissions reported separately.
   * - ``SF6``
     - Sulfur hexafluoride (SF6) emissions reported separately.
   * - ``NF3``
     - Nitrogen trifluoride (NF3) emissions reported separately.
   * - ``bioCO2``
     - Biogenic carbon dioxide (bioCO2) emissions, if applicable.
   * - ``directCO2``
     - Direct CO2 emissions explicitly reported when available.
   * - ``Unit``
     - Unit of measurement for the emissions result.
   * - ``Description``
     - Provides details on the factor set used in the calculation.
   * - ``Transaction Id``
     - Unique identifier for the calculation transaction, used for reference and auditing.

---

Stationary Source Emissions
~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: none

   =ENVIZI.STATIONARY(type, value, unit, country, [stateProvince], [date])

.. code-block:: none

   =ENVIZI.STATIONARY_BY_FACTORID(factorId, value, unit)

**Outputs**

.. list-table::
   :header-rows: 1
   :widths: 20 80

   * - Column
     - Description
   * - ``Total CO2e``
     - The total emissions expressed as carbon dioxide equivalent (CO2e). This is the sum of all GHGs weighted by their global warming potential (GWP).
   * - ``CO2``
     - Direct carbon dioxide (CO2) emissions reported separately.
   * - ``CH4``
     - Methane (CH4) emissions reported separately.
   * - ``N2O``
     - Nitrous oxide (N2O) emissions reported separately.
   * - ``HFC``
     - Hydrofluorocarbon (HFC) emissions reported separately.
   * - ``PFC``
     - Perfluorocarbon (PFC) emissions reported separately.
   * - ``SF6``
     - Sulfur hexafluoride (SF6) emissions reported separately.
   * - ``NF3``
     - Nitrogen trifluoride (NF3) emissions reported separately.
   * - ``bioCO2``
     - Biogenic carbon dioxide (bioCO2) emissions, if applicable.
   * - ``directCO2``
     - Direct CO2 emissions explicitly reported when available.
   * - ``Unit``
     - Unit of measurement for the emissions result.
   * - ``Description``
     - Provides details on the factor set used in the calculation.
   * - ``Transaction Id``
     - Unique identifier for the calculation transaction, used for reference and auditing.

---

Fugitive Emissions
~~~~~~~~~~~~~~~~~~

.. code-block:: none

   =ENVIZI.FUGITIVE(type, value, unit, country, [stateProvince], [date])

.. code-block:: none

   =ENVIZI.FUGITIVE_BY_FACTORID(factorId, value, unit)

**Outputs**

.. list-table::
   :header-rows: 1
   :widths: 20 80

   * - Column
     - Description
   * - ``Total CO2e``
     - The total emissions expressed as carbon dioxide equivalent (CO2e). This is the sum of all GHGs weighted by their global warming potential (GWP).
   * - ``CO2``
     - Direct carbon dioxide (CO2) emissions reported separately.
   * - ``CH4``
     - Methane (CH4) emissions reported separately.
   * - ``N2O``
     - Nitrous oxide (N2O) emissions reported separately.
   * - ``HFC``
     - Hydrofluorocarbon (HFC) emissions reported separately.
   * - ``PFC``
     - Perfluorocarbon (PFC) emissions reported separately.
   * - ``SF6``
     - Sulfur hexafluoride (SF6) emissions reported separately.
   * - ``NF3``
     - Nitrogen trifluoride (NF3) emissions reported separately.
   * - ``bioCO2``
     - Biogenic carbon dioxide (bioCO2) emissions, if applicable.
   * - ``directCO2``
     - Direct CO2 emissions explicitly reported when available.
   * - ``Unit``
     - Unit of measurement for the emissions result.
   * - ``Description``
     - Provides details on the factor set used in the calculation.
   * - ``Transaction Id``
     - Unique identifier for the calculation transaction, used for reference and auditing.

---

Mobile Emissions
~~~~~~~~~~~~~~~~

.. code-block:: none

   =ENVIZI.MOBILE(type, value, unit, country, [stateProvince], [date])

.. code-block:: none

   =ENVIZI.MOBILE_BY_FACTORID(factorId, value, unit)

**Outputs**

.. list-table::
   :header-rows: 1
   :widths: 20 80

   * - Column
     - Description
   * - ``Total CO2e``
     - The total emissions expressed as carbon dioxide equivalent (CO2e). This is the sum of all GHGs weighted by their global warming potential (GWP).
   * - ``CO2``
     - Direct carbon dioxide (CO2) emissions reported separately.
   * - ``CH4``
     - Methane (CH4) emissions reported separately.
   * - ``N2O``
     - Nitrous oxide (N2O) emissions reported separately.
   * - ``HFC``
     - Hydrofluorocarbon (HFC) emissions reported separately.
   * - ``PFC``
     - Perfluorocarbon (PFC) emissions reported separately.
   * - ``SF6``
     - Sulfur hexafluoride (SF6) emissions reported separately.
   * - ``NF3``
     - Nitrogen trifluoride (NF3) emissions reported separately.
   * - ``bioCO2``
     - Biogenic carbon dioxide (bioCO2) emissions, if applicable.
   * - ``directCO2``
     - Direct CO2 emissions explicitly reported when available.
   * - ``Unit``
     - Unit of measurement for the emissions result.
   * - ``Description``
     - Provides details on the factor set used in the calculation.
   * - ``Transaction Id``
     - Unique identifier for the calculation transaction, used for reference and auditing.

---

Transportation and Distribution
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: none

   =ENVIZI.TRANSPORTATION_AND_DISTRIBUTION(type, value, unit, country, [stateProvince], [date])

.. code-block:: none

   =ENVIZI.TRANSPORTATION_AND_DISTRIBUTION_BY_FACTORID(factorId, value, unit)

**Outputs**

.. list-table::
   :header-rows: 1
   :widths: 20 80

   * - Column
     - Description
   * - ``Total CO2e``
     - The total emissions expressed as carbon dioxide equivalent (CO2e). This is the sum of all GHGs weighted by their global warming potential (GWP).
   * - ``CO2``
     - Direct carbon dioxide (CO2) emissions reported separately.
   * - ``CH4``
     - Methane (CH4) emissions reported separately.
   * - ``N2O``
     - Nitrous oxide (N2O) emissions reported separately.
   * - ``HFC``
     - Hydrofluorocarbon (HFC) emissions reported separately.
   * - ``PFC``
     - Perfluorocarbon (PFC) emissions reported separately.
   * - ``SF6``
     - Sulfur hexafluoride (SF6) emissions reported separately.
   * - ``NF3``
     - Nitrogen trifluoride (NF3) emissions reported separately.
   * - ``bioCO2``
     - Biogenic carbon dioxide (bioCO2) emissions, if applicable.
   * - ``directCO2``
     - Direct CO2 emissions explicitly reported when available.
   * - ``Unit``
     - Unit of measurement for the emissions result.
   * - ``Description``
     - Provides details on the factor set used in the calculation.
   * - ``Transaction Id``
     - Unique identifier for the calculation transaction, used for reference and auditing.

---

Calculation
~~~~~~~~~~~

.. code-block:: none

   =ENVIZI.CALCULATION(type, value, unit, country, [stateProvince], [date], [powerGrid])

.. code-block:: none

   =ENVIZI.CALCULATION_BY_FACTORID(factorId, value, unit)

**Outputs**

.. list-table::
   :header-rows: 1
   :widths: 20 80

   * - Column
     - Description
   * - ``Total CO2e``
     - The total emissions expressed as carbon dioxide equivalent (CO2e). This is the sum of all GHGs weighted by their global warming potential (GWP).
   * - ``CO2``
     - Direct carbon dioxide (CO2) emissions reported separately.
   * - ``CH4``
     - Methane (CH4) emissions reported separately.
   * - ``N2O``
     - Nitrous oxide (N2O) emissions reported separately.
   * - ``HFC``
     - Hydrofluorocarbon (HFC) emissions reported separately.
   * - ``PFC``
     - Perfluorocarbon (PFC) emissions reported separately.
   * - ``SF6``
     - Sulfur hexafluoride (SF6) emissions reported separately.
   * - ``NF3``
     - Nitrogen trifluoride (NF3) emissions reported separately.
   * - ``bioCO2``
     - Biogenic carbon dioxide (bioCO2) emissions, if applicable.
   * - ``directCO2``
     - Direct CO2 emissions explicitly reported when available.
   * - ``Unit``
     - Unit of measurement for the emissions result.
   * - ``Description``
     - Provides details on the factor set used in the calculation.
   * - ``Transaction Id``
     - Unique identifier for the calculation transaction, used for reference and auditing.

---

Factor
~~~~~~

.. code-block:: none

   =ENVIZI.FACTOR(type, unit, country, [stateProvince], [date])

.. code-block:: none

   =ENVIZI.FACTORBYID(factorId, [unit])

**Outputs**

.. list-table::
   :header-rows: 1
   :widths: 20 80

   * - Column
     - Description
   * - ``factorSet``
     - The emission factor dataset used for calculation (e.g., DEFRA, EPA).
   * - ``source``
     - Reference source of the factor (e.g., publication, license link).
   * - ``activityType``
     - Category of data (e.g., Electricity - Scope 3).
   * - ``activityUnit``
     - Unit of input activity data (e.g., kWh, liters).
   * - ``name``
     - Human-readable name of the factor (e.g., "Electricity: UK - 2023").
   * - ``Description``
     - Text description of the factor (e.g., "Electricity generated").
   * - ``effectiveFrom``
     - Dates for which the factor is valid from.
   * - ``effectiveTo``
     - Dates for which the factor is valid to.
   * - ``publishedFrom``
     - Publication period of the factor set from.
   * - ``publishedTo``
     - Publication period of the factor set to.
   * - ``region``
     - Geographic region where the factor applies.
   * - ``Total CO2e``
     - The total emissions expressed as carbon dioxide equivalent (CO2e), sum of all GHGs weighted by GWP.
   * - ``CO2``
     - Carbon dioxide (CO2) emissions reported separately.
   * - ``CH4``
     - Methane (CH4) emissions reported separately.
   * - ``N2O``
     - Nitrous oxide (N2O) emissions reported separately.
   * - ``HFC``
     - Hydrofluorocarbon (HFC) emissions reported separately.
   * - ``PFC``
     - Perfluorocarbon (PFC) emissions reported separately.
   * - ``SF6``
     - Sulfur hexafluoride (SF6) emissions reported separately.
   * - ``NF3``
     - Nitrogen trifluoride (NF3) emissions reported separately.
   * - ``bioCO2``
     - Biogenic carbon dioxide (bioCO2) emissions, if applicable.
   * - ``indirectCO2e``
     - Indirect CO2 equivalent emissions reported separately.
   * - ``Unit``
     - Output measurement unit (typically kgCO2e).
   * - ``Transaction Id``
     - Unique identifier for the calculation transaction, used for reference and auditing.

---

Economic Activity
~~~~~~~~~~~~~~~~~

**Syntax**

.. code-block:: none

   =ENVIZI.ECONOMIC_ACTIVITY(type, value, unit, country, [stateProvince], [date])

**Parameters**

- ``type`` – Activity type
- ``value`` – Numeric activity value
- ``unit`` – Unit of measurement
- ``country`` – ISO alpha-3 country code
- ``stateProvince`` *(optional)* – Geographic state or province
- ``date`` *(optional)* – Activity date

---

**Alternate Syntax (factorId)**

.. code-block:: none

   =ENVIZI.ECONOMIC_ACTIVITY_BY_FACTORID(factorId, value, unit)

- ``factorId`` – Factor ID from Envizi
- ``value`` – Numeric activity value
- ``unit`` – Unit of measurement

**Outputs**

.. list-table::
   :header-rows: 1
   :widths: 20 80

   * - Column
     - Description
   * - ``Total CO2e``
     - The total emissions expressed as carbon dioxide equivalent (CO2e). This is the sum of all GHGs weighted by their global warming potential (GWP).
   * - ``CO2``
     - Direct carbon dioxide (CO2) emissions reported separately.
   * - ``CH4``
     - Methane (CH4) emissions reported separately.
   * - ``N2O``
     - Nitrous oxide (N2O) emissions reported separately.
   * - ``HFC``
     - Hydrofluorocarbon (HFC) emissions reported separately.
   * - ``PFC``
     - Perfluorocarbon (PFC) emissions reported separately.
   * - ``SF6``
     - Sulfur hexafluoride (SF6) emissions reported separately.
   * - ``NF3``
     - Nitrogen trifluoride (NF3) emissions reported separately.
   * - ``bioCO2``
     - Biogenic carbon dioxide (bioCO2) emissions, if applicable.
   * - ``directCO2``
     - Direct CO2 emissions explicitly reported when available.
   * - ``Unit``
     - Unit of measurement for the emissions result.
   * - ``Description``
     - Provides details on the factor set used in the calculation.
   * - ``Transaction Id``
     - Unique identifier for the calculation transaction, used for reference and auditing.

---

Real Estate
~~~~~~~~~~~

**Syntax**

.. code-block:: none

   =ENVIZI.REAL_ESTATE(type, value, unit, country, [stateProvince], [date])

**Parameters**

- ``type`` – Activity type
- ``value`` – Numeric activity value
- ``unit`` – Unit of measurement
- ``country`` – ISO alpha-3 country code
- ``stateProvince`` *(optional)* – Geographic state or province
- ``date`` *(optional)* – Activity date

---

**Alternate Syntax (factorId)**

.. code-block:: none

   =ENVIZI.REAL_ESTATE_BY_FACTORID(factorId, value, unit)

- ``factorId`` – Factor ID from Envizi
- ``value`` – Numeric activity value
- ``unit`` – Unit of measurement

**Outputs**

.. list-table::
   :header-rows: 1
   :widths: 20 80

   * - Column
     - Description
   * - ``Total CO2e``
     - The total emissions expressed as carbon dioxide equivalent (CO2e). This is the sum of all GHGs weighted by their global warming potential (GWP).
   * - ``CO2``
     - Direct carbon dioxide (CO2) emissions reported separately.
   * - ``CH4``
     - Methane (CH4) emissions reported separately.
   * - ``N2O``
     - Nitrous oxide (N2O) emissions reported separately.
   * - ``HFC``
     - Hydrofluorocarbon (HFC) emissions reported separately.
   * - ``PFC``
     - Perfluorocarbon (PFC) emissions reported separately.
   * - ``SF6``
     - Sulfur hexafluoride (SF6) emissions reported separately.
   * - ``NF3``
     - Nitrogen trifluoride (NF3) emissions reported separately.
   * - ``bioCO2``
     - Biogenic carbon dioxide (bioCO2) emissions, if applicable.
   * - ``directCO2``
     - Direct CO2 emissions explicitly reported when available.
   * - ``Unit``
     - Unit of measurement for the emissions result.
   * - ``Description``
     - Provides details on the factor set used in the calculation.
   * - ``Transaction Id``
     - Unique identifier for the calculation transaction, used for reference and auditing.

---

Factor Search
~~~~~~~~~~~~~

.. code-block:: none

   =ENVIZI.FACTOR_SEARCH(search, country, [stateProvince], [date])

**Outputs**

.. list-table::
   :header-rows: 1
   :widths: 20 80

   * - Column
     - Description
   * - ``factorSet``
     - The emission factor dataset used for calculation (e.g., DEFRA, EPA).
   * - ``source``
     - Reference source of the factor (e.g., publication, license link).
   * - ``activityType``
     - Category of data (e.g., Electricity - Scope 3).
   * - ``activityUnit``
     - Unit of input activity data (e.g., kWh, liters).
   * - ``region``
     - Geographic region where the factor applies.
   * - ``factorId``
     - Factor ID from Envizi.

---

Recommend Activity Type
~~~~~~~~~~~~~~~~~~~~~~~

Uses AI to recommend the most appropriate activity type based on a text description. This function helps users find the correct activity type when they're unsure which one to use for their emissions calculation.

**Syntax**

.. code-block:: none

   =ENVIZI.RECOMMEND_ACTIVITY_TYPE(search, country, [stateProvince], [date])

**Parameters**

- ``search`` – Text description of the activity (e.g., "electricity consumption", "diesel fuel", "air travel")
- ``country`` – ISO alpha-3 country code
- ``stateProvince`` *(optional)* – Geographic state or province
- ``date`` *(optional)* – Activity date (format: YYYY-MM-DD or Excel date)

**Outputs**

.. list-table::
   :header-rows: 1
   :widths: 30 70

   * - Column
     - Description
   * - ``Recommended Activity Type``
     - The AI-recommended activity type that best matches your description
   * - ``Confidence(%)``
     - Confidence level of the recommendation (0-100). Higher values indicate stronger matches.
   * - ``Description``
     - Detailed description of the recommended activity type

**Examples**

.. code-block:: none

   =ENVIZI.RECOMMEND_ACTIVITY_TYPE("electricity usage", "USA")
   =ENVIZI.RECOMMEND_ACTIVITY_TYPE("diesel fuel for trucks", "GBR", "England", "2024-01-15")
   =ENVIZI.RECOMMEND_ACTIVITY_TYPE("natural gas heating", "CAN", "Ontario")

**Usage Tips**

- Use descriptive text in the ``search`` parameter for better recommendations
- The function returns only the top recommendation (highest confidence)
- Use the recommended activity type in your emission calculation functions
- Combine with ``ENVIZI.HEADERS`` using ``includeDataTypeRecommender=TRUE`` to create templates that include recommendation columns

**Workflow Example**

1. Use ``ENVIZI.RECOMMEND_ACTIVITY_TYPE`` to get activity type suggestions
2. Review the confidence level and description
3. Use the recommended activity type in functions like ``ENVIZI.LOCATION``, ``ENVIZI.STATIONARY``, etc.

---

Headers
~~~~~~~

Returns the input or output column headers for a specific endpoint. Useful for setting up spreadsheet templates.

**Syntax**

.. code-block:: none

   =ENVIZI.HEADERS([functionName], [input], [includeDataTypeRecommender])

**Parameters**

- ``functionName`` *(optional)* – Endpoint name (location, stationary, fugitive, mobile, transportation_and_distribution, calculation, economic_activity, real_estate, factor, factor_search, recommend_activity_type). Default: calculation
- ``input`` *(optional)* – TRUE for input headers, FALSE for output headers. Default: FALSE
- ``includeDataTypeRecommender`` *(optional)* – TRUE to include AI-recommended activity type columns in input headers (adds "Recommended Activity Type", "Confidence(%)", and "Description" after "Activity Type"). Only applies when input=TRUE. Default: FALSE

**Examples**

.. code-block:: none

   =ENVIZI.HEADERS()                                    // Returns output headers for calculation endpoint
   =ENVIZI.HEADERS("location")                          // Returns output headers for location endpoint
   =ENVIZI.HEADERS("stationary", TRUE)                  // Returns input headers for stationary endpoint
   =ENVIZI.HEADERS("stationary", TRUE, TRUE)            // Returns input headers with recommender columns
   =ENVIZI.HEADERS("factor", FALSE)                     // Returns output headers for factor endpoint
   =ENVIZI.HEADERS("recommend_activity_type", FALSE)    // Returns output headers for activity type recommender

**Output**

Returns a single row array containing the header names for the specified endpoint and type (input/output).

**Note on Data Type Recommender**

When ``includeDataTypeRecommender`` is TRUE, the input headers will include three additional columns after "Activity Type":

- **Recommended Activity Type** – AI-suggested activity type based on your description
- **Confidence(%)** – Confidence level of the recommendation (0-100)
- **Description** – Description of the recommended activity type

This is useful when you want to use the ``ENVIZI.RECOMMEND_ACTIVITY_TYPE`` function to get AI suggestions for activity types before performing calculations.

---

Headers by FactorId
~~~~~~~~~~~~~~~~~~~

Returns the input or output column headers for factorId-based calculations. Use this when working with factorId instead of type-based parameters.

**Syntax**

.. code-block:: none

   =ENVIZI.HEADERS_BY_FACTORID([functionName], [input])

**Parameters**

- ``functionName`` *(optional)* – Endpoint name (location, stationary, fugitive, mobile, transportation_and_distribution, calculation, economic_activity, real_estate, factor). Default: calculation
- ``input`` *(optional)* – TRUE for input headers, FALSE for output headers. Default: FALSE

**Note:** The ``factor_search`` endpoint does not support factorId-based calls.

**Examples**

.. code-block:: none

   =ENVIZI.HEADERS_BY_FACTORID("location", TRUE)     // Returns: factorId, value, unit
   =ENVIZI.HEADERS_BY_FACTORID("factor", TRUE)       // Returns: factorId, unit
   =ENVIZI.HEADERS_BY_FACTORID("calculation")        // Returns output headers (same as regular HEADERS)

**Output**

Returns a single row array containing the factorId-based header names for the specified endpoint.
     - Factor ID from Envizi.
