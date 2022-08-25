const csvtojson = require("csvtojson");
const unique = require("array-unique");
const deleteBulkRows = require("smartsheet-delete-bulk-rows");
const fs = require("fs");
const smartsheet = require("smartsheet").createClient({
  accessToken: "XjCGSZTHIKP9XDYppeqatUYuYD58jIno5Omdp",
  baseUrl: "https://api.smartsheetgov.com/2.0/",
  logLevel: "info",
});

const addRows = async () => {
  var pushArray = [];
  const csvFilePath2 = "https://gateway.jpl.nasa.gov/sites/div35x/357/357K_Reports/WIP%20Mech%20Fab%20Job%20Tracking%20DirectService%20357RK.csv";
  const csvFilePath =
    "./nomatchobbie/WIP Mech Fab Job Tracking DirectService 357RK.csv";

  /** Data Extrations and Tranformation:
   * Pull data from csv and convert it JSON
   * Filter the data to elemenate the Completed jobs
   * Add Operation Number to the Job Number
   * Remove all duplicates
   * Remove the ".0" from the Seq number
   */
  const jsonArray = await csvtojson().fromFile(csvFilePath);
  console.log("Total Number of Jobs: ", jsonArray.length);
  const jobs = jsonArray.filter((job) => job["Job Status"] !== "Complete");

  for (job in jobs) {
    const seq = jobs[job]["Operation Seq Num"].split(".");
    const job_op = `${jobs[job]["Job Number"]}_${seq[0]}`;
    pushArray.push({
      job_op: job_op,
      jobnumber: jobs[job]["Job Number"],
      operationnumber: seq[0]

    });
  }

  let uniqueJobs = unique(pushArray);
  console.log("Total Number of Unique non completed Jobs: ", uniqueJobs.length);

  /** Preparing the Payload
   * Build the row array with Unique jobs and delete marker
   */
  var rows = [];
  for (job in uniqueJobs) {
    rows.push({
      toTop: true,
      cells: [
        {
          columnId: 5351563024721796,
          value: "d",
        },
        {
          columnId: 556872659953540,
          value: uniqueJobs[job].job_op,
        },
        {
          columnId: 6004745946064772,
          value: uniqueJobs[job].jobnumber,
        },
        {
          columnId: 3752946132379524,
          value: uniqueJobs[job].operationnumber,
        },
      ],
    });
  }
  console.log("Total Number of rows: ", rows.length);

  /** Preparing the Payload
   * Set row options
   * Add rows to the sheet
   */
  var options = {
    sheetId: 7268506465409140,
    body: rows,
  };

  smartsheet.sheets
    .addRows(options)
    .then(function (newRows) {
      console.log(
        "\x1b[41m Total Number of added row: ",
        newRows.result.length,
        "\x1b[0m"
      );
    })
    .catch(function (error) {
      console.log(error);
    });
};

const countRows = async () => {
  let options = {
    id: 7268506465409140,
  };
  const response = await smartsheet.sheets.getSheet(options);
  response.rows.length > 0 ? 
  console.log(
    "\x1b[41m Total number of rows in the sheet: \x1b[1m",
    response.rows.length,
    "\x1b[0m"
  )
  :console.log(
    "\x1b[46m \x1b[31m Total number of rows in the sheet: \x1b[1m",
    response.rows.length,
    "\x1b[0m"
  )
  ;
};

const deleteAllRows = async () => {
  countRows();

  const options = {
    sheetId: 7268506465409140,
    columnId: 5351563024721796,
    deleteValue: "d",
  };

  const response = await deleteBulkRows(smartsheet, options);
  console.log(response);

  countRows();

  addRows();
};

(async () => {
  deleteAllRows();
})();
