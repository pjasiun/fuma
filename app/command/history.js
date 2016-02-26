'use strict';

const historyText = /^\s*history\s*(@\S*\s*)?(:\s*(@\S*\s*))?\s*$/;
const Table = require( 'cli-table' );
const history = require( '../model/history' );
const match = require( '../model/match' );

const _ = require( 'lodash' );

class Result {
	constructor( context ) {
		this.context = context;
	}

	handleRequest( request ) {
		const values = historyText.exec( request.text );

		if ( !values ) {
			return;
		}

		const isPlayerA = !!values[ 1 ];
		const isPlayerB = !!values[ 3 ];
		let playerA;
		let playerAName;
		let playerB;

		if ( isPlayerA ) {
			playerA = values[ 1 ].trim();
			playerAName = playerA.substr( 1 );
		}

		if ( isPlayerB ) {
			playerB = values[ 3 ].trim();
		}

		if ( !history.length ) {
			return {
				'text': 'History is empty.'
			};
		}

		let historyEntries = [];
		let playerAWins = 0;

		for ( let i = 0; i < history.length; i++ ) {
			var entry = history.getEntry( i );

			// Filter out player A games.
			if ( isPlayerA && entry.match.search( playerA ) < 0 ) {
				continue;
			}

			// Filter out player B games.
			if ( isPlayerB && entry.match.search( playerB ) < 0 ) {
				continue;
			}

			let teams = entry.match.split( ':' );

			// If both players are defined search versus games
			if ( isPlayerA && isPlayerB && teams[ 0 ].search( playerA ) > 0 ^ teams[ 0 ].search( playerB ) > 0 ) {
				continue;
			}

			// Count playerA wins
			if ( isPlayerA ) {
				let matchResult = match.createFromText( entry.match );

				if ( matchResult.red1 === playerAName || matchResult.red2 === playerAName ) {
					playerAWins++;
				}
			}

			historyEntries.push( entry );
		}

		if ( !historyEntries.length && isPlayerA ) {
			return {
				'text': playerA + ' didn\'t played' + ( isPlayerB ? ' against ' + playerB : ' any game' )
			};
		}

		const table = new Table( { style: { compact: true } } );

		const days = _.groupBy( historyEntries, 'day' );

		for ( let day in days ) {
			table.push( [], [ '', day ], [] );

			for ( let i = 0; i < days[ day ].length; i++ ) {
				table.push( [ days[ day ][ i ].time, days[ day ][ i ].match ] );
			}
		}

		console.log( table.toString() );

		var outText = '```' + table.toString() + '```';

		// Show short summary of games that player A & B played
		if ( isPlayerA ) {
			var summary = '\n ' + playerA + ' won ' + playerAWins + ' out of ' + historyEntries.length + ' games';

			if ( isPlayerB ) {
				summary += ' against ' + playerB;
				var halfOfMatches = historyEntries.length / 2;

				summary += '.\n ' + ( playerAWins === halfOfMatches ? 'None' : ( playerAWins > halfOfMatches ? playerA : playerB ) ) + ' is better ¯\\_(ツ)_/¯'
			}

			console.log( summary );
			outText += summary;
		}

		return {
			'text': outText
		};
	}
}

module.exports = Result;
