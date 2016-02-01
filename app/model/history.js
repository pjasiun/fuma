'use strict';

const moment = require( 'moment' );

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
}

const historyData = require( '../storage' )( 'history', { data: [] } );

module.exports = new History( historyData );