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
			records: getRecords( allUpdates, player ),
			teams: getPlayerTeams( allUpdates, player )
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

	// Used to render "certain" data points in google charts: https://google-developers.appspot.com/chart/interactive/docs/roles#certaintyrole
	// Certainty role is used to render dashed line on cumulative rank chart when player wasn't participating in that game.
	let lastUpdateWasPlayers = false;

	let currentIndex = -1;

	for ( let update of allUpdates ) {
		currentIndex++;
		const playerChange = getPlayerChange( player, update );

		if ( playerChange ) {
			rankHistory.push( [
				update.match.date,
				playerChange.newScore,
				playerChange.newScore - playerChange.oldScore,
				update.match.toString(),
				true
			] );
			lastPlayerScore = playerChange.newScore;

			// Change previous data point to certain in order to render this change as solid line on google charts.
			if ( currentIndex > 1 && !lastUpdateWasPlayers ) {
				rankHistory[ currentIndex - 1 ][ 4 ] = true;
			}

			lastUpdateWasPlayers = true;
		} else if ( includeOthers ) {
			lastUpdateWasPlayers = false;
			rankHistory.push( [ update.match.date, lastPlayerScore, 0, update.match.toString(), lastUpdateWasPlayers ] );
		}
	}

	return rankHistory;
}

function getRecords( allUpdates, player ) {
	const max = {
		wins: 0,
		losses: 0,
		seriesWins: 0,
		seriesLosses: 0,
		seriesRankGain: 0,
		seriesRankLoss: 0,
		pointsGain: 0,
		pointsGainMatch: false,
		pointsLoss: 0,
		pointsLossMatch: false,
		humiliations: { wins: 0, losses: 0 },
		gainRankOnLoss: 0,
		gainRankOnLossMax: 0,
		lossRankOnWin: 0,
		lossRankOnWinMax: 0,
		noRankChange: 0,
		rankMax: 2000,
		rankMin: 2000
	};

	let currentWins = 0;
	let currentLosses = 0;

	let currentRankSerries = 0;
	let rankChange = 0;

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

		rankChange = getRankChange( change );

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
				max.lossRankOnWin += 1;

				if ( rankChange < max.lossRankOnWinMax ) {
					max.lossRankOnWinMax = rankChange;
				}
			}

			if ( rankChange > max.pointsGain ) {
				max.pointsGain = rankChange;
				max.pointsGainMatch = getGameData( update, change, player );
			}
		} else {
			currentLosses += 1;
			currentWins = 0;

			max.losses += 1;

			if ( currentLosses > max.seriesLosses ) {
				max.seriesLosses = currentLosses;
			}

			if ( update.match.blueScore === 0 ) {
				max.humiliations.losses += 1;
			}

			if ( rankChange > 0 ) {
				max.gainRankOnLoss += 1;

				if ( rankChange > max.gainRankOnLossMax ) {
					max.gainRankOnLossMax = rankChange;
				}
			}

			if ( rankChange < max.pointsLoss ) {
				max.pointsLoss = rankChange;
				max.pointsLossMatch = getGameData( update, change, player );
			}
		}

		if ( rankChange === 0 ) {
			max.noRankChange += 1;
		}

		if ( rankChange > 0 ) {
			if ( currentRankSerries < 0 ) {
				if ( currentRankSerries < max.seriesRankLoss ) {
					max.seriesRankLoss = currentRankSerries;
				}
				currentRankSerries = 0;
			}
		}

		if ( rankChange < 0 ) {
			if ( currentRankSerries > 0 ) {
				if ( currentRankSerries > max.seriesRankGain ) {
					max.seriesRankGain = currentRankSerries;
				}
				currentRankSerries = 0;
			}
		}

		currentRankSerries += rankChange;
	}

	max.current = {
		isWinning: currentWins > 0,
		gamesStreak: currentWins ? currentWins : currentLosses,
		rankStreak: currentRankSerries,
		rank: rankChange
	};

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

	const allRecords = { humiliations: {}, players: records };

	const maxRecords = [
		'gainRankOnLoss', 'gainRankOnLossMax', 'losses', 'wins', 'pointsGain', 'lossRankOnWin', 'rankMax', 'seriesLosses', 'seriesWins',
		'noRankChange', 'seriesRankGain'
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

	for ( let record of [ 'wins', 'losses' ] ) {
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

	for ( let record of [ 'lossRankOnWinMax', 'pointsLoss', 'rankMin', 'seriesRankLoss' ] ) {
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

function getPlayerTeams( allUpdates, player ) {
	const teams = {
		teamMates: {},
		opponents: {}
	};

	for ( let update of allUpdates ) {
		const playerChange = getPlayerChange( player, update );

		const playerWon = isWin( player, update );
		if ( playerChange ) {
			const rankChange = getRankChange( playerChange );

			if ( update.red1.name === player ) {
				addTeamStats( update.red2, [ update.blue1, update.blue2 ], playerWon, rankChange );
			}

			if ( update.red2.name === player ) {
				addTeamStats( update.red1, [ update.blue1, update.blue2 ], playerWon, rankChange );
			}

			if ( update.blue1.name === player ) {
				addTeamStats( update.blue2, [ update.red1, update.red2 ], playerWon, rankChange );
			}

			if ( update.blue2.name === player ) {
				addTeamStats( update.blue1, [ update.red1, update.red2 ], playerWon, rankChange );
			}
		}
	}

	teams.teamMates = updateStats( teams.teamMates );
	teams.opponents = updateStats( teams.opponents );

	function updateStats( players ) {
		const output = [];

		for ( let player of Object.keys( players ) ) {
			const playerData = players[ player ];

			output.push( {
				name: player,
				wins: playerData.wins,
				games: playerData.games,
				losses: playerData.games - playerData.wins,
				winRatio: playerData.wins / playerData.games,
				rankChangeTotal: playerData.rankChangeTotal,
				rankChangeAvg: playerData.rankChangeTotal / playerData.games
			} );
		}

		return output.sort( ( playerA, playerB ) => playerB.games - playerA.games );
	}

	function addTeamStats( teamMate, opponents, playerWon, rankChange ) {
		if ( !teams.teamMates[ teamMate.name ] ) {
			teams.teamMates[ teamMate.name ] = { games: 0, wins: 0, rankChangeTotal: 0 };
		}

		teams.teamMates[ teamMate.name ].games += 1;
		teams.teamMates[ teamMate.name ].rankChangeTotal += rankChange;

		if ( playerWon ) {
			teams.teamMates[ teamMate.name ].wins += 1;
		}

		for ( let opponent of opponents ) {
			if ( !teams.opponents[ opponent.name ] ) {
				teams.opponents[ opponent.name ] = { games: 0, wins: 0, rankChangeTotal: 0 };
			}

			teams.opponents[ opponent.name ].games += 1;
			teams.opponents[ opponent.name ].rankChangeTotal += rankChange;

			if ( playerWon ) {
				teams.opponents[ opponent.name ].wins += 1;
			}
		}
	}

	return teams;
}

module.exports = Stats;
