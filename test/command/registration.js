const expect = require( 'chai' ).expect;

const Registration = require( '../../app/command/registration' );

describe( 'Registration command', () => {
	'use strict';

	const responseUri = 'just test';

	let registrationCommand;

	beforeEach( () => {
		registrationCommand = new Registration( {
			rank: {
				getPlayer: () => {
					return { score: 10 };
				},
				getExpected: () => {
					return { blue: 10, red: 10 };
				}
			}
		} );

	} );

	it( 'should return false for wrong command', () => {
		const wrongCommands = [
			'',
			'lolz',
			'register',
			'history'
		];

		for ( let command of wrongCommands ) {
			expect( registrationCommand.handleRequest( makeRequest( command ), () => expect.fail() ) ).to.be.null;
		}
	} );

	describe( '+', () => {
		it( 'should add current user', () => {
			const response = registrationCommand.handleRequest( makeRequest( '+' ), ( uri, text ) => {
				expect( uri ).to.equal( responseUri );
				expect( text ).to.equal( 'A new player joined the next match! Waiting for the next *3*!' );
			} );

			expect( response ).to.not.be.null;
			expect( response ).to.deep.equal( {
				'response_type': 'ephemeral',
				'text': '@jodator have been added to the next match.'
			} );
		} );

		it( 'should add other user', () => {
			const response = registrationCommand.handleRequest( makeRequest( '+ @pjasiun' ), ( uri, text ) => {
				expect( uri ).to.equal( responseUri );
				expect( text ).to.equal( 'A new player joined the next match! Waiting for the next *3*!' );
			} );

			expect( response ).to.not.be.null;
			expect( response ).to.deep.equal( {
				'response_type': 'ephemeral',
				'text': '@pjasiun have been added to the next match.'
			} );
		} );

		it( 'should add other users', () => {
			const asyncResponses = [];

			const response = registrationCommand.handleRequest( makeRequest( '+ @pjasiun @fredck' ), ( uri, text ) => {
				asyncResponses.push( text );
			} );

			expect( response ).to.not.be.null;
			expect( response ).to.deep.equal( {
				'response_type': 'ephemeral',
				'text': '@pjasiun, @fredck have been added to the next match.'
			} );

			expect( asyncResponses ).to.have.length( 2 );
			expect( asyncResponses.indexOf( 'A new player joined the next match! Waiting for the next *3*!' ) ).to.be.greaterThan( -1 );
			expect( asyncResponses.indexOf( 'A new player joined the next match! Waiting for the next *2*!' ) ).to.be.greaterThan( -1 );
		} );

		it( 'should add 20 users', () => {
			const asyncResponses = [];
			let moar = '';

			for ( let i = 1; i < 30; i++ ) {
				moar += `@player${i} `;
			}

			moar = moar.trim();

			const command = '+ ' + moar;
			const response = registrationCommand.handleRequest( makeRequest( command ), ( uri, text ) => {
				asyncResponses.push( text );
			} );

			expect( response ).to.not.be.null;

			expect( asyncResponses ).to.have.length( 29 );
			expect( asyncResponses.indexOf( 'A new player joined the next match! Waiting for the next *3*!' ) ).to.be.greaterThan( -1 );
			expect( asyncResponses.indexOf( 'A new player joined the next match! Waiting for the next *2*!' ) ).to.be.greaterThan( -1 );
		} );

		it( 'should start match for 4 users', () => {
			const asyncResponses = [];

			const response = registrationCommand.handleRequest( makeRequest( '+ @pjasiun @fredck @scofalik @lolz' ), ( uri, text ) => {
				asyncResponses.push( text );
			} );

			expect( response ).to.not.be.null;
			expect( response ).to.deep.equal( {
				'response_type': 'ephemeral',
				'text': '@pjasiun, @fredck, @scofalik, @lolz have been added to the next match.'
			} );

			expect( asyncResponses ).to.have.length( 4 );
			expect( asyncResponses.indexOf( 'A new player joined the next match! Waiting for the next *3*!' ) ).to.be.greaterThan( -1 );
			expect( asyncResponses.indexOf( 'A new player joined the next match! Waiting for the next *2*!' ) ).to.be.greaterThan( -1 );
			expect( asyncResponses.indexOf( 'A new player joined the next match! Waiting for the next *1*!' ) ).to.be.greaterThan( -1 );
			expect( asyncResponses.indexOf( ':fire: @pjasiun @lolz (10 : 10) @fredck @scofalik' ) ).to.be.greaterThan( -1 );
		} );

		it( 'should start match for first 4 users and queue next user', () => {
			const asyncResponses = [];

			const response = registrationCommand.handleRequest( makeRequest( '+ @pjasiun @fredck @scofalik @lolz @jodator' ), ( uri, text ) => {
				asyncResponses.push( text );
			} );

			expect( response ).to.not.be.null;
			expect( response ).to.deep.equal( {
				'response_type': 'ephemeral',
				'text': '@pjasiun, @fredck, @scofalik, @lolz, @jodator have been added to the next match.'
			} );

			expect( asyncResponses ).to.have.length( 5 );
			const firstPlayerAddedMsg = 'A new player joined the next match! Waiting for the next *3*!';
			expect( asyncResponses.indexOf( firstPlayerAddedMsg ) ).to.be.greaterThan( -1 );
			expect( asyncResponses.indexOf( 'A new player joined the next match! Waiting for the next *2*!' ) ).to.be.greaterThan( -1 );
			expect( asyncResponses.indexOf( 'A new player joined the next match! Waiting for the next *1*!' ) ).to.be.greaterThan( -1 );
			expect( asyncResponses.indexOf( ':fire: @pjasiun @lolz (10 : 10) @fredck @scofalik' ) ).to.be.greaterThan( -1 );

			let fistUserResponsesCount = 0;

			for ( let response of asyncResponses ) {
				if ( response === firstPlayerAddedMsg ) {
					fistUserResponsesCount++;
				}
			}
			expect( fistUserResponsesCount ).to.equal( 2 );
		} );

		it( 'should not add already added user', () => {
			registrationCommand.handleRequest( makeRequest( '+' ), ( uri, text ) => {
			} );

			const response = registrationCommand.handleRequest( makeRequest( '+' ), ( uri, text ) => {
				expect( uri ).to.equal( responseUri );
				expect( text ).to.equal( 'Oops! Some users already registered and will not be re-added!' );
			} );

			expect( response ).to.not.be.null;
			expect( response ).to.deep.equal( {
				'response_type': 'ephemeral',
				'text': '@jodator have been added to the next match.'
			} );
		} );
	} );

	describe( '-', () => {
		it( 'should nod fail removing current user from empty list', () => {
			const response = registrationCommand.handleRequest( makeRequest( '-' ), ( uri, text ) => {
				expect.fail();
			} );

			expect( response ).to.not.be.null;
			expect( response ).to.deep.equal( {
				'response_type': 'ephemeral',
				'text': '@jodator have been removed from the next match.'
			} );
		} );

		it( 'should remove current user', () => {
			registrationCommand.handleRequest( makeRequest( '+' ), ( uri, text ) => {
			} );

			const response = registrationCommand.handleRequest( makeRequest( '-' ), ( uri, text ) => {
				expect( uri ).to.equal( responseUri );
				expect( text ).to.equal( 'User removed from the match. :chicken: Now we need 4 players.' );
			} );

			expect( response ).to.not.be.null;
			expect( response ).to.deep.equal( {
				'response_type': 'ephemeral',
				'text': '@jodator have been removed from the next match.'
			} );
		} );

		it( 'should remove other user', () => {
			registrationCommand.handleRequest( makeRequest( '+ @pjasiun' ), ( uri, text ) => {
			} );
			const response = registrationCommand.handleRequest( makeRequest( '- @pjasiun' ), ( uri, text ) => {
				expect( uri ).to.equal( responseUri );
				expect( text ).to.equal( 'User removed from the match. :chicken: Now we need 4 players.' );
			} );

			expect( response ).to.not.be.null;
			expect( response ).to.deep.equal( {
				'response_type': 'ephemeral',
				'text': '@pjasiun have been removed from the next match.'
			} );
		} );

		it( 'should remove many other users', () => {
			registrationCommand.handleRequest( makeRequest( '+ @pjasiun @fredck' ), ( uri, text ) => {
			} );
			const asyncResponses = [];

			const response = registrationCommand.handleRequest( makeRequest( '- @pjasiun @fredck' ), ( uri, text ) => {
				asyncResponses.push( text );
			} );

			expect( response ).to.not.be.null;
			expect( response ).to.deep.equal( {
				'response_type': 'ephemeral',
				'text': '@pjasiun, @fredck have been removed from the next match.'
			} );

			expect( asyncResponses ).to.have.length( 2 );
			expect( asyncResponses.indexOf( 'User removed from the match. :chicken: Now we need 4 players.' ) ).to.be.greaterThan( -1 );
			expect( asyncResponses.indexOf( 'User removed from the match. :chicken: Now we need 3 players.' ) ).to.be.greaterThan( -1 );
		} );

		it( 'should start match for 4 users', () => {
			const asyncResponses = [];

			const response = registrationCommand.handleRequest( makeRequest( '+ @pjasiun @fredck @scofalik @lolz' ), ( uri, text ) => {
				asyncResponses.push( text );
			} );

			expect( response ).to.not.be.null;
			expect( response ).to.deep.equal( {
				'response_type': 'ephemeral',
				'text': '@pjasiun, @fredck, @scofalik, @lolz have been added to the next match.'
			} );

			expect( asyncResponses ).to.have.length( 4 );
			expect( asyncResponses.indexOf( 'A new player joined the next match! Waiting for the next *3*!' ) ).to.be.greaterThan( -1 );
			expect( asyncResponses.indexOf( 'A new player joined the next match! Waiting for the next *2*!' ) ).to.be.greaterThan( -1 );
			expect( asyncResponses.indexOf( 'A new player joined the next match! Waiting for the next *1*!' ) ).to.be.greaterThan( -1 );
			expect( asyncResponses.indexOf( ':fire: @pjasiun @lolz (10 : 10) @fredck @scofalik' ) ).to.be.greaterThan( -1 );
		} );

		it( 'should start match for first 4 users and queue next user', () => {
			const asyncResponses = [];

			const response = registrationCommand.handleRequest( makeRequest( '+ @pjasiun @fredck @scofalik @lolz @jodator' ), ( uri, text ) => {
				asyncResponses.push( text );
			} );

			expect( response ).to.not.be.null;
			expect( response ).to.deep.equal( {
				'response_type': 'ephemeral',
				'text': '@pjasiun, @fredck, @scofalik, @lolz, @jodator have been added to the next match.'
			} );

			expect( asyncResponses ).to.have.length( 5 );
			const firstPlayerAddedMsg = 'A new player joined the next match! Waiting for the next *3*!';
			expect( asyncResponses.indexOf( firstPlayerAddedMsg ) ).to.be.greaterThan( -1 );
			expect( asyncResponses.indexOf( 'A new player joined the next match! Waiting for the next *2*!' ) ).to.be.greaterThan( -1 );
			expect( asyncResponses.indexOf( 'A new player joined the next match! Waiting for the next *1*!' ) ).to.be.greaterThan( -1 );
			expect( asyncResponses.indexOf( ':fire: @pjasiun @lolz (10 : 10) @fredck @scofalik' ) ).to.be.greaterThan( -1 );

			let fistUserResponsesCount = 0;

			for ( let response of asyncResponses ) {
				if ( response === firstPlayerAddedMsg ) {
					fistUserResponsesCount++;
				}
			}
			expect( fistUserResponsesCount ).to.equal( 2 );
		} );
	} );

	function makeRequest( command ) {
		return {
			resolvedText: command,
			user_name: 'jodator',
			response_url: responseUri
		};
	}
} );
