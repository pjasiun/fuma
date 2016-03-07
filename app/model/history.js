'use strict';

const moment = require( 'moment' );
const Match = require( './match' );

class History {
	constructor( storage ) {
		this.data = storage.data;
		this.save = storage.save;
	}

	add( match ) {
		const now = new Date();

		this.data.push( [ now.toString(), match.toString() ] );
		this.save();
	}

	find( match ) {
		const matchString = match.toString();
		const data = this.data;

		for ( let i = data.length - 1; i >= 0; i-- ) {
			if ( data[ i ][ 1 ] == matchString ) {
				return i;
			}
		}

		return null;
	}

	update( i, match ) {
		this.data[ i ][ 1 ] = match.toString();
		this.save();
	}

	remove( i ) {
		this.data.splice( i, 1 );
		this.save();
	}

	get length() {
		return this.data.length;
	}

	getEntry( i ) {
		const entry = this.data[ i ];
		const day = moment( entry[ 0 ] ).calendar( null, {
			sameDay: '[Today]',
			nextDay: '[Tomorrow]',
			nextWeek: 'dddd',
			lastDay: '[Yesterday]',
			lastWeek: '[Last] dddd',
			sameElse: 'DD/MM/YYYY'
		} );
		const time = moment( entry[ 0 ] ).format( 'H:mm' );
		const match = entry[ 1 ];

		return {
			day: day,
			time: time,
			match: match
		};
	}

	filterPlayer( player ) {
		let output = [];

		for ( let i = 0; i < this.length; i++ ) {
			let entry = this.getEntry( i );

			let match = Match.createFromText( entry.match );

			if ( match.hasPlayer( player ) ) {
				output.push( entry );
			}
		}

		return output;
	}

	filterPlayerVsPlayer( playerA, playerB ) {
		let output = [];

		for ( let i = 0; i < this.length; i++ ) {
			let entry = this.getEntry( i );

			let match = Match.createFromText( entry.match );

			if ( match.isVersus( playerA, playerB ) ) {
				output.push( entry );
			}
		}

		return output;
	}

	filterTeam( playerA, playerB ) {
		let output = [];

		for ( let i = 0; i < this.length; i++ ) {
			let entry = this.getEntry( i );

			let match = Match.createFromText( entry.match );

			if ( match.hasTeam( playerA, playerB ) ) {
				output.push( entry );
			}
		}

		return output;
	}

	filterTeamVsTeam( playerA, playerB, playerC, playerD ) {
		let output = [];

		for ( let i = 0; i < this.length; i++ ) {
			let entry = this.getEntry( i );

			let match = Match.createFromText( entry.match );

			if ( match.hasTeam( playerA, playerB ) && match.hasTeam( playerC, playerD ) ) {
				output.push( entry );
			}
		}

		return output;
	}

	filterTeamVsPlayer( playerA, playerB, playerC ) {
		let output = [];

		for ( let i = 0; i < this.length; i++ ) {
			let entry = this.getEntry( i );

			let match = Match.createFromText( entry.match );

			if ( match.hasTeam( playerA, playerB ) && match.isVersus( playerA, playerC ) ) {
				output.push( entry );
			}
		}

		return output;
	}
}

const historyData = require( '../storage' )( 'history', { data: [] } );

module.exports = new History( historyData );
