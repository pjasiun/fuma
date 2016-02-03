'use strict';

const Match = require( '../model/match' );
const history = require( '../model/history' );
const rank = require( '../model/rank' );

class Result {
	constructor( context ) {
		this.context = context;
	}

	handleRequest( request ) {
		const match = Match.createFromText( request.text );

		if ( !match ) {
			return;
		}

		history.add( match );

		const changes = rank.addMatch( match );

		return {
			'text': 'Match added to the history!\n' +
				changes.red1.name + ' & ' + changes.red2.name + ': ' + ( changes.red1.newScore - changes.red1.oldScore ) + ' points \n' +
				changes.blue1.name + ' & ' + changes.blue2.name + ': ' + ( changes.blue1.newScore - changes.blue1.oldScore )  + ' points',
			'response_type': 'in_channel'
		};
	}
}

module.exports = Result;
