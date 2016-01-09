'use strict';

const http = require( 'http' );

const PORT = 8080;

const server = http.createServer( function( request, response ) {
	response.end( 'It Works!!! Path: ' + request.url );
} );

server.listen( PORT, function() {
	console.log( 'Server started!' );
} );