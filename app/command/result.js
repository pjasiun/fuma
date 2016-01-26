'use strict';

const Match = require( '../model/match' );

class Result {
	constructor( context ) {
		this.context = context;
	}

	handleRequest( request ) {
		const match = Match.createFromText( request.text );

		if ( !match ) {
			return;
		}

		return {
			'text': 'Match result:',
			'response_type': 'in_channel',
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
		};
	}
}

module.exports = Result;