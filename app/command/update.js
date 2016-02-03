'use strict';

const updateText = /^\s*update\s*(.*)\s*->\s*(.*)\s*$/;

const Match = require( '../model/match' );
const history = require( '../model/history' );
const rank = require( '../model/rank' );

class Update {
	constructor( context ) {
		this.context = context;
	}

	handleRequest( request ) {
		const values = updateText.exec( request.text );

		if ( !values ) {
			return;
		}

		const oldMatch = Match.createFromText( values[ 1 ] );
		const newMatch = Match.createFromText( values[ 2 ] );

		if ( !oldMatch || !newMatch ) {
			return;
		}

		const i = history.find( oldMatch );

		if ( i === null ) {
			return {
				'text': 'Match ' + oldMatch.toString() + ' not found!'
			};
		}

		history.update( i, newMatch );
		rank.reload();

		return {
			'text': 'Match updated form ' + oldMatch.toString() + ' to ' + newMatch.toString() + '!',
			'response_type': 'in_channel'
		};
	}
}

module.exports = Update;
