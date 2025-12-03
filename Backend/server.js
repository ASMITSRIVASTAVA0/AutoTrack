const http = require('http');


const appfile = require('./app');
// regular http server without express
const server = http.createServer(appfile);//appfile handles req
const { initializeSocket } = require('./socket');
initializeSocket(server);//socket.io needs raw http server to attach websockets


const port=process.env.PORT || 4000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});