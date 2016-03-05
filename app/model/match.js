'use strict';

const matchText = /^\s*@(\S*)\s*@(\S*)\s*(\d+)\s*\:\s*(\d+)\s*@(\S*)\s*@(\S*)\s*$/;

class Match {
	constructor( red1, red2, redScore, blueScore, blue1, blue2 ) {
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

	static createFromText( text ) {
		const values = matchText.exec( text );

		if ( !values ) {
			return null;
		}

		return new Match( values[ 1 ],
			values[ 2 ],
			parseInt( values[ 3 ] ),
			parseInt( values[ 4 ] ),
			values[ 5 ],
			values[ 6 ] );
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
