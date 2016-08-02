'use strict';

const matchText = /^\s*@(\S*)\s*@(\S*)\s*(\d+)\s*\:\s*(\d+)\s*@(\S*)\s*@(\S*)\s*$/;

class Match {
	/**
	 * Creates match.
	 *
	 * @param {String} red1
	 * @param {String} red2
	 * @param {Number} redScore
	 * @param {Number} blueScore
	 * @param {String} blue1
	 * @param {String} blue2
	 * @param {Date} date.
	 */
	constructor( red1, red2, redScore, blueScore, blue1, blue2, date ) {
		this.date = date ? date : new Date();

		// Reds are the winning team.
		if ( redScore > blueScore ) {
			this.red1 = red1;
			this.red2 = red2;
			this.redScore = redScore;
			this.blueScore = blueScore;
			this.blue1 = blue1;
			this.blue2 = blue2;
		} else {
			this.red1 = blue1;
			this.red2 = blue2;
			this.redScore = blueScore;
			this.blueScore = redScore;
			this.blue1 = red1;
			this.blue2 = red2;
		}
	}

	/**
	 * Creates match object from JSON history entry values.
	 *
	 * @param {String} text
	 * @param {String} [dateString] String value of date object, ie: `new Date().toString()`. Defaults to `new Date()`.
	 * @returns {*}
	 */
	static createFromText( text, dateString ) {
		const values = matchText.exec( text );

		if ( !values ) {
			return null;
		}

		return new Match(
			values[ 1 ],
			values[ 2 ],
			parseInt( values[ 3 ] ),
			parseInt( values[ 4 ] ),
			values[ 5 ],
			values[ 6 ],
			new Date( dateString )
		);
	}

	toString() {
		return '@' + this.red1 + ' @' + this.red2 + ' ' + this.redScore + ' : ' +
			this.blueScore + ' @' + this.blue1 + ' @' + this.blue2;
	}

	hasPlayer( playerHandle ) {
		let playerName = playerHandle.replace( '@', '' );

		return this.red1 === playerName || this.red2 === playerName || this.blue1 === playerName || this.blue2 === playerName;
	}

	hasTeam( playerA, playerB ) {
		return this.hasRedTeam( playerA, playerB ) || this.hasBlueTeam( playerA, playerB )
	}

	isVersus( playerA, playerB ) {
		return this.hasPlayer( playerA ) && this.hasPlayer( playerB ) && !this.hasTeam( playerA, playerB );
	}

	hasRedTeam( playerA, playerB ) {
		let playerAName = playerA.replace( '@', '' );
		let playerBName = playerB.replace( '@', '' );

		return ( this.red1 === playerAName && this.red2 === playerBName ) || ( this.red1 === playerBName && this.red2 === playerAName );
	}

	hasBlueTeam( playerA, playerB ) {
		let playerAName = playerA.replace( '@', '' );
		let playerBName = playerB.replace( '@', '' );

		return ( this.blue1 === playerAName && this.blue2 === playerBName ) || ( this.blue1 === playerBName && this.blue2 === playerAName );
	}
}

module.exports = Match;
