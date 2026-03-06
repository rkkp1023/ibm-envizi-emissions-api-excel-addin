===
Use
===

Logging In
----------

After installation, launch the add-in by clicking the **IBM Envizi for Excel Add-in** button on the Excel ribbon.

When prompted, provide your credentials:

- **apiKey** – API access key
- **tenantId** – Tenant identifier
- **orgId** – Organization identifier

Your credentials can be found on the `Overview Dashboard <https://www.app.ibm.com/envizi/emissions-api-home/overview?cuiURL=%2Femissions-api-home%2Foverview>`_ by clicking on the **View API Key** button.

.. image:: _images/login.png
   :alt: Login screen of the add-in
   :align: center

Once your credentials are validated, the **main interface** of the add-in becomes available:

.. image:: _images/main.png
   :alt: Main interface of the add-in
   :align: center

Using Data Validation Helpers
------------------------------

The add-in provides ribbon buttons to quickly add dropdown lists for valid values in your cells.

**Insert Activity Types**

Click the **Activity Types** button to add a dropdown list of valid activity types:

- **All** – All available activity types
- **Location** – Location-based activities
- **Stationary** – Stationary combustion activities
- **Mobile** – Mobile combustion activities
- **Fugitive** – Fugitive emissions
- **Transportation & Distribution** – Transport activities
- **Economic Activity** – Economic-based activities
- **Real Estate** – Real estate activities

**Insert Area**

Click the **Area** button to add location dropdowns:

- **Country** – ISO alpha-3 country codes
- **State/Province** – State or province identifiers
- **Power Grid** – Power grid identifiers

**Insert Units**

Click the **Units** button to add a dropdown list of valid measurement units (e.g., kWh, kg, L).

.. note::
   Select the cells where you want the dropdown before clicking the button. The validation will be applied to all selected cells.

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
