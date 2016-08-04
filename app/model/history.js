'use strict';

const moment = require( 'moment' );
const Match = require( './match' );

class History {
	constructor( storage ) {
		this.storage = storage;
	}

	add( match ) {
		this.storage.data.push( [ match.date ? match.date.toString() : (new Date()).toString(), match.toString() ] );
		this.storage.save();
	}

	find( match ) {
		const matchString = match.toString();
		const data = this.storage.data;

		for ( let i = data.length - 1; i >= 0; i-- ) {
			if ( data[ i ][ 1 ] == matchString ) {
				return i;
			}
		}

		return null;
	}

	update( i, match ) {
		this.storage.data[ i ][ 1 ] = match.toString();
		this.storage.save();
	}

	remove( i ) {
		this.storage.data.splice( i, 1 );
		this.storage.save();
	}

	get length() {
		return this.storage.data.length;
	}

	getEntry( i ) {
		const entry = this.storage.data[ i ];
		const day = moment( new Date( entry[ 0 ] ) ).calendar( null, {
			sameDay: '[Today]',
			nextDay: '[Tomorrow]',
			nextWeek: 'dddd',
			lastDay: '[Yesterday]',
			lastWeek: '[Last] dddd',
			sameElse: 'DD/MM/YYYY'
		} );
		const time = moment( new Date( entry[ 0 ] ) ).format( 'H:mm' );
		const match = entry[ 1 ];

		return {
			day: day,
			time: time,
			match: match,
			date: entry[ 0 ]
		};
	}

	filterPlayer( player ) {
		let output = [];

		for ( let i = 0; i < this.length; i++ ) {
			let entry = this.getEntry( i );

			let match = Match.createFromText( entry.match, entry.date );

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

			let match = Match.createFromText( entry.match, entry.date );

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

			let match = Match.createFromText( entry.match, entry.date );

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

			let match = Match.createFromText( entry.match, entry.date );

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

			let match = Match.createFromText( entry.match, entry.date );

			if ( match.hasTeam( playerA, playerB ) && match.isVersus( playerA, playerC ) ) {
				output.push( entry );
			}
		}

		return output;
	}
}

module.exports = History;
