'use strict';

const commandRegExp = /^expected\s*@(\S*)\s*@(\S*)\s*\:\s*@(\S*)\s*@(\S*)\s*$/;

const Match = require( '../model/match' );

class Expected {
	constructor( context ) {
		this.context = context;
	}

	handleRequest( request ) {
		const values = commandRegExp.exec( request.resolvedText );

		if ( !values ) {
			return null;
		}

		const red1 = values[ 1 ];
		const red2 = values[ 2 ];
		const blue1 = values[ 3 ];
		const blue2 = values[ 4 ];

		const expected = this.context.rank.getExpected( red1, red2, blue1, blue2 );

		return {
			'text': 'Match expected result: ' +
			'@' + red1 + ' @' + red2 + ' ' + expected.red + ' : ' + expected.blue + ' @' + blue1 + ' @' + blue2
		};
	}
}

module.exports = Expected;
