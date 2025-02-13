const fetch = require('node-fetch');
const fs = require('fs');
const json2csv = require('json2csv').parse; // Install this dependency: `npm install json2csv`

try {
// Fetch JSON data
const response = await fetch("https://analisi.transparenciacatalunya.cat/resource/2gws-ubmt.json");
if (!response.ok) throw new Error(`fetch failed: ${response.status}`);

const data = await response.json();

// Convert JSON to CSV
const csv = json2csv(data);

// Save CSV to a file
fs.writeFileSync('./consum_aigua_per_comarques.csv', csv);

console.log("Data saved as consum_aigua_per_comarques.csv");

} catch (error) {
console.error("Error fetching or processing data:", error);
}