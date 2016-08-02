const expect = require( 'chai' ).expect;
const Match = require( '../../app/model/match' );
const Rank = require( '../../app/model/rank' );

describe( 'Rank model', () => {
	'use strict';

	const playerA = { name: 'a', score: 1000, matches: 1 };
	const playerB = { name: 'b', score: 3000, matches: 1 };
	const playerC = { name: 'c', score: 2000, matches: 1 };
	const playerD = { name: 'd', score: 2000, matches: 1 };

	const historyMock = {};

	let rank;

	beforeEach( () => rank = new Rank( historyMock ) );

	describe( 'getPlayer', () => {
		it( 'should return new player instance for new player', () => {
			expect( rank.getPlayer( 'a' ) ).to.deep.equal( { name: 'a', score: 2000, matches: 0 } );
		} );

		it( 'should return existing player', () => {
			rank.setPlayer( playerB );

			expect( rank.getPlayer( 'b' ) ).to.deep.equal( playerB );
		} );
	} );

	describe( 'getPlayers', () => {
		it( 'should return empty array for empty rank', () => expect( rank.getPlayers() ).to.be.instanceOf( Array ).and.to.be.empty );

		it( 'should return existing players sorter by score', () => {
			rank.setPlayer( playerA );
			rank.setPlayer( playerB );
			rank.setPlayer( playerC );

			const players = rank.getPlayers();

			expect( players ).to.deep.equal( [ playerB, playerC, playerA ] );
		} );
	} );

	describe( 'getExpected', () => {
		it( 'should return expected for new players', () => {
			expect( rank.getExpected( 'a', 'b', 'c', 'd' ) ).to.deep.equal( { red: 10, blue: 10 } );
		} );

		it( 'should return expected for existing players', () => {
			rank.setPlayer( playerA );
			rank.setPlayer( playerB );
			rank.setPlayer( playerC );
			rank.setPlayer( playerD );

			expect( rank.getExpected( 'a', 'b', 'c', 'd' ) ).to.deep.equal( { red: 10, blue: 10 } );
			expect( rank.getExpected( 'a', 'c', 'b', 'd' ) ).to.deep.equal( { red: 0.03, blue: 10 } );
			expect( rank.getExpected( 'b', 'd', 'a', 'c' ) ).to.deep.equal( { red: 10, blue: 0.03 } );
		} );
	} );

	describe( 'addMatch', () => {
		it( 'should add players to rank and update expected', () => {
			expect( rank.getExpected( 'a', 'c', 'b', 'd' ) ).to.deep.equal( { red: 10, blue: 10 } );

			const matchResult = rank.addMatch( Match.createFromText( '@a @c 10 : 0 @b @d' ) );
			expect( matchResult ).to.deep.equal( {
				blue1: { name: "b", newScore: 1980, oldScore: 2000 },
				blue2: { name: "d", newScore: 1980, oldScore: 2000 },
				red1: { name: "a", newScore: 2020, oldScore: 2000 },
				red2: { name: "c", newScore: 2020, oldScore: 2000 }
			} );

			expect( rank.getExpected( 'a', 'c', 'b', 'd' ) ).to.deep.equal( { red: 10, blue: 7.94 } );
		} );
	} );

	describe( 'reload', () => {
		it( 'should add existing history entries to rank', () => {
			const rank = new Rank( {
				length: 1,
				getEntry: () => {
					return { match: '@a @c 10 : 0 @b @d' };
				}
			} );

			expect( rank.getExpected( 'a', 'c', 'b', 'd' ) ).to.deep.equal( { red: 10, blue: 10 } );

			rank.reload();

			expect( rank.getExpected( 'a', 'c', 'b', 'd' ) ).to.deep.equal( { red: 10, blue: 7.94 } );
		} );
	} );
} );
