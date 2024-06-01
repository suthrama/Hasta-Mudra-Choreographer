const http = require('http');
const https = require('https');

const apiKey = "";  // API Key (hidden, cannot submuit project otherwise)
const port = 3000;

const requestHandler = (req, res) => {
  if (req.method === 'POST' && req.url === '/get-mudra') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const { word } = JSON.parse(body);
      console.log('Received word:', word);  // Debug log

      const options = {
        hostname: 'api.openai.com',
        path: '/v1/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      };

      const data = JSON.stringify({
        model: 'text-davinci-002',
        prompt: `What is the Kuchipudi hand gesture (mudra) for the word "Shiva"? Describe the gesture in 20 words`,
        max_tokens: 50,
        temperature: 0.5
      });

      const apiReq = https.request(options, apiRes => {
        let apiData = '';
        apiRes.on('data', chunk => {
          apiData += chunk;
        });

        apiRes.on('end', () => {
          const result = JSON.parse(apiData).choices[0].text.trim().split('|');
          const mudra = result[0].trim();
          //const image = result[1] ? result[1].trim() : 'path_to_placeholder_image';
          const image = 'https://www.naatyaanjali.com/wp-content/uploads/2015/02/Pataakam.jpg';
          console.log('Mudra response:', mudra, image);  // Debug log
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ mudra, image }));
        });
      });

      apiReq.on('error', error => {
        console.error('Error fetching mudra:', error);  // Error handling
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error fetching mudra');
      });

      apiReq.write(data);
      apiReq.end();
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
};

const server = http.createServer(requestHandler);

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
