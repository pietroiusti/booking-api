"use strict";

const http = require('http');
const fs = require('fs');

const port = process.env.PORT || 3000;


let dataFilePath = './data.json';

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  

  //Add error listener
  req.on('error', (err) => {
    console.error(err);
    res.statusCode = 400;
    res.end();
  });

  if (req.method === 'GET') {
    console.log('GET');
    if (req.url === '/') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');

      var obj = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
      let response = obj;
      res.end(JSON.stringify(response));
    } else if (req.url === '/rooms') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, PUT, POST');

      var obj = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
      let response = obj.rooms;
      res.end(JSON.stringify(response));
    } else {
      res.statusCode = 404;
      res.end();
    }
  } else if (req.method === 'PUT') {
    console.log('PUT');
    // Receive updated room
    //
    // USE room id to replace old room
    //
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      const updatedRoom = JSON.parse(Buffer.concat(chunks).toString());      
      let id = updatedRoom.id;
      
      let oldData = JSON.parse(fs.readFileSync('./data.json', 'utf8'));
      //let oldRoom = oldData.rooms.find( r => r.id === id );      

      console.log(oldData);

      let updatedData = oldData;
      updatedData.rooms[updatedRoom.id - 1] = updatedRoom; //<< we rely on order
      updatedData = JSON.stringify(updatedData);
      
      // write file
      fs.writeFileSync(dataFilePath, updatedData);
      res.end();
    })
  } else if (req.method === 'OPTIONS') {
    console.log('OPTIONS');
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, PUT, POST');
    //https://stackoverflow.com/questions/25727306/request-header-field-access-control-allow-headers-is-not-allowed-by-access-contr
    res.end();
  } else {
    res.statusCode = 404;
    res.end();
  }
});

server.listen(port, () => {
  console.log(`Server running at port ${port}`);
});