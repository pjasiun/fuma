'use strict';

const config = require( '../config' );

const http = require( 'http' );
const url = require( 'url' );
const qs = require( 'querystring' );
const fs = require( 'fs' );

const Controller = require( './controller' );
const History = require( './model/history' );
const Aliases = require( './model/aliases' );
const Rank = require( './model/rank' );
const Stats = require( './model/stats' );

const StorageRepository = require( './storage' );
const storageRepository = new StorageRepository( '../data/' );

const history = new History( storageRepository.createStorage( 'history', [] ) );
const aliases = new Aliases( storageRepository.createStorage( 'aliases', {} ) );

const rank = new Rank( history, { numberOfDaysToBeAnOldBoy: 30, numberOfMatchesToStopBeingARookie: 20 } );
rank.reload();

const controller = new Controller( storageRepository, { history: history, aliases: aliases, rank: rank, config: config } );

const commands = [
	{ name: 'aliases' },
	{ name: 'delete-alias' },
	{ name: 'expected' },
	{ name: 'help' },
	{ name: 'history' },
	{ name: 'rank' },
	{ name: 'registration', 'config': { timeToLive: 8 * 60 * 60 * 1000, randomize: true, randomizeFactor: 0.2 } },
	{ name: 'remove' },
	{ name: 'result' },
	{ name: 'set-alias' },
	{ name: 'stats' },
	{ name: 'update' }
];

for ( let command of commands ) {
	const Command = require( './command/' + command.name );
	controller.addCommand( new Command( controller, command.config ) );
}

const server = http.createServer( function( request, response ) {
	let requestData = '';
	let jsonResponse;

	if ( request.url.indexOf( '/stats/get' ) === 0 ) {
		const query = url.parse( request.url, true ).query;
		const stats = new Stats( rank );

		response.writeHead( 200, { 'Content-Type': 'application/json' } );

		response.end( JSON.stringify( query.player ? stats.getPlayerStats( query.player ) : stats.getFull() ) );

		return;
	}

	if ( request.url.indexOf( '/stats?' ) === 0 ) {
		fs.readFile( './app/static/player-stats.html', ( error, data ) => {
			if ( error ) {
				response.writeHead( 500, { 'Content-Type': 'text/plain' } );
				response.write( error + '\n' );
				response.end();

				return;
			}

			response.writeHead( 200 );
			response.write( data, 'binary' );
			response.end();
		} );

		return;
	}

	if ( request.url.indexOf( '/stats' ) === 0 ) {
		fs.readFile( './app/static/stats.html', ( error, data ) => {
			if ( error ) {
				response.writeHead( 500, { 'Content-Type': 'text/plain' } );
				response.write( error + '\n' );
				response.end();

				return;
			}

			response.writeHead( 200 );
			response.write( data, 'binary' );
			response.end();
		} );

		return;
	}

	request.on( 'data', ( data ) => {
		requestData += data;

		if ( requestData.length > 1e6 ) {
			// Prevent DoS attack.
			request.connection.destroy();
		}
	} );

	request.on( 'end', function() {
		let query = qs.parse( requestData );

		if ( config.debug ) {
			query = url.parse( request.url, true ).query;
		}

		if ( query.token == config.token || config.debug ) {
			jsonResponse = controller.handleRequest( query );
		} else {
			jsonResponse = { 'text': 'Invalid token.' };
		}

		response.writeHead( 200, { 'Content-Type': 'application/json' } );

		response.end( JSON.stringify( jsonResponse ) );
	} );
} );

server.listen( config.port, function() {
	console.log( 'Server started on port ' + config.port + '!' );
} );
