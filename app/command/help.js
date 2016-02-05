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
			[ '@a @b 10 : 7 @c @d', 'enter match result' ],
			[ 'rank', 'foosball ranking' ],
			[ 'history', 'matches history' ],
			[ 'expected @a @b : @c @d', 'show the expected match result' ],
			[ 'update @a @b 10 : 7 @c @d -> @a @b 10 : 8 @c @d', 'updates last found match result' ],
			[ 'remove @a @b 10 : 7 @c @d', 'removes last found match result' ],
			[ 'public history', 'print the history on the channel,\nmay be used with every command' ]
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