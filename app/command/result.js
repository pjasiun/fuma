'use strict';

const Match = require( '../model/match' );
const history = require( '../model/history' );

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

		return {
			'text': 'Match added to the history!',
			'response_type': 'in_channel',
			'attachments': [
				{
					'text': match.toString()
				}
			]
		};
	}
}

module.exports = Result;
