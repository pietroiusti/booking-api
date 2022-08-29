"use strict";

const http = require('http');
const fs = require('fs');

const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  //Add error listener
  req.on('error', (err) => {
    console.error(err);
    res.statusCode = 400;
    res.end();
  });

  if (req.method === 'GET') {
    // req.url equals '/'
    if (req.url === '/') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');

      var obj = JSON.parse(fs.readFileSync('./data.json', 'utf8'));
      let response = obj;
      res.end(JSON.stringify(response));

    } else {
      res.statusCode = 404;
      res.end();
    }
  } else {
    res.statusCode = 404;
    res.end();
  }
});

server.listen(port, () => {
  console.log(`Server running at port ${port}`);
});
