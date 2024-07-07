const express = require('express');
const bodyParser = require('body-parser');
const usb = require('usb');

// Initialize the app
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// Log all connected USB devices for debugging
const logConnectedDevices = () => {
  const devices = usb.getDeviceList();
  devices.forEach(device => {
    const { idVendor, idProduct } = device.deviceDescriptor;
    console.log(`Device Found: VendorID=${idVendor.toString(16)}, ProductID=${idProduct.toString(16)}`);
  });
};

logConnectedDevices();

// Replace with your printer's vendorId and productId from lsusb output
const printerVendorId = "0a5f"; // Example vendorId, replace with your printer's
const printerProductId = "00d3"; // Example productId, replace with your printer's

const printer = usb.findByIds(printerVendorId, printerProductId);

if (!printer) {
  console.error('Printer not found. Please ensure it is connected and try again.');
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
  if (!printerInterface) {
    return res.status(500).send('Failed to access printer interface');
  }

  printerInterface.claim();

  const endpoint = printerInterface.endpoints.find(ep => ep.direction === 'out');
  if (!endpoint) {
    return res.status(500).send('Failed to access printer endpoint');
  }

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
