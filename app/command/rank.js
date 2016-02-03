'use strict';

const Table = require( 'cli-table' );
const rank = require( '../model/rank' );

class Rank {
	constructor( context ) {
		this.context = context;
	}

	handleRequest( request ) {
		if ( request.text != 'rank' ) {
			return;
		}

		const players = rank.getPlayers();

		if ( !players.length ) {
			return {
				'text': 'No players in the rank.'
			};
		}

		const table = new Table( { style : { compact : true } } );
		table.push( [ '', 'Player:', 'Score:', 'Matches:' ], [] );

		let pos = 1;

		for ( let player of players ) {
			table.push( [ pos, player.name, player.score, player.matches ] );
			pos++;
		}

		console.log( table.toString() );

		return {
			'text': '```' + table.toString() + '```'
		};
	}
}

module.exports = Rank;