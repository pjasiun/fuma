'use strict';

const config = require( '../config' );

const http = require( 'http' );
const url = require( 'url' );
const qs = require( 'querystring' );

const Controller = require( './controller' );
const History = require( './model/history' );
const Aliases = require( './model/aliases' );
const Rank = require( './model/rank' );

const StorageRepository = require( './storage' );
const storageRepository = new StorageRepository( '../data/' );

const history = new History( storageRepository.createStorage( 'history', [] ) );
const aliases = new Aliases( storageRepository.createStorage( 'aliases', {} ) );

const rank = new Rank( history );
rank.reload();

const controller = new Controller( storageRepository, { history: history, aliases: aliases, rank: rank } );

controller.addCommand( 'result' );
controller.addCommand( 'history' );
controller.addCommand( 'help' );
controller.addCommand( 'remove' );
controller.addCommand( 'update' );
controller.addCommand( 'rank' );
controller.addCommand( 'expected' );
controller.addCommand( 'registration' );
controller.addCommand( 'set-alias' );
controller.addCommand( 'delete-alias' );
controller.addCommand( 'aliases' );

const server = http.createServer( function( request, response ) {
	let requestData = '';
	let jsonResponse;

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
