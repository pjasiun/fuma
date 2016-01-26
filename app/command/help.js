'use strict';

const Table = require( 'cli-table' );

class Result {
	constructor( context ) {
		this.context = context;
	}

	handleRequest( request ) {
		if ( request.text != 'help' ) {
			return;
		}

		const table = new Table();

		table.push(
			[ 'help', 'help page' ],
			[ '@scofalik @paula 0 : 10 @pjasiun @onion', 'enter match result' ]
		);

		for ( let i = 0; i < table.length; i++ ) {
			table[ i ][ 0 ] = request.command + ' ' + table[ i ][ 0 ];
		}

		return {
			'text': 'Here is a list of available commands:\n' +
					'```' + table.toString() + '```'
		};
	}
}

module.exports = Result;