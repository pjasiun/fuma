'use strict';

const Match = require( '../model/match' );

class Result {
	constructor( context ) {
		this.context = context;
	}

	handleRequest( request ) {
		const match = Match.createFromText( request.resolvedText );

		if ( !match ) {
			return;
		}

		this.context.history.add( match );

		const changes = this.context.rank.addMatch( match );

		return {
			'text': 'Match added to the history!\n' +
				changes.red1.name + ' & ' + changes.red2.name + ': ' + ( changes.red1.newScore - changes.red1.oldScore ) + ' points \n' +
				changes.blue1.name + ' & ' + changes.blue2.name + ': ' + ( changes.blue1.newScore - changes.blue1.oldScore )  + ' points',
			'response_type': 'in_channel'
		};
	}
}

module.exports = Result;
