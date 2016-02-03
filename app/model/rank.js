'use strict';

const elo = require( 'elo-rank' )( 40 );
const history = require( './history' );
const Match = require( './match' );

class Rank {
	constructor() {
		this.players = new Map();
	}

	getPlayer( name ) {
		let player = this.players.get( name );

		if ( player ) {
			return player;
		} else {
			return {
				name: name,
				score: 2000,
				matches: 0
			};
		}
	}

	setPlayer( player ) {
		this.players.set( player.name, player );
	}

	addMatch( match ) {
		const red1 = this.getPlayer( match.red1 );
		const red2 = this.getPlayer( match.red2 );
		const blue1 = this.getPlayer( match.blue1 );
		const blue2 = this.getPlayer( match.blue2 );

		const teamRedAverage = ( red1.score + red2.score ) / 2;
		const teamBlueAverage = ( blue1.score + blue2.score ) / 2;

		let expectedScoreRed = elo.getExpected( teamRedAverage, teamBlueAverage );
		let expectedScoreBlue = elo.getExpected( teamBlueAverage, teamRedAverage );

		const redScore = match.redScore;
		const blueScore = match.blueScore;
		const scoreSum = match.redScore + match.blueScore;

		const ret = {
			red1: { name: match.red1, oldScore: red1.score },
			red2: { name: match.red2, oldScore: red2.score },
			blue1: { name: match.blue1, oldScore: blue1.score },
			blue2: { name: match.blue2, oldScore: blue2.score },
		};

		red1.score = elo.updateRating( expectedScoreRed, redScore / scoreSum, red1.score );
		red2.score = elo.updateRating( expectedScoreRed, redScore / scoreSum, red2.score );
		blue1.score = elo.updateRating( expectedScoreBlue, blueScore / scoreSum, blue1.score );
		blue2.score = elo.updateRating( expectedScoreBlue, blueScore / scoreSum, blue2.score );

		ret.red1.newScore = red1.score;
		ret.red2.newScore = red2.score;
		ret.blue1.newScore = blue1.score;
		ret.blue2.newScore = blue2.score;

		red1.matches++;
		red2.matches++;
		blue1.matches++;
		blue2.matches++;

		this.setPlayer( red1 );
		this.setPlayer( red2 );
		this.setPlayer( blue1 );
		this.setPlayer( blue2 );

		return ret;
	}

	getPlayers() {
		let players = Array.from( this.players.values() );

		return players.sort( ( a, b ) => b.score - a.score );
	}

	reload() {
		this.players.clear();

		for ( let i = 0; i < history.length; i++ ) {
			this.addMatch( Match.createFromText( history.getEntry( i ).match ) );
		}
	}
}

const rank = new Rank();
rank.reload();

module.exports = rank;