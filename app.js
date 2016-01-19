'use strict';

const http = require( 'http' );
const url  = require( 'url' );

const PORT = 8080;

const server = http.createServer( function( request, response ) {
	const urlParts = url.parse( request.url, true );

	response.writeHead( 200, { 'Content-Type': 'application/json' } );
	response.end( JSON.stringify( {
		'response_type': 'in_channel',
		'text': 'user: ' + urlParts.query.user_name + '\n',
		'attachments': [
			{
				'text': 'Attachment!'
			}
		]
	} ) );
} );

server.listen( PORT, function() {
	console.log( 'Server started!' );
} );
