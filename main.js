const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const cors = require('cors');
const mdns = require('mdns');


const app = express();
const port = 3000; 

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const ad = mdns.createAdvertisement(mdns.tcp('http'), 3000, {
    name: 'zebra reception',
    txtRecord: {
        description: 'A sample Node.js service'
    }
});
ad.start();


app.get("/test", ()=>{
    return "its running!!";
})

app.post('/print', (req, res) => {
  const { zpl } = req.body;  
  const printerName = 'ching'; 
  const lpCommand = `echo "${zpl}" | lp -d ${printerName} -o raw`;


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
