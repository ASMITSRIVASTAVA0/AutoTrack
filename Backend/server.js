const http = require('http');
const app = require('./app');
const { initializeSocket } = require('./socket');
// const port=process.env.PORT || 3000;
const port = 4000;

const server = http.createServer(app);

initializeSocket(server);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});