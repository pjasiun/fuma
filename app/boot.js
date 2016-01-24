'use strict';

const http = require( 'http' );
const url  = require( 'url' );

const Controller  = require( './controller' );

const PORT = 8080;

const controller = new Controller();
controller.addCommand( 'result' );
controller.addCommand( 'help' );

const server = http.createServer( function( request, response ) {
	const query = url.parse( request.url, true ).query;

	const jsonResonse = controller.handleRequest( query );

	response.writeHead( 200, { 'Content-Type': 'application/json' } );

	if ( !jsonResonse.response_type ) {
		jsonResonse.response_type = 'in_channel';
	}

	response.end( JSON.stringify( jsonResonse ) );
} );

server.listen( PORT, function() {
	console.log( 'Server started!' );
} );
