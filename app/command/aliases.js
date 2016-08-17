'use strict';

const Table = require( 'cli-table' );

class Aliases {
	constructor( context ) {
		this.context = context;
	}

	handleRequest( request ) {
		if ( request.text != 'aliases' ) {
			return null;
		}

		const table = new Table( { style : { compact : true } } );

		table.push( [ 'Alias:', 'Value:' ], [] );

		for ( let alias of this.context.aliases ) {
			table.push( [ alias, this.context.aliases.getValue( alias ) ] );
		}

		return {
			'text': '```' + table.toString() + '```',
			'response_type': 'in_channel'
		};
	}
}

module.exports = Aliases;
