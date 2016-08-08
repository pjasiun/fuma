const expect = require( 'chai' ).expect;

const makeRequest = require( './../utils/makeRequest' );

const Stats = require( '../../app/command/stats' );

describe( 'Stats command', () => {
	'use strict';

	it( 'should return url to stats page based on config', () => {
		const statsCommand = new Stats();

		const wrongCommands = [
			'',
			'lolz',
			'register',
			'history'
		];

		for ( let command of wrongCommands ) {
			expect( statsCommand.handleRequest( makeRequest( command ), () => expect.fail() ) ).to.be.undefined;
		}
	} );

	it( 'should return false for wrong command', () => {
		const statsCommand = new Stats( { config: { host: 'lolz', port: '666' } } );

		expect( statsCommand.handleRequest( makeRequest( 'stats' ), () => expect.fail() ) )
			.to.have.property( 'text' )
			.to.equal( 'View stats here: http://lolz:666/stats' );
	} );
} );
