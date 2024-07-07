const express = require('express');
const bodyParser = require('body-parser');
const usb = require('usb');

// Initialize the app
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// Find the USB printer
const findPrinter = () => {
  const devices = usb.getDeviceList();

  console.log(devices)
  for (const device of devices) {
    // Check if the device is a printer
    if (device.deviceDescriptor.bDeviceClass === 7) {
      return device;
    }
  }
  return null;
};

const printer = findPrinter();
if (!printer) {
  console.error('Printer not found');
  process.exit(1);
}

// Open the printer
printer.open();

// Endpoint to print ZPL
app.post('/print', (req, res) => {
  const zpl = req.body.zpl;
  if (!zpl) {
    return res.status(400).send('ZPL content is required');
  }

  const printerInterface = printer.interfaces[0];
  printerInterface.claim();

  const endpoint = printerInterface.endpoints[0];
  endpoint.transfer(Buffer.from(zpl, 'utf-8'), (err) => {
    if (err) {
      console.error('Print error:', err);
      return res.status(500).send('Failed to print ZPL');
    }
    res.send('Printed successfully');
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
