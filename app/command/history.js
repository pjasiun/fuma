'use strict';

const historyText = /^\s*history\s*((@\S*\s*)?(@\S*\s*)?(:\s*(@\S*\s*)(@\S*\s*)?)?)?\s*$/;
const Table = require( 'cli-table' );
const history = require( '../model/history' );
const Match = require( '../model/match' );

const _ = require( 'lodash' );

class Result {
	constructor( context ) {
		this.context = context;
	}

	handleRequest( request ) {
		const values = historyText.exec( request.resolvedText );

		if ( !values ) {
			return;
		}

		if ( !history.length ) {
			return {
				'text': 'History is empty.'
			};
		}

		const hasMatchFilters = !!values[ 1 ];
		const teamA1 = !!values[ 2 ] ? values[ 2 ].trim() : false;
		const teamA2 = !!values[ 3 ] ? values[ 3 ].trim() : false;
		const isVersus = !!values [ 4 ];
		const teamB1 = !!values[ 5 ] ? values[ 5 ].trim() : false;
		const teamB2 = !!values[ 6 ] ? values[ 6 ].trim() : false;

		let teamAWins = 0;
		let teamBWins = 0;

		let historyEntries;

		if ( !hasMatchFilters ) {
			// No optional string after history so just copy whole history
			historyEntries = [];

			for ( let i = 0; i < history.length; i++ ) {
				historyEntries.push( history.getEntry( i ) );
			}
		} else {
			// Filter different player games. Sorry for large if-else...
			if ( !isVersus ) {
				if ( teamA2 ) {
					historyEntries = history.filterTeam( teamA1, teamA2 );
				} else {
					historyEntries = history.filterPlayer( teamA1 );
				}
			} else {
				// It is a versus game
				if ( teamB2 ) {
					// It has full second team defined
					if ( teamA2 ) {
						historyEntries = history.filterTeamVsTeam( teamA1, teamA2, teamB1, teamB2 );
					} else {
						historyEntries = history.filterTeamVsPlayer( teamB1, teamB2, teamA1 );
					}
				} else {
					// Only one player in second team
					if ( teamA2 ) {
						historyEntries = history.filterTeamVsPlayer( teamA1, teamA2, teamB1 );
					} else {
						historyEntries = history.filterPlayerVsPlayer( teamA1, teamB1 );
					}
				}
			}

			// count stats
			historyEntries.forEach( function( entry ) {
				let match = Match.createFromText( entry.match );

				// The winning team is always red
				if ( match.red1 === teamA1.substr( 1 ) || match.red2 === teamA1.substr( 1 ) ) {
					teamAWins += 1;
				} else {
					teamBWins += 1;
				}
			} );
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

		let outText = '```' + table.toString() + '```';

		// Show short summary of games
		if ( hasMatchFilters ) {
			const teamAName = teamA1 + ( teamA2 ? ' and ' + teamA2 : '' );
			const teamBName = teamB1 + ( teamB2 ? ' and ' + teamB2 : '' );

			if ( !historyEntries.length ) {
				return {
					'text': teamAName + ' didn\'t played' + ( isVersus ? ' against ' + teamBName : ' any game' )
				};
			}

			let summary =
				'\n ' + teamAName + ' won ' + teamAWins + ' out of ' + historyEntries.length + ' games';

			if ( isVersus ) {
				summary += ' against ' + teamBName;

				let halfOfMatches = historyEntries.length / 2;

				summary += '.\n ' +
					( teamAWins === halfOfMatches ? 'None' : ( teamAWins > halfOfMatches ? teamAName : teamBName ) ) +
					' rules ¯\\_(ツ)_/¯'
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
