const smarSdk = require("smartsheet");
const deleteBulkRows = require('smartsheet-delete-bulk-rows');

// Initialize client SDK

const smarClient = smarSdk.createClient({
  // If token is falsy, value will be read from SMARTSHEET_ACCESS_TOKEN environment variable
  accessToken: "82wV7YsiAZRFxGcYTOmZLbhbGLOSjCYBRu0PU",
  logLevel: "info",
  baseUrl: smarSdk.smartSheetURIs.govBaseURI,
});

const countRows = async () => {
    let options = {
      id: 7268506465409140,
    };
    const response = await smarClient.sheets.getSheet(options);
    console.log(
      "\x1b[41m Total number of rows in the sheet: ",
      response.rows.length,
      "\x1b[0m"
    );
  };

const deleteAllRows = async () => {
    
    countRows()

    const options = {
        sheetId: 7268506465409140,
        columnId: 5351563024721796,
        deleteValue: 'd'
    };

    const response = await deleteBulkRows(smarClient, options);
    console.log(response)

    countRows()
}

deleteAllRows();