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

Currency Conversion Support
---------------------------

Overview
~~~~~~~~

The IBM Envizi for Excel add-in supports automatic currency conversion for functions that accept monetary values. This feature allows you to input values in your preferred currency, and the system will automatically convert them to the appropriate base currency for emissions calculations.

**Supported Functions**

Currency conversion is available for the following functions:

- ``ENVIZI.ECONOMIC_ACTIVITY``
- ``ENVIZI.ECONOMIC_ACTIVITY_BY_FACTORID``
- ``ENVIZI.REAL_ESTATE``
- ``ENVIZI.REAL_ESTATE_BY_FACTORID``
- ``ENVIZI.PHYSICAL_ACTIVITY``
- ``ENVIZI.PHYSICAL_ACTIVITY_BY_FACTORID``

Supported Currencies
~~~~~~~~~~~~~~~~~~~~

The add-in supports conversion for 170 currencies:

.. list-table::
   :header-rows: 1
   :widths: 60 40

   * - Currency Name
     - Symbol
   * - ADB Unit of Account
     - XUA
   * - Afghani
     - AFN
   * - Algerian Dinar
     - DZD
   * - Arab Accounting Dinar
     - XAD
   * - Argentine Peso
     - ARS
   * - Armenian Dram
     - AMD
   * - Aruban Florin
     - AWG
   * - Australian Dollar
     - AUD
   * - Azerbaijan Manat
     - AZN
   * - Bahamian Dollar
     - BSD
   * - Bahraini Dinar
     - BHD
   * - Baht
     - THB
   * - Balboa
     - PAB
   * - Barbados Dollar
     - BBD
   * - Belarusian Ruble
     - BYN
   * - Belize Dollar
     - BZD
   * - Bermudian Dollar
     - BMD
   * - Boliviano
     - BOB
   * - Bolívar Soberano
     - VED
   * - Bolívar Soberano
     - VES
   * - Brazilian Real
     - BRL
   * - Brunei Dollar
     - BND
   * - Bulgarian Lev
     - BGN
   * - Burundi Franc
     - BIF
   * - Cabo Verde Escudo
     - CVE
   * - Canadian Dollar
     - CAD
   * - Caribbean Guilder
     - XCG
   * - Cayman Islands Dollar
     - KYD
   * - CFA Franc BCEAO
     - XOF
   * - CFA Franc BEAC
     - XAF
   * - CFP Franc
     - XPF
   * - Chilean Peso
     - CLP
   * - Colombian Peso
     - COP
   * - Comorian Franc
     - KMF
   * - Congolese Franc
     - CDF
   * - Convertible Mark
     - BAM
   * - Cordoba Oro
     - NIO
   * - Costa Rican Colon
     - CRC
   * - Cuban Peso
     - CUP
   * - Czech Koruna
     - CZK
   * - Dalasi
     - GMD
   * - Danish Krone
     - DKK
   * - Denar
     - MKD
   * - Djibouti Franc
     - DJF
   * - Dobra
     - STN
   * - Dominican Peso
     - DOP
   * - Dong
     - VND
   * - East Caribbean Dollar
     - XCD
   * - Egyptian Pound
     - EGP
   * - El Salvador Colon
     - SVC
   * - Ethiopian Birr
     - ETB
   * - Euro
     - EUR
   * - Falkland Islands Pound
     - FKP
   * - Fiji Dollar
     - FJD
   * - Forint
     - HUF
   * - Ghana Cedi
     - GHS
   * - Gibraltar Pound
     - GIP
   * - Gourde
     - HTG
   * - Guarani
     - PYG
   * - Guinean Franc
     - GNF
   * - Guyana Dollar
     - GYD
   * - Hong Kong Dollar
     - HKD
   * - Hryvnia
     - UAH
   * - Iceland Krona
     - ISK
   * - Indian Rupee
     - INR
   * - Iranian Rial
     - IRR
   * - Iraqi Dinar
     - IQD
   * - Jamaican Dollar
     - JMD
   * - Jordanian Dinar
     - JOD
   * - Kenyan Shilling
     - KES
   * - Kina
     - PGK
   * - Kuwaiti Dinar
     - KWD
   * - Kwanza
     - AOA
   * - Kyat
     - MMK
   * - Lao Kip
     - LAK
   * - Lari
     - GEL
   * - Lebanese Pound
     - LBP
   * - Lek
     - ALL
   * - Lempira
     - HNL
   * - Leone
     - SLE
   * - Liberian Dollar
     - LRD
   * - Libyan Dinar
     - LYD
   * - Lilangeni
     - SZL
   * - Loti
     - LSL
   * - Malagasy Ariary
     - MGA
   * - Malawi Kwacha
     - MWK
   * - Malaysian Ringgit
     - MYR
   * - Mauritius Rupee
     - MUR
   * - Mexican Peso
     - MXN
   * - Mexican Unidad de Inversion (UDI)
     - MXV
   * - Moldovan Leu
     - MDL
   * - Moroccan Dirham
     - MAD
   * - Mozambique Metical
     - MZN
   * - Mvdol
     - BOV
   * - Naira
     - NGN
   * - Nakfa
     - ERN
   * - Namibia Dollar
     - NAD
   * - Nepalese Rupee
     - NPR
   * - Netherlands Antillean Guilder
     - ANG
   * - New Israeli Sheqel
     - ILS
   * - New Taiwan Dollar
     - TWD
   * - New Zealand Dollar
     - NZD
   * - Ngultrum
     - BTN
   * - North Korean Won
     - KPW
   * - Norwegian Krone
     - NOK
   * - Ouguiya
     - MRU
   * - Pa'anga
     - TOP
   * - Pakistan Rupee
     - PKR
   * - Pataca
     - MOP
   * - Peso Uruguayo
     - UYU
   * - Philippine Peso
     - PHP
   * - Pound Sterling
     - GBP
   * - Pula
     - BWP
   * - Qatari Rial
     - QAR
   * - Quetzal
     - GTQ
   * - Rand
     - ZAR
   * - Rial Omani
     - OMR
   * - Riel
     - KHR
   * - Romanian Leu
     - RON
   * - Rufiyaa
     - MVR
   * - Rupiah
     - IDR
   * - Russian Ruble
     - RUB
   * - Rwanda Franc
     - RWF
   * - Saint Helena Pound
     - SHP
   * - Saudi Riyal
     - SAR
   * - SDR (Special Drawing Right)
     - XDR
   * - Serbian Dinar
     - RSD
   * - Seychelles Rupee
     - SCR
   * - Singapore Dollar
     - SGD
   * - Sol
     - PEN
   * - Solomon Islands Dollar
     - SBD
   * - Som
     - KGS
   * - Somali Shilling
     - SOS
   * - Somoni
     - TJS
   * - South Sudanese Pound
     - SSP
   * - Sri Lanka Rupee
     - LKR
   * - Sucre
     - XSU
   * - Sudanese Pound
     - SDG
   * - Surinam Dollar
     - SRD
   * - Swedish Krona
     - SEK
   * - Swiss Franc
     - CHF
   * - Syrian Pound
     - SYP
   * - Taka
     - BDT
   * - Tala
     - WST
   * - Tanzanian Shilling
     - TZS
   * - Tenge
     - KZT
   * - Trinidad and Tobago Dollar
     - TTD
   * - Tugrik
     - MNT
   * - Tunisian Dinar
     - TND
   * - Turkish Lira
     - TRY
   * - Turkmenistan New Manat
     - TMT
   * - UAE Dirham
     - AED
   * - Uganda Shilling
     - UGX
   * - Unidad de Fomento
     - CLF
   * - Unidad de Valor Real
     - COU
   * - Unidad Previsional
     - UYW
   * - United States dollar
     - USD
   * - Uruguay Peso en Unidades Indexadas (UI)
     - UYI
   * - US Dollar (Next day)
     - USN
   * - Uzbekistan Sum
     - UZS
   * - Vatu
     - VUV
   * - WIR Euro
     - CHE
   * - WIR Franc
     - CHW
   * - Won
     - KRW
   * - Yemeni Rial
     - YER
   * - Yen
     - JPY
   * - Yuan Renminbi
     - CNY
   * - Zambian Kwacha
     - ZMW
   * - Zimbabwe Gold
     - ZWG
   * - Zloty
     - PLN

Exchange Rate Data
~~~~~~~~~~~~~~~~~~

**Data Source**

Exchange rates are sourced from the U.S. Department of the Treasury's Fiscal Data API, which provides official exchange rates used by the U.S. government for accounting and reporting purposes.

- **API Source**: https://api.fiscaldata.treasury.gov/services/api/fiscal_service
- **Data Provider**: U.S. Department of the Treasury, Bureau of the Fiscal Service

**Historical Coverage**

Exchange rate data is available from **March 31, 2001** onwards. If you specify a date earlier than this, the system will use the earliest available rate.

**Data Updates**

The exchange rate database is automatically synchronized with the Treasury API to ensure you always have access to the most current rates. Updates are captured as soon as they become available from the Treasury.

- **Update Frequency**: The U.S. Treasury typically publishes exchange rates on a **quarterly basis**
- **Amendment Policy**: If current rates deviate from the published rates by 10% or more, Treasury will issue amendments to the quarterly report

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
   * - ``indirectCO2e``
     - Indirect CO2 equivalent emissions, if applicable.
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
   * - ``indirectCO2e``
     - Indirect CO2 equivalent emissions, if applicable.
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
   * - ``indirectCO2e``
     - Indirect CO2 equivalent emissions, if applicable.
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
   * - ``indirectCO2e``
     - Indirect CO2 equivalent emissions, if applicable.
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
   * - ``indirectCO2e``
     - Indirect CO2 equivalent emissions, if applicable.
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
   * - ``indirectCO2e``
     - Indirect CO2 equivalent emissions, if applicable.
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
   * - ``indirectCO2e``
     - Indirect CO2 equivalent emissions, if applicable.
   * - ``Unit``
     - Unit of measurement for the emissions result.
   * - ``Description``
     - Provides details on the factor set used in the calculation.
   * - ``Transaction Id``
     - Unique identifier for the calculation transaction, used for reference and auditing.
   * - ``Energy (MWh)``
     - Energy consumption in megawatt-hours (MWh).
   * - ``Asset Turn Over Ratio``
     - The asset turnover ratio for the activity, if applicable.

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
   * - ``indirectCO2e``
     - Indirect CO2 equivalent emissions, if applicable.
   * - ``Unit``
     - Unit of measurement for the emissions result.
   * - ``Description``
     - Provides details on the factor set used in the calculation.
   * - ``Transaction Id``
     - Unique identifier for the calculation transaction, used for reference and auditing.
   * - ``Energy (MWh)``
     - Energy consumption in megawatt-hours (MWh).
   * - ``Asset Turn Over Ratio``
     - The asset turnover ratio for the activity, if applicable.

---

Factor Search
~~~~~~~~~~~~~

.. code-block:: none

   =ENVIZI.FACTOR_SEARCH(search, country, [stateProvince], [unit], [scope], [date], [page], [size], [enableReranker])

**Parameters**

- ``search`` – Search query string
- ``country`` – ISO alpha-3 country code
- ``stateProvince`` *(optional)* – Geographic state or province
- ``unit`` *(optional)* – Unit of measurement to filter results (e.g., "kWh", "liters")
- ``scope`` *(optional)* – Emission scope to filter results (e.g., "1", "2", "3")
- ``date`` *(optional)* – Activity date (format: YYYY-MM-DD or Excel date)
- ``page`` *(optional)* – Page number for pagination (default: 1)
- ``size`` *(optional)* – Number of results per page (default: 30)
- ``enableReranker`` *(optional)* – Whether to apply cross-encoder reranking to the results (default: TRUE). Set to FALSE to skip reranking and use raw semantic similarity scores only. Omitting it preserves the default behavior (reranking on).

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

**Examples**

.. code-block:: none

   =ENVIZI.FACTOR_SEARCH("electricity", "USA")
   =ENVIZI.FACTOR_SEARCH("electricity", "USA", , "kWh", "2", "2024-01-15", 1, 10)
   =ENVIZI.FACTOR_SEARCH("electricity", "USA", , , , , , , FALSE)  // Skip reranking, use raw semantic scores

---

Recommend Activity Type
~~~~~~~~~~~~~~~~~~~~~~~

Uses AI to recommend the most appropriate activity type based on a text description. This function helps users find the correct activity type when they're unsure which one to use for their emissions calculation.

**Syntax**

.. code-block:: none

   =ENVIZI.RECOMMEND_ACTIVITY_TYPE(search, country, [stateProvince], [unit], [scope], [date], [enableReranker])

**Parameters**

- ``search`` – Text description of the activity (e.g., "electricity consumption", "diesel fuel", "air travel")
- ``country`` – ISO alpha-3 country code
- ``stateProvince`` *(optional)* – Geographic state or province
- ``unit`` *(optional)* – Unit of measurement to filter recommendations (e.g., "kWh", "liters")
- ``scope`` *(optional)* – Emission scope to filter recommendations (e.g., "1", "2", "3")
- ``date`` *(optional)* – Activity date (format: YYYY-MM-DD or Excel date)
- ``enableReranker`` *(optional)* – Whether to apply cross-encoder reranking to the recommendations (default: TRUE). Set to FALSE to skip reranking and use raw semantic similarity scores only. Omitting it preserves the default behavior (reranking on).

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
   * - ``Scope``
     - The distinct emission scopes covered by the recommended activity type. The API returns this as a list (for example, ``["2"]`` or ``["1", "2"]``); Excel displays it as a comma-separated value such as "2" or "1, 2". Values follow the standard scope conventions ("1", "2", "3.1"–"3.15"). Empty when the activity type has no associated scopes.

**Examples**

.. code-block:: none

   =ENVIZI.RECOMMEND_ACTIVITY_TYPE("electricity usage", "USA")
   =ENVIZI.RECOMMEND_ACTIVITY_TYPE("office consumed electricity", "USA", , "kWh")
   =ENVIZI.RECOMMEND_ACTIVITY_TYPE("heating with natural gas", "USA", , , "1")
   =ENVIZI.RECOMMEND_ACTIVITY_TYPE("diesel fuel for trucks", "GBR", "England", , , "2024-01-15")
   =ENVIZI.RECOMMEND_ACTIVITY_TYPE("natural gas heating", "CAN", "Ontario")
   =ENVIZI.RECOMMEND_ACTIVITY_TYPE("electricity usage", "USA", , , , , FALSE)  // Skip reranking, use raw semantic scores

**Usage Tips**

- Use descriptive text in the ``search`` parameter for better recommendations
- The function returns only the top recommendation (highest confidence)
- The ``Scope`` output is informational and can contain more than one scope for an activity type.
- Use the recommended activity type in your emission calculation functions
- Combine with ``ENVIZI.HEADERS`` using ``includeDataTypeRecommender=TRUE`` to create templates that include recommendation columns

**Workflow Example**

1. Use ``ENVIZI.RECOMMEND_ACTIVITY_TYPE`` to get activity type suggestions
2. Review the confidence level and description
3. Use the recommended activity type in functions like ``ENVIZI.LOCATION``, ``ENVIZI.STATIONARY``, etc.

---

Headers
~~~~~~~

Returns the input and/or output column headers for a specific endpoint. Useful for setting up spreadsheet templates.

**Syntax**

.. code-block:: none

   =ENVIZI.HEADERS([functionName], [input], [output], [includeActivityTypeRecommender])

**Parameters**

- ``functionName`` *(optional)* – Endpoint name (location, stationary, fugitive, mobile, transportation_and_distribution, calculation, economic_activity, real_estate, factor, factor_search, recommend_activity_type). Default: calculation
- ``input`` *(optional)* – TRUE to include input headers, FALSE to exclude. Default: TRUE
- ``output`` *(optional)* – TRUE to include output headers, FALSE to exclude. Default: TRUE
- ``includeActivityTypeRecommender`` *(optional)* – TRUE to include AI-recommended activity type columns in input headers (adds "Recommended Activity Type", "Confidence(%)", and "Description" after "Activity Type"). Only applies when input=TRUE. Ignored when input=FALSE. Default: FALSE

**Examples**

.. code-block:: none

   =ENVIZI.HEADERS()                                        // Returns both input and output headers for calculation endpoint
   =ENVIZI.HEADERS("location")                              // Returns both input and output headers for location endpoint
   =ENVIZI.HEADERS("stationary", TRUE, FALSE)               // Returns only input headers for stationary endpoint
   =ENVIZI.HEADERS("stationary", FALSE, TRUE)               // Returns only output headers for stationary endpoint
   =ENVIZI.HEADERS("stationary", TRUE, TRUE, TRUE)          // Returns both input and output headers with recommender columns
   =ENVIZI.HEADERS("factor", FALSE, TRUE)                   // Returns only output headers for factor endpoint
   =ENVIZI.HEADERS("recommend_activity_type", FALSE, TRUE)  // Returns only output headers for activity type recommender

**Output**

Returns a single row array containing the header names for the specified endpoint. When both input and output are TRUE, returns both sets of headers in one row.

For ``recommend_activity_type``, output headers are ``Recommended Activity Type``, ``Confidence(%)``, ``Description``, and ``Scope``.

**Note on Data Type Recommender**

When ``includeActivityTypeRecommender`` is TRUE and ``input`` is TRUE, the input headers will include three additional columns after "Activity Type":

- **Recommended Activity Type** – AI-suggested activity type based on your description
- **Confidence(%)** – Confidence level of the recommendation (0-100)
- **Description** – Description of the recommended activity type

This is useful when you want to use the ``ENVIZI.RECOMMEND_ACTIVITY_TYPE`` function to get AI suggestions for activity types before performing calculations. Note that this parameter is ignored when ``input`` is FALSE.

---

Headers by FactorId
~~~~~~~~~~~~~~~~~~~

Returns the input and/or output column headers for factorId-based calculations. Use this when working with factorId instead of type-based parameters.

**Syntax**

.. code-block:: none

   =ENVIZI.HEADERS_BY_FACTORID([functionName], [input], [output], [includeActivityTypeRecommender])

**Parameters**

- ``functionName`` *(optional)* – Endpoint name (location, stationary, fugitive, mobile, transportation_and_distribution, calculation, economic_activity, real_estate, factor). Default: calculation
- ``input`` *(optional)* – TRUE to include input headers, FALSE to exclude. Default: TRUE
- ``output`` *(optional)* – TRUE to include output headers, FALSE to exclude. Default: TRUE
- ``includeActivityTypeRecommender`` *(optional)* – This parameter is ignored for factorId-based functions as they don't support recommender headers. Default: FALSE

**Note:** The ``factor_search`` and ``recommend_activity_type`` endpoints do not support factorId-based calls.

**Examples**

.. code-block:: none

   =ENVIZI.HEADERS_BY_FACTORID("location", TRUE, FALSE)     // Returns only input headers: factorId, value, unit
   =ENVIZI.HEADERS_BY_FACTORID("factor", TRUE, FALSE)       // Returns only input headers: factorId, unit
   =ENVIZI.HEADERS_BY_FACTORID("calculation")               // Returns both input and output headers
   =ENVIZI.HEADERS_BY_FACTORID("calculation", FALSE, TRUE)  // Returns only output headers (same as regular HEADERS)
   =ENVIZI.HEADERS_BY_FACTORID("location", TRUE, TRUE)      // Returns both input and output headers

**Output**

Returns a single row array containing the factorId-based header names for the specified endpoint. When both input and output are TRUE, returns both sets of headers in one row.
     - Factor ID from Envizi.
