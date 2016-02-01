'use strict';

const updateText = /^\s*remove\s*(.*)\s*$/;

const Match = require( '../model/match' );
const history = require( '../model/history' );

class Remove {
	constructor( context ) {
		this.context = context;
	}

	handleRequest( request ) {
		const values = updateText.exec( request.text );

		if ( !values ) {
			return;
		}

		const match = Match.createFromText( values[ 1 ] );

		if ( !match ) {
			return;
		}

		const i = history.find( match );

		if ( i === null ) {
			return {
				'text': 'Match ' + match.toString() + ' not found!'
			};
		}

		history.remove( i );

		return {
			'text': 'Match ' + match.toString() + ' removed!',
			'response_type': 'in_channel'
		};
	}
}

module.exports = Remove;
