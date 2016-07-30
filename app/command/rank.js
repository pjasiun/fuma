'use strict';

const Table = require( 'cli-table' );

const minMatches = 20;

class Rank {
	constructor( context ) {
		this.context = context;
	}

	handleRequest( request ) {
		if ( request.text != 'rank' ) {
			return;
		}

		const players = this.context.rank.getPlayers();

		if ( !players.length ) {
			return {
				'text': 'No players in the rank.'
			};
		}

		const table = new Table( { style: { compact: true } } );

		table.push( [ '', 'Player:', 'Score:', 'Matches:' ], [] );

		let rankingPosition = 1;
		let previousPosScore;

		for ( let player of players ) {
			let posLabel = rankingPosition + '.';

			if ( rankingPosition === 1 ) {
				posLabel + ' 👑';
			}

			if ( previousPosScore == player.score ) {
				posLabel = '';
			}

			if ( player.matches >= minMatches ) {
				table.push( [ posLabel, player.name, player.score, player.matches ] );
			}

			rankingPosition++;
			previousPosScore = player.score;
		}

		console.log( table.toString() );

		return {
			'text': '```' + table.toString() + '```'
		};
	}
}

module.exports = Rank;
