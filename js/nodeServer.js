
const http = require('http');
const routes = require('./routes');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
	routes.request(req, res);
});

server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`);
});
