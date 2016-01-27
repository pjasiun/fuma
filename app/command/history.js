'use strict';

const Table = require( 'cli-table' );
const history = require( '../model/history' );

const _ = require( 'lodash' );


class Result {
	constructor( context ) {
		this.context = context;
	}

	handleRequest( request ) {
		if ( request.text != 'history' ) {
			return;
		}

		if ( !history.length ) {
			return { 'text:': 'History is empty.' };
		}

		let historyEntries = [];

		for ( let i = 0; i < history.length; i++ ) {
			historyEntries.push( history.getEntry( i ) );
		}

		const table = new Table( { style : { compact : true } } );

		const days = _.groupBy( historyEntries, 'day' );

		for ( let day in days ) {
			table.push( [], [ '', day ], [] );

			for ( let i = 0; i < days[ day ].length; i++ ) {
				table.push( [ days[ day ][ i ].time, days[ day ][ i ].match ] );
			}
		}

		console.log( table.toString() );

		return {
			'text': '```' + table.toString() + '```'

		};
	}
}

module.exports = Result;