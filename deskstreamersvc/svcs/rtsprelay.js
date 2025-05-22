//
// attribution: https://github.com/k-yle/rtsp-relay?tab=readme-ov-file#example
//
const express = require('express');
const app = express();

const { proxy, scriptUrl } = require('rtsp-relay')(app);

const handler = proxy({
  url: `rtsp://127.0.0.1:8554/test`,
  // url: `rtsp://admin:admin@10.0.1.2:554/feed`,
  // if your RTSP stream need credentials, include them in the URL as above
  verbose: true,
});
// the endpoint our RTSP uses
app.ws('/api/stream', handler);

// this is an example html page to view the stream
app.get('/', (req, res) =>
  res.send(`
  <canvas id='canvas'></canvas>

  <script src='${scriptUrl}'></script>
  <script>
    // NOTE: change below to ws:// if you are running local 
    // and not using tunnels
    // url: 'ws://' + location.host + '/api/stream',
    loadPlayer({
      // url: 'ws://' + location.host + '/api/stream',
      url: 'wss://' + location.host + '/api/stream',
      canvas: document.getElementById('canvas')
    });
  </script>
`),
);

app.listen(9000);
