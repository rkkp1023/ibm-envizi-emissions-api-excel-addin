# IBM Envizi - Emissions Calculations in Excel

The `Emissions Calculations in Excel` is an Excel Add-in for automating carbon emissions calculations within your Excel workflow. Backed by [IBM Envizi - Emissions API](https://www.ibm.com/products/envizi/emissions-api); the Add-in is available to download in the [Microsoft AppSource Marketplace](https://marketplace.microsoft.com/en-us/product/WA200009598?tab=Overview) and signing up for a trial is free!

## Sign up

To get started, follow these steps:

- Sign up at the [IBMid sign up](https://www.ibm.com/account/reg/us-en/signup?formid=urx-54313) page.
- You will be sent an invite email to join to create an account.
- Read the [Getting Started](https://www.ibm.com/docs/en/envizi-esg-suite?topic=api-getting-started) page to get an overview of the `Emissions Calculations in Excel`.

## Overview

This Excel Add-in provides seamless integration with IBM Envizi's Emissions API, allowing users to:

- Access emission factors directly from Excel
- Perform carbon calculations without leaving your spreadsheet
- Authenticate securely with your Envizi credentials
- Upload and process data efficiently

Built using **TypeScript**, **Office.js**, and **Webpack**, this add-in enhances your Excel experience with custom functions and an interactive task pane.

## Features

- **Custom Functions**: Calculate emissions using `@ENVIZI` functions
- **Interactive Task Pane**: User-friendly interface for authentication and data operations
- **Secure Authentication**: Token-based authentication with Envizi services
- **Real-time Data Access**: Direct connection to Envizi's Carbon Engine

## Prerequisites

- Microsoft Excel (Office 365 or Excel 2016+)
- Internet connection for authentication and data retrieval
- Envizi account credentials

## Installation

### For End Users

1. Download the latest release from https://plugins.app.ibm.com/excel-addin/manifest.xml
2. Open Excel and navigate to the "Insert" tab
3. Select "My Add-ins" and browse to the downloaded manifest.xml file
4. Select the IBM Envizi - Emissions API Excel Add-in to install it

### For Developers

1. Clone this repository
2. Install dependencies:
   ```
   yarn install
   ```
3. Build the add-in:
   ```
   yarn build
   ```
4. Start local development server:
   ```
   yarn start
   ```
   or
   ```
   yarn run dev
   ```



## Usage

1. **Authentication**: Open the Task Pane and log in with your Envizi credentials
2. **Using Custom Functions**: In any cell, type `=ENVIZI.` to see available functions

Example function usage:
```
=ENVIZI.CALCULATION(type, value, unit, country, [stateProvince], [date], [powerGrid])
```

## Project Structure

- `src/functions/` – Excel custom functions 
- `src/taskpane/` – UI logic and token dialog popup
- `dist/` – Webpack output folder 
- `manifest.xml` – Office Add-in manifest file for localhost development
- `Envizi_manifest.xml` – Actual manifest file with links pointing to deployed resources
- `webpack.config.js` – Build & dev server config
- `babel.config.json` + `tsconfig.json` – Transpiler configs

## Troubleshooting

### Clearing Excel Cache (Mac)

If you encounter issues with the add-in not loading or updating:

```
# Clear Excel cache
rm -rf ~/Library/Containers/com.microsoft.Excel/Data/Library/Caches/*
rm -rf ~/Library/Containers/com.microsoft.Excel/Data/Library/Application\ Support/Microsoft/Office/16.0/Wef

# Remove sideloaded add-in (if misbehaving)
rm -rf ~/Library/Containers/com.microsoft.Excel/Data/Documents/wef/*
```

### Common Issues

- **Authentication Failures**: Ensure your Envizi credentials are correct and your account has the necessary permissions
- **Functions Not Loading**: Try clearing the Excel cache as described above
- **Network Errors**: Check your internet connection and firewall settings

## Support

For issues or questions, please contact the IBM Envizi support team.

## License

See the [LICENSE](LICENSE) file for details.
