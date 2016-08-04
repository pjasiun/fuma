'use strict';

const Table = require( 'cli-table' );
const moment = require( 'moment' );

const rankText = /^\s*rank\s*(rookies|oldboys|full)*$/;

class Rank {
	constructor( context ) {
		this.context = context;
	}

	handleRequest( request ) {
		const values = rankText.exec( request.resolvedText );

		if ( !values ) {
			return;
		}

		const options = {
			rookies: values[ 1 ] === 'full' || values[ 1 ] === 'rookies',
			oldBoys: values[ 1 ] === 'full' || values[ 1 ] === 'oldboys'
		};

		const players = this.context.rank.getPlayers( options );

		if ( !players.length ) {
			return {
				'text': 'No players in the rank.'
			};
		}

		const tableData = [];

		const table = new Table( {
			head: [ '', 'Player:', 'Score:', 'Matches:', 'Last game:' ],
			style: { compact: true },
			colAligns: [ 'right', 'left', 'right', 'right', 'left' ]
		} );

		let rankingPosition = 1;
		let previousPosScore;

		for ( let player of players ) {
			let posLabel = rankingPosition + '.';

			if ( previousPosScore === player.score ) {
				posLabel = '';
			}

			const lastGame =  moment( player.lastGame ).fromNow();

			table.push( [ posLabel, player.name, player.score, player.matches, lastGame ] );
			rankingPosition++;

			previousPosScore = player.score;
		}

		return {
			text: '```' + table.toString() + '```'
		};
	}
}

module.exports = Rank;
