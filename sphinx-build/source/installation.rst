============
Installation
============

-------------
Prerequisites
-------------

Before installing the add-in, ensure the following requirements are met:

- Microsoft Excel (Office 365 Online, Mac or Windows)
- Active internet connection
- API credentials (``apiKey``, ``tenantId``, ``orgId``), are available on the `Overview Dashboard <https://www.app.ibm.com/envizi/emissions-api-home/overview?cuiURL=%2Femissions-api-home%2Foverview>`_ after `sign up <https://www.ibm.com/account/reg/us-en/signup?formid=urx-53999>`_.

-------
Install 
-------

In order to use **IBM Envizi Emissions API** for Excel, there are two options to install:

1. Install from the Microsoft Marketplace (Recommended)
2. Sideload using a manifest.xml file

.. toctree::
   :maxdepth: 2

   install-appstore
   install-manifest

.. important::
   Note that Excel custom functions are available on the following platforms:

   - Office on the web
   - Office on Windows
      - Microsoft 365 subscription
      - Retail perpetual **Office 2016 and later**
      - Volume-licensed perpetual **Office 2021 and later**
   - Office on Mac

   Excel custom functions aren't currently supported in the following:

   - Office on iPad
   - Volume-licensed perpetual versions of **Office 2019 or earlier** on Windows

   For more information, see `Supported platforms <https://learn.microsoft.com/en-us/office/dev/add-ins/excel/custom-functions-overview>`_.

--------------------
Calculation Mode Tip
--------------------

After installation, change the calculation mode to **Manual** to prevent unnecessary API calls:

1. Go to **Formulas → Calculation Options**.
2. Select **Manual**.

.. image:: _images/calculation.png
   :alt: Manual calculation mode in Excel
   :align: center

3. To recalculate a formula in manual calculation mode either press **F9** or do the following:
   
   - Select the cell
   - Press F2 (this puts the cell into edit mode)
   - Press Enter