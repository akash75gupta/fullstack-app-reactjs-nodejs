import parser from 'body-parser';
import cors from 'cors';
import express from 'express';
import http from 'http';
import path from 'path';
import authenticator from './src/Authenticator';
import gateway from './src/Gateway';
import * as logger from './src/LoggerUtil';

const app = express();

//setting server
const server = http.createServer(app);
const port = process.env.PORT;

server.listen(port, () => {
    logger.logInfo("Starting Process: " + process.title);
    logger.logInfo("Server is listening on port: " + port);
});

//adding middlewares
//app.use(cors());
app.use(parser.urlencoded({ extended: true }));
app.use(parser.json());

//serving static ui files
app.use('/', express.static(path.join(__dirname, 'ui/build')));

//adding authentication middleware and controller
app.use('/api', authenticator, gateway);

//Temporary hack, simulating Zookeeper and SOT API
app.use('/internal/api', gateway);

//tracing uncaught exceptions
app.use((err) => {
    logger.logFinalError(err);
});