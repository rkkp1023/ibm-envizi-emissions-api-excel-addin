===
Use
===

Getting Started
---------------

Sign Up Process
~~~~~~~~~~~~~~~

Before using the add-in, you must sign up for IBM Envizi Emissions API:

1. Complete the sign-up form on the `IBM Envizi Emissions API welcome page <https://www.ibm.com/account/reg/us-en/signup?formid=urx-54313>`_
2. After submitting the form, you'll receive an email notification once your account has been provisioned
3. This process typically takes a short time, and you'll be notified when your account is ready to use

.. important::
   Keep your IBM ID (email address) handy as you'll need it to sign in to the add-in.

Login Flow
~~~~~~~~~~

After installation and account provisioning, the login experience differs based on whether you're a first-time user or a returning user.

**For First-Time Users**

When you launch the add-in for the first time by clicking the **IBM Envizi for Excel Add-in** button on the Excel ribbon, you'll see a welcome screen with a **Get Started** button.

.. image:: _images/get-started-screen.png
   :alt: Get Started screen for first-time users
   :align: center


**For Returning Users**

If you have previously logged in and are returning to the add-in, or if your session has expired, a different welcome screen will be displayed featuring a **Login** button.

.. image:: _images/welcome-back-screen.png
   :alt: Welcome Back screen for returning users
   :align: center


**Login Process**

Regardless of the screen displayed, follow the steps below to sign in:

1. Click **Get Started** (for first-time users) or **Login** (for returning users).
2. A login pop-up window will be displayed.

   .. image:: _images/login-popup.png
      :alt: Login pop-up window
      :align: center

3. Enter your IBM credentials in the pop-up window
4. Upon successful authentication, you will be redirected to the main interface.

.. tip::
   Use the same IBM ID (email address) that was used during the sign-up process. The add-in leverages secure IBM authentication to establish a connection with your Envizi account.

Upon successful sign-in, the **main interface** of the add-in will become accessible.

.. image:: _images/interface.png
   :alt: Main interface of the add-in
   :align: center

Understanding the Interface
~~~~~~~~~~~~~~~~~~~~~~~~~~~

The add-in interface includes three primary tabs located at the top of the application:

**Quick Help Tab**  

Provides immediate access to common tasks and frequently used features. This tab offers concise guidance to help users navigate and utilize the add-in’s functionality without leaving Excel.

**Resources Tab** 

Contains links to relevant documentation and tutorials. Use this tab to access comprehensive guides and reference materials related to the IBM Envizi Emissions API.

**Accounts Tab**  

Displays current account information and provides options for session management. Users can view their authentication status and sign out as required.

Custom IBM Envizi Tab - Data Validation Helpers
------------------------------------------------

Overview
~~~~~~~~

The IBM Envizi for Excel add-in includes a custom **IBM Envizi** tab in the Excel ribbon that provides quick access to data validation helpers. This tab streamlines the process of creating emissions calculation spreadsheets by automatically inserting dropdown lists with valid values for activity types, geographic areas, and measurement units.

.. image:: _images/envizi-ribbon-tab.png
   :alt: IBM Envizi custom tab in Excel ribbon
   :align: center
   :width: 100%

The custom tab eliminates manual data entry errors and ensures that your emissions calculations use valid, API-compatible values.

Tab Structure
~~~~~~~~~~~~~

The IBM Envizi tab is organized into four groups:

1. **Task pane** – Opens the main IBM Envizi interface
2. **Activity Types** – Inserts activity type dropdowns
3. **Area** – Inserts geographic location dropdowns
4. **Units** – Inserts measurement unit dropdowns

General Workflow
~~~~~~~~~~~~~~~~

1. Select the cell(s) where you want to add a dropdown
2. Click the appropriate button in the IBM Envizi tab
3. Choose the specific validation type from the menu (if applicable)
4. The dropdown list is automatically applied to your selected cells

.. note::
   You must be logged in to the IBM Envizi add-in before using these features. The add-in fetches the latest valid values from the Envizi API and caches them for performance.

Activity Types Group
~~~~~~~~~~~~~~~~~~~~

The **Activity Types** button provides a dropdown menu with options to insert data validation for different emission scopes and categories.

**Available Options:**

.. list-table::
   :header-rows: 1
   :widths: 30 70

   * - Option
     - Description
   * - **All**
     - Includes all available activity types across all emission categories
   * - **Location**
     - Location-based emissions (typically Scope 2 electricity)
   * - **Stationary**
     - Stationary combustion sources (Scope 1)
   * - **Mobile**
     - Mobile combustion sources (Scope 1)
   * - **Fugitive**
     - Fugitive emissions (Scope 1)
   * - **Transportation and Distribution**
     - Transportation and distribution activities (Scope 3)
   * - **Economic Activity**
     - Economic activity-based emissions (Scope 3)
   * - **Real Estate**
     - Real estate-related emissions (Scope 3)

**How to Use:**

1. Select one or more cells in your spreadsheet
2. Click the **Activity Types** button in the IBM Envizi tab
3. Choose the appropriate category from the dropdown menu
4. A data validation dropdown is applied to the selected cells

**Example:**

If you're creating a template for electricity consumption calculations:

1. Select cell A2 (or a range like A2:A100)
2. Click **Activity Types** → **Location**
3. Cell A2 now has a dropdown with location-based activity types like:
   
   - Electricity - Scope 2
   - Electricity - Scope 3
   - Electricity - Transmission and Distribution

.. tip::
   Use the **All** option when you need flexibility to work with multiple emission categories in the same column. Use specific categories (Location, Stationary, etc.) when you want to restrict users to a particular emission scope.

Area Group
~~~~~~~~~~

The **Area** button provides geographic location validation options for country, state/province, and power grid selections.

**Available Options:**

.. list-table::
   :header-rows: 1
   :widths: 30 70

   * - Option
     - Description
   * - **Country**
     - ISO alpha-3 country codes (e.g., USA, GBR, AUS)
   * - **State/Province**
     - State or province identifiers for supported countries
   * - **Power Grid**
     - Power grid region identifiers for electricity calculations

**How to Use:**

1. Select the cells where you want geographic validation
2. Click the **Area** button in the IBM Envizi tab
3. Choose **Country**, **State/Province**, or **Power Grid**
4. The dropdown list is applied to your selected cells

**Example:**

For a multi-country emissions tracking spreadsheet:

1. Select cells in the "Country" column (e.g., B2:B100)
2. Click **Area** → **Country**
3. Users can now select from valid country codes like:
   
   - USA (United States)
   - GBR (United Kingdom)
   - CAN (Canada)
   - AUS (Australia)

.. note::
   **State/Province** and **Power Grid** options are particularly useful for location-based electricity calculations where regional factors vary significantly.

Units Group
~~~~~~~~~~~

The **Units** button inserts a dropdown list of valid measurement units supported by the IBM Envizi Emissions API.

**Supported Units:**

The units dropdown includes all measurement units accepted by the API, such as:

- **Energy**: kWh, MWh, GJ, therms, BTU
- **Volume**: L (liters), gal (gallons), m³
- **Mass**: kg, tonnes, lb
- **Distance**: km, miles
- **Currency**: USD, EUR, GBP (for economic activity calculations)
- And many more...

**How to Use:**

1. Select the cells where you want unit validation
2. Click the **Units** button in the IBM Envizi tab
3. The dropdown list is automatically applied

**Example:**

For an energy consumption tracking sheet:

1. Select cells in the "Unit" column (e.g., C2:C100)
2. Click **Units**
3. Users can now select from valid units like:
   
   - kWh
   - MWh
   - GJ
   - therms

.. tip::
   The units dropdown is context-aware and includes all units that might be valid for any activity type. When using specific activity types, refer to the API documentation to determine which units are appropriate.

Data Validation Features
~~~~~~~~~~~~~~~~~~~~~~~~

**Error Prevention:**

When a dropdown is applied, Excel's data validation prevents users from entering invalid values:

- **In-cell dropdown**: Click the cell to see a dropdown arrow with valid options
- **Error alerts**: If a user tries to type an invalid value, they receive an error message
- **Prompt messages**: Helpful tooltips appear when a cell is selected

**Automatic Updates:**

The add-in automatically refreshes the validation data from the Envizi API:

- **Refresh interval**: Every 3 days
- **Automatic sync**: New activity types, countries, or units are automatically available
- **No manual updates needed**: The add-in handles data synchronization in the background

.. note::
   The first time you use a validation feature after logging in, there may be a brief delay while the add-in fetches the latest data from the API. Subsequent uses are instant as the data is cached locally.

Best Practices
~~~~~~~~~~~~~~

**Creating Calculation Templates:**

1. **Set up column headers** using the ``ENVIZI.HEADERS()`` function
2. **Apply activity type validation** to the "Activity Type" column
3. **Apply area validation** to the "Country" and "State/Province" columns
4. **Apply unit validation** to the "Unit" column
5. **Add your calculation formulas** (e.g., ``=ENVIZI.CALCULATION(...)``)

**Example Template Structure:**

.. code-block:: none

   | Activity Type ▼ | Value | Unit ▼ | Country ▼ | State/Province ▼ | Date       |
   |-----------------|-------|--------|-----------|------------------|------------|
   | [dropdown]      | 1000  | kWh    | USA       | California       | 2024-01-15 |

**Combining with Functions:**

Use the dropdowns in conjunction with Excel formulas:

.. code-block:: none

   =ENVIZI.CALCULATION(A2, B2, C2, D2, E2, F2)

Where:

- A2 = Activity Type (from dropdown)
- B2 = Value (user input)
- C2 = Unit (from dropdown)
- D2 = Country (from dropdown)
- E2 = State/Province (from dropdown)
- F2 = Date (user input)

**Data Consistency:**

- **Use consistent columns**: Apply the same validation type to entire columns
- **Lock template rows**: Protect header rows to prevent accidental changes
- **Document your template**: Add instructions for users in a separate sheet

Troubleshooting
~~~~~~~~~~~~~~~

**Dropdown Not Appearing:**

*Problem*: The dropdown doesn't appear after clicking a button.

*Solutions*:

1. Ensure you're logged in to the IBM Envizi add-in
2. Check that cells are selected before clicking the button
3. Try refreshing the metadata by logging out and back in
4. Clear Excel's cache (see :doc:`troubleshooting`)

**"Data not available" Error:**

*Problem*: Error message stating "Data not available. check if you are logged in and try again."

*Solutions*:

1. Open the IBM Envizi task pane and verify you're logged in
2. Check your internet connection
3. Verify your API credentials are valid
4. Wait a moment and try again (the add-in may be fetching data)

**Dropdown Shows Old Values:**

*Problem*: The dropdown doesn't include newly added activity types or countries.

*Solutions*:

1. The add-in refreshes data every 3 days automatically
2. To force a refresh, log out and log back in
3. The add-in will fetch the latest data from the API

Performance Considerations
~~~~~~~~~~~~~~~~~~~~~~~~~~

**Caching Strategy:**

The add-in uses an intelligent caching strategy to ensure fast performance:

- **First use**: Brief delay while fetching data from API
- **Subsequent uses**: Instant (data served from cache)
- **Automatic refresh**: Every 3 days to ensure data is current
- **Hidden metadata sheet**: Data stored in a hidden Excel sheet for quick access

**Large Datasets:**

When working with large spreadsheets:

- Apply validation to entire columns at once (e.g., A2:A10000)
- The validation is applied efficiently regardless of range size
- No performance impact on calculation speed

Technical Details
~~~~~~~~~~~~~~~~~

**Metadata Storage:**

The add-in stores validation data in a hidden sheet named ``__EnviziMetadata__``:

- **Activity Types**: Organized by emission category
- **Countries**: ISO alpha-3 codes with full names
- **States/Provinces**: Organized by country
- **Power Grids**: Regional identifiers
- **Units**: All supported measurement units

**Named Ranges:**

Excel named ranges are used for efficient data validation:

- ``EnviziActivityTypes_All``
- ``EnviziActivityTypes_Location``
- ``EnviziActivityTypes_Stationary``
- ``EnviziCountries``
- ``EnviziStateProvinces``
- ``EnviziPowerGrids``
- ``EnviziUnits``

.. note::
   These named ranges are managed automatically by the add-in. Do not modify or delete them manually.

**API Integration:**

The validation data is fetched from the IBM Envizi Emissions API:

- **Endpoint**: Metadata endpoints for activity types, countries, and units
- **Authentication**: Uses your API key and tenant credentials
- **Refresh logic**: Checks last update timestamp and refreshes if older than 3 days

Working with Functions
----------------------

The add-in provides custom Excel functions that retrieve and calculate emissions data.

**Example: Stationary emissions**

Users can enter a function such as:

.. code-block:: none

   =ENVIZI.STATIONARY(type, value, unit, country, [stateProvince], [date])

**Parameters**

- ``type``: Activity type
- ``value``: Numeric activity value
- ``unit``: Unit of measurement
- ``country``: ISO alpha-3 country code
- ``stateProvince`` *(optional)*: State or province identifier
- ``date`` *(optional)*: Activity date

.. image:: _images/function.png
   :alt: Stationary Function
   :align: center

.. note::
   Ensure that there are enough empty cells available to display the results. If sufficient space is not available, a spill error will occur.

**Process**

1. IBM Envizi for Excel processes the inputs and formats them for the IBM Envizi - Emissions API,
2. The IBM Envizi Emissions API calculates the emissions data,
3. The result is then returned and displayed in the Excel cell.

.. image:: _images/result.png
   :alt: API Result
   :align: center

.. note::
   If an error occurs, the add-in will display an error message once you hover over warning icon.

   .. image:: _images/error.png
      :alt: Example error message
      :align: center
      :width: 220
      :height: 145

Exporting Results
-----------------

To export computed results (without formulas):

1. Copy the cells containing the formulas.
2. Use **Paste Values** to paste only the calculated results into a new location.

.. image:: _images/paste.png
   :alt: Paste Values option in Excel
   :align: center
   :width: 220
   :height: 420
