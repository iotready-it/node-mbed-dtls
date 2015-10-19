'use strict';

var path = require('path');
var dtls = require('../index');

const opts = {
	cert: path.join(__dirname, '../test/public.der'),
	key: path.join(__dirname, '../test/private.der'),
	debug: 5
};

const dtlsserver = dtls.createServer(opts, socket => {
	console.log('secure connection from', socket.address, socket.port);
	socket.on('message', msg => {
		//console.log('received:', msg.toString('utf8'));
		socket.send(msg);
		if (msg.toString('utf8').indexOf('close') === 0) {
			console.log('closing');
			dtlsserver.close();
		}
	});
	socket.once('error', (err) => {
		console.error(`socket error on ${socket.address}:${socket.port}: ${err}`);
	});
	socket.once('close', () => {
		console.log(`closing socket from ${socket.address}:${socket.port}`);
	});
});
dtlsserver.on('clientError', err => {
	console.error(`clientError: ${err}`);
});
dtlsserver.on('error', err => {
	console.error(`server error: ${err}`);
});
dtlsserver.on('listening', () => {
	const addr = dtlsserver.address();
	console.log(`dtls listening on ${addr.address}:${addr.port}`);
});
dtlsserver.on('newSession', (sessionId, sessionData, callback) => {
	console.log('*** new session callback ***', sessionId);
	process.nextTick(() => {
		callback();
	});
});
dtlsserver.on('resumeSession', (sessionId, callback) => {
	console.log('*** resume session callback ***', sessionId);
	process.nextTick(() => {
		callback(null, null);
	});
});
dtlsserver.listen(5683);