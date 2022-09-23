"use strict";

const http = require('http');
const fs = require('fs');

const port = process.env.PORT || 3000;


let dataFilePath = './data.json';

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, PUT, POST, DELETE');

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
      res.setHeader('Access-Control-Allow-Headers', '*');

      var obj = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
      let response = obj;
      res.end(JSON.stringify(response));
    } else if (req.url === '/rooms') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, PUT, POST, DELETE');
      res.setHeader('Access-Control-Allow-Headers', '*');

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
    res.setHeader('Access-Control-Allow-Headers', '*');

    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      const updatedRoom = JSON.parse(Buffer.concat(chunks).toString());
      let id = updatedRoom.id;
      
      let oldData = JSON.parse(fs.readFileSync('./data.json', 'utf8'));
      let oldRoomIndex = oldData.rooms.findIndex( r => r.id === id );

      let updatedData = oldData;
      updatedData.rooms[oldRoomIndex] = updatedRoom;
      
      // write file
      fs.writeFileSync(dataFilePath, JSON.stringify(updatedData));
      //res.writeHead(200, {"Content-Type": "text/plain"});
      let obj = {
        id: id,
        result: 'All good',
      };
      res.end(JSON.stringify(obj));
    });
  } else if (req.method === 'POST') {

    console.log('GOT POST REQ');

    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    
    req.on('end', () => {
      let reqObj = JSON.parse(Buffer.concat(chunks).toString());

      // receiving only a room
      let newRoom = reqObj;

      let currentData = JSON.parse(fs.readFileSync('./data.json', 'utf8'));

      newRoom.id = createId(currentData.rooms);
      debugger

      currentData.rooms.push(newRoom);

      try {
        fs.writeFileSync(dataFilePath, JSON.stringify(currentData));
      } catch (e) {
        res.end(JSON.stringify({ result: e }));
        return;
      }

      res.end(JSON.stringify({ result: 'All good', room: newRoom }));

    });    
  } else if (req.method === 'DELETE') {
    debugger;
    console.log('DELETE');

    const roomId = Number(req.url.match(/[0-9]+/)[0]);

    let data = JSON.parse(fs.readFileSync('./data.json', 'utf8')); // current data

    data.rooms = data.rooms.filter(r => r.id !== roomId);
    
    try {
      fs.writeFileSync(dataFilePath, JSON.stringify(data));
    } catch (e) {
      res.end(JSON.stringify({ result: e }));
      return;
    }

    res.end(JSON.stringify({ result: 'All good', id: roomId }));

  } else if (req.method === 'OPTIONS') {
    console.log('OPTIONS');
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, PUT, POST, DELETE');
    res.setHeader('Access-Control-Allow-Headers', '*');
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

function createId(arr) {
  let numArr = arr.map(obj => obj.id);

  let max = Math.max(...numArr);

  for (let i = 0; i < max; i++) {
    if (!numArr.includes(i)) {
      return i;
    }
  }

  return max + 1;

}
