'use strict';

class Stats {
	constructor( rank ) {
		this.rank = rank;
	}

	getPlayerStats( player ) {
		const allUpdates = getAllUpdates( this.rank );

		return {
			name: player,
			rankHistory: calculatePlayerRankHistory( allUpdates, player ),
			lastGames: getLastGames( allUpdates, player ),
			records: getRecords( allUpdates, player )
		}
	}

	getFull() {
		const players = this.rank.getPlayers();
		const allUpdates = getAllUpdates( this.rank );

		return {
			players: players,
			rankHistory: calculateRankHistory( allUpdates, players ),
			records: calculateRecords( allUpdates, players ),
			kingTimeline: calculateKingTimeline( allUpdates )
		}
	}
}

function getAllUpdates( rank ) {
	const allUpdates = [];

	for ( let update of rank ) {
		allUpdates.push( update );
	}

	return allUpdates;
}

function getRankChange( playerChange ) {
	return playerChange.newScore - playerChange.oldScore;
}

function getGameData( update, playerChange, player ) {
	return {
		date: update.match.date,
		rankChange: getRankChange( playerChange ),
		score: update.match.redScore + ' : ' + update.match.blueScore,
		red: update.match.red1 + ' ' + update.match.red2,
		blue: update.match.blue1 + ' ' + update.match.blue2,
		isWin: isWin( player, update )
	};
}

function getLastGames( allUpdates, player ) {
	const lastGames = [];

	const playerGames = allUpdates.filter( ( update ) => {
		return !!getPlayerChange( player, update );
	} );

	for ( let lastUpdate of playerGames.slice( -10 ).reverse() ) {
		const playerChange = getPlayerChange( player, lastUpdate );

		lastGames.push( getGameData( lastUpdate, playerChange, player ) );
	}

	return lastGames;
}

function calculatePlayerRankHistory( allUpdates, player, includeOthers ) {
	const rankHistory = [];

	let lastPlayerScore = 2000;

	for ( let update of allUpdates ) {
		const playerChange = getPlayerChange( player, update );

		if ( playerChange ) {
			rankHistory.push( [ update.match.date, playerChange.newScore ] )
			lastPlayerScore = playerChange.newScore;
		} else if ( includeOthers ) {
			rankHistory.push( [ update.match.date, lastPlayerScore ] )
		}
	}

	return rankHistory;
}

function getRecords( allUpdates, player ) {
	const max = {
		wins: 0,
		looses: 0,
		seriesWins: 0,
		seriesLooses: 0,
		pointsGain: 0,
		pointsGainMatch: false,
		pointsLost: 0,
		pointsLostMatch: false,
		humiliations: { wins: 0, lost: 0 },
		gainRankOnLost: 0,
		gainRankOnLostMax: 0,
		lostRankOnWin: 0,
		lostRankOnWinMax: 0,
		noRankChange: 0,
		rankMax: 2000,
		rankMin: 2000
	};

	let currentWins = 0;
	let currentLosses = 0;

	for ( let update of allUpdates ) {
		const change = getPlayerChange( player, update );

		if ( !change ) {
			continue;
		}

		if ( change.newScore > max.rankMax ) {
			max.rankMax = change.newScore;
		}

		if ( change.newScore < max.rankMin ) {
			max.rankMin = change.newScore;
		}

		const rankChange = getRankChange( change );

		if ( isWin( player, update ) ) {
			currentWins += 1;
			currentLosses = 0;

			max.wins += 1;

			if ( currentWins > max.seriesWins ) {
				max.seriesWins = currentWins;
			}

			if ( update.match.blueScore === 0 ) {
				max.humiliations.wins += 1;
			}

			if ( rankChange < 0 ) {
				max.lostRankOnWin += 1;

				if ( rankChange < max.lostRankOnWinMax ) {
					max.lostRankOnWinMax = rankChange;
				}
			}
		} else {
			currentLosses += 1;
			currentWins = 0;

			max.looses += 1;

			if ( currentLosses > max.seriesLooses ) {
				max.seriesLooses = currentLosses;
			}

			if ( update.match.blueScore === 0 ) {
				max.humiliations.lost += 1;
			}

			if ( rankChange > 0 ) {
				max.gainRankOnLost += 1;

				if ( rankChange > max.gainRankOnLostMax ) {
					max.gainRankOnLostMax = rankChange;
				}
			}
		}

		if ( rankChange === 0 ) {
			max.noRankChange += 1;
		}

		if ( rankChange < max.pointsLost ) {
			max.pointsLost = rankChange;
			max.pointsLostMatch = getGameData( update, change, player );
		}

		if ( rankChange > max.pointsGain ) {
			max.pointsGain = rankChange;
			max.pointsGainMatch = getGameData( update, change, player );
		}
	}

	return max;
}

function isWin( player, update ) {
	const playerNoMonkeyName = player.replace( '@', '' );
	return playerNoMonkeyName === update.match.red1 || playerNoMonkeyName === update.match.red2;
}

function getPlayerChange( name, update ) {
	const player = name.replace( '@', '' );

	for ( let key of Object.keys( update ) ) {
		if ( update[ key ].name === player ) {
			return update[ key ];
		}
	}
}

function calculateKingTimeline( allUpdates ) {
	const kingTimeline = [];

	let lastKing = { from: false, to: false, name: '' };

	for ( let update of allUpdates ) {
		let currentKing = update.king;

		if ( currentKing !== lastKing.name ) {
			lastKing.to = update.match.date;

			if ( lastKing.name !== '' ) {
				if ( lastKing.name.indexOf( ',' ) !== -1 ) {
					for ( let name of lastKing.name.split( ', ' ) ) {
						let tmpKing = lastKing;
						tmpKing.name = name;
						kingTimeline.push( tmpKing );
					}
				} else {
					kingTimeline.push( lastKing );
				}
			}

			lastKing = { from: update.match.date, name: currentKing, to: false }
		}
	}

	lastKing.to = new Date();
	kingTimeline.push( lastKing );

	const newKingTimeline = [];
	let lastUpdate = {};

	for ( let update of kingTimeline ) {
		if ( lastUpdate.name === update.name ) {
			lastUpdate.to = update.to;
		} else {
			if ( lastUpdate.name ) {
				newKingTimeline.push( lastUpdate );
			}
			lastUpdate = update;
		}
	}
	newKingTimeline.push( lastUpdate );
	return newKingTimeline;
}

function calculateRecords( allUpdates, players ) {
	const records = {};

	for ( let player of players ) {
		records[ player.name ] = getRecords( allUpdates, player.name );
	}

	const allRecords = { humiliations: {} };

	const maxRecords = [
		'gainRankOnLost', 'gainRankOnLostMax', 'looses', 'wins', 'pointsGain', 'lostRankOnWin', 'rankMax', 'seriesLooses', 'seriesWins',
		'noRankChange'
	];

	for ( let record of maxRecords ) {
		let recordMax = 0;
		let holder = '';

		for ( let player of players ) {
			const playerRecord = records[ player.name ][ record ];

			if ( playerRecord > recordMax ) {
				holder = player.name;
				recordMax = playerRecord;
			} else if ( playerRecord === recordMax ) {
				holder = holder + ', ' + player.name;
			}
		}

		allRecords[ record ] = { record: recordMax, holder: holder };
	}

	for ( let record of [ 'wins', 'lost' ] ) {
		let recordMax = 0;
		let holder = '';

		for ( let player of players ) {
			const playerRecord = records[ player.name ][ 'humiliations' ][ record ];

			if ( playerRecord > recordMax ) {
				holder = player.name;
				recordMax = playerRecord;
			} else if ( playerRecord === recordMax ) {
				holder = holder + ', ' + player.name;
			}
		}

		allRecords.humiliations[ record ] = { record: recordMax, holder: holder };
	}

	for ( let record of [ 'lostRankOnWinMax', 'pointsLost', 'rankMin' ] ) {
		let recordMin = 2000;
		let holder = '';

		for ( let player of players ) {
			const playerRecord = records[ player.name ][ record ];

			if ( playerRecord < recordMin ) {
				holder = player.name;
				recordMin = playerRecord;
			} else if ( playerRecord === recordMin ) {
				holder = holder + ', ' + player.name;
			}
		}

		allRecords[ record ] = { record: recordMin, holder: holder };
	}
	return allRecords;
}

function calculateRankHistory( allUpdates, players ) {
	const rankHistory = { '@length': allUpdates.length };

	for ( let player of players ) {
		rankHistory[ player.name ] = calculatePlayerRankHistory( allUpdates, player.name, true );
	}

	return rankHistory;
}

module.exports = Stats;
