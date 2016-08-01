'use strict';

const updateText = /^\s*remove\s*(.*)\s*$/;

const Match = require( '../model/match' );

class Remove {
	constructor( context ) {
		this.context = context;
	}

	handleRequest( request ) {
		const values = updateText.exec( request.resolvedText );

		if ( !values ) {
			return;
		}

		const match = Match.createFromText( values[ 1 ] );

		if ( !match ) {
			return;
		}

		const i = this.context.history.find( match );

		if ( i === null ) {
			return {
				'text': 'Match ' + match.toString() + ' not found!'
			};
		}

		this.context.history.remove( i );
		this.context.rank.reload();

		return {
			'text': 'Match ' + match.toString() + ' removed!',
			'response_type': 'in_channel'
		};
	}
}

module.exports = Remove;
