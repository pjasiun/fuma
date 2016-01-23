'use strict';

const http = require( 'http' );
const url  = require( 'url' );

const Match  = require( './app/match' );

const aliases = require( './storage' )( 'aliases', { counter: 0 } );

const PORT = 8080;

const server = http.createServer( function( request, response ) {
	aliases.counter++;
	const urlParts = url.parse( request.url, true );

	const match = Match.createFromText( urlParts.query.text );

	response.writeHead( 200, { 'Content-Type': 'application/json' } );

	if ( !match ) {
		response.end( JSON.stringify( {
			'response_type': 'in_channel',
			'text': 'Incorrect command.',
		} ) );
	} else {
		response.end( JSON.stringify( {
			'response_type': 'in_channel',
			'text': 'user: ' + urlParts.query.user_name + '\n' + '```counter: ' + aliases.counter + '```',
			'attachments': [
				{
					'text':
						'red1 = ' + match.red1 + '; ' +
						'red2 = ' + match.red2 + '; ' +
						'redScore = ' + match.redScore + '; ' +
						'blueScore = ' + match.blueScore + '; ' +
						'blue1 = ' + match.blue1 + '; ' +
						'blue2 = ' + match.blue2 + ';'
				}
			]
		} ) );
	}

	aliases.save();
} );

server.listen( PORT, function() {
	console.log( 'Server started!' );
} );
