const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');

const app = express();
const port = 3000; // Choose a port for your API

// Middleware to parse JSON and URL-encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Print ZPL label route
app.post('/print', (req, res) => {
  // Get ZPL code from request body
  const { zpl } = req.body;

  // Example command to print using lp (assuming printer name is 'PRINTER_NAME')
  const printerName = 'ching'; // Replace with your printer name configured in CUPS
  const lpCommand = `echo "${zpl}" | lp -d ${printerName} -o raw`;

  // Execute lp command
  exec(lpCommand, (error, stdout, stderr) => {

   
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).json({ error: 'Failed to print label' });
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
    res.status(200).json({ message: 'Label printed successfully' });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
