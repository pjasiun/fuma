'use strict';

const http = require( 'http' );
const url  = require( 'url' );

const aliases = require( './storage' )( 'aliases', { counter: 0 } );

const PORT = 8080;

const server = http.createServer( function( request, response ) {
	aliases.counter++;
	const urlParts = url.parse( request.url, true );

	response.writeHead( 200, { 'Content-Type': 'application/json' } );
	response.end( JSON.stringify( {
		'response_type': 'in_channel',
		'text': 'user: ' + urlParts.query.user_name + '\n' + '```counter: ' + aliases.counter + '```',
		'attachments': [
			{
				'text': 'Attachment!'
			}
		]
	} ) );

	aliases.save();
} );

server.listen( PORT, function() {
	console.log( 'Server started!' );
} );
