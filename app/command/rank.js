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

		const tableData = [];

		const table = new Table( {
			head: [ '', 'Player:', 'Score:', 'Matches:' ],
			style: { compact: true },
			colAligns: [ 'right', 'left', 'right', 'right' ]
		} );

		let rankingPosition = 1;
		let previousPosScore;

		for ( let player of players ) {
			let posLabel = rankingPosition + '.';

			if ( previousPosScore === player.score ) {
				posLabel = '';
			}

			if ( player.matches >= minMatches ) {
				table.push( [ posLabel, player.name, player.score, player.matches ] );
				tableData.push( [ posLabel, player.name, '' + player.score, '' + player.matches ] );
				rankingPosition++;
			}

			previousPosScore = player.score;
		}

		return {
			text: '```' + table.toString() + '```'
		};
	}
}

module.exports = Rank;
