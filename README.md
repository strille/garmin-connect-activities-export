# garmin-connect-activities-export
A "macro" written in JavaScript that lets you download all your activities on Garmin Connect as a single csv file.

# Usage

1. Copy the content of the file "gc-activities-export.js" into the clipboard.
2. Login to Garmin Connect and go to the [activities page](https://connect.garmin.com/modern/activities).
3. Open the browser's console (F12).
4. Paste the copied script into the prompt and run.

The script will automatically browse through all pages and download the csv files into memory, and then combine them into one csv file, which will then be available for download.

# Notes

* The script has only been tested in Chrome and IE 11.
* Use at your own risc! I can't guarantee that the generated file is not corrupt or missing data.
* This script only operates on the client side, including the creation of the csv file. There's no 3rd party server involved.