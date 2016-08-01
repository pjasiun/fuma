const expect = require( 'chai' ).expect;
const mockery = require( 'mockery' );
const Match = require( '../../app/model/match' );
const History = require( '../../app/model/history' );

describe( 'History model', () => {
	'use strict';

	/* @type History */
	let history;
	let storageMock;

	beforeEach( () => {
		storageMock = {
			data: [], save: () => {
			}
		};
		history = new History( storageMock );
	} );

	after( () => {
		mockery.disable();
	} );

	it( 'should add entries', () => {
		expect( history ).to.have.length( 0 );

		history.add( Match.createFromText( '@a @b 10 : 1 @c @d' ) );
		expect( history ).to.have.length( 1 );

		history.add( Match.createFromText( '@a @b 10 : 2 @c @d' ) );
		expect( history ).to.have.length( 2 );
	} );

	it( 'should find entries', () => {
		const match = Match.createFromText( '@a @b 10 : 1 @c @d' );
		expect( history ).to.have.length( 0 );
		expect( history.find( match ) ).to.be.null;

		history.add( match );

		expect( history ).to.have.length( 1 );
		expect( history.find( match ) ).to.equal( 0 );
	} );

	it( 'should remove entries', () => {
		const matchToRemove = Match.createFromText( '@a @b 10 : 3 @c @d' );

		history.add( Match.createFromText( '@a @b 10 : 1 @c @d' ) );
		history.add( Match.createFromText( '@a @b 10 : 2 @c @d' ) );
		history.add( matchToRemove );
		history.add( Match.createFromText( '@a @b 10 : 4 @c @d' ) );

		expect( history ).to.have.length( 4 );
		const indexToRemove = history.find( matchToRemove );
		expect( indexToRemove ).to.equal( 2 );

		history.remove( indexToRemove );
		expect( history ).to.have.length( 3 );
		expect( history.find( matchToRemove ) ).to.be.null;
	} );

	it( 'should update entries', () => {
		const match = Match.createFromText( '@a @b 10 : 1 @c @d' );

		history.add( match );
		history.add( Match.createFromText( '@a @b 10 : 4 @c @d' ) );
		history.add( Match.createFromText( '@a @b 10 : 5 @c @d' ) );

		expect( history ).to.have.length( 3 );
		const indexToUpdate = history.find( match );
		expect( indexToUpdate ).to.equal( 0 );

		const newMatch = Match.createFromText( '@a @b 10 : 7 @c @d' );

		history.update( indexToUpdate, newMatch );
		expect( history ).to.have.length( 3 );

		expect( history.find( match ) ).to.be.null;
		expect( history.find( newMatch ) ).to.equal( 0 );
	} );

	it( 'should return entry', () => {
		const match = Match.createFromText( '@a @b 10 : 1 @c @d' );

		history.add( match );

		expect( history.getEntry( 0 ).match ).to.equal( match.toString() );

	} );

	it( 'should filter by one player', () => {
		history.add( Match.createFromText( '@a @b 10 : 1 @c @d' ) );
		history.add( Match.createFromText( '@z @a 10 : 1 @c @d' ) );
		history.add( Match.createFromText( '@x @y 10 : 1 @u @b' ) );
		history.add( Match.createFromText( '@x @y 10 : 1 @a @b' ) );
		history.add( Match.createFromText( '@x @y 10 : 1 @b @a' ) );
		history.add( Match.createFromText( '@aa @y 10 : 1 @b @a' ) );
		history.add( Match.createFromText( '@a @b 10 : 1 @aa @x' ) );
		history.add( Match.createFromText( '@x @y 10 : 1 @aa @b' ) );

		expect( history ).to.have.length( 8 );

		const filtered = history.filterPlayer( '@a' );
		expect( filtered ).to.have.length( 6 );
	} );

	it( 'should filter player versus player', () => {
		history.add( Match.createFromText( '@b @a 10 : 1 @y @z' ) );
		history.add( Match.createFromText( '@a @x 10 : 1 @y @z' ) );
		history.add( Match.createFromText( '@b @x 10 : 1 @y @z' ) );
		history.add( Match.createFromText( '@x @a 10 : 1 @y @z' ) );
		history.add( Match.createFromText( '@x @a 10 : 1 @b @z' ) );
		history.add( Match.createFromText( '@a @x 10 : 1 @b @z' ) );
		history.add( Match.createFromText( '@a @x 10 : 1 @z @b' ) );
		history.add( Match.createFromText( '@x @a 10 : 1 @y @z' ) );
		history.add( Match.createFromText( '@x @a 10 : 1 @y @z' ) );
		history.add( Match.createFromText( '@x @y 10 : 1 @a @b' ) );
		history.add( Match.createFromText( '@aa @b 10 : 1 @y @z' ) );
		history.add( Match.createFromText( '@aa @x 10 : 1 @y @z' ) );
		history.add( Match.createFromText( '@b @x 10 : 1 @y @z' ) );
		history.add( Match.createFromText( '@x @aa 10 : 1 @y @z' ) );
		history.add( Match.createFromText( '@x @aa 10 : 1 @b @z' ) );
		history.add( Match.createFromText( '@x @aa 10 : 1 @y @z' ) );
		history.add( Match.createFromText( '@x @y 10 : 1 @aa @b' ) );
		history.add( Match.createFromText( '@x @y 10 : 1 @a @b' ) );

		expect( history ).to.have.length( 18 );

		const filtered = history.filterPlayerVsPlayer( '@a', '@b' );
		expect( filtered ).to.have.length( 3 );
	} );

	it( 'should filter by team', () => {
		history.add( Match.createFromText( '@a @b 10 : 1 @y @z' ) );
		history.add( Match.createFromText( '@a @x 10 : 1 @y @z' ) );
		history.add( Match.createFromText( '@b @x 10 : 1 @y @z' ) );
		history.add( Match.createFromText( '@x @a 10 : 1 @y @z' ) );
		history.add( Match.createFromText( '@x @a 10 : 1 @b @z' ) );
		history.add( Match.createFromText( '@a @x 10 : 1 @b @z' ) );
		history.add( Match.createFromText( '@a @x 10 : 1 @z @b' ) );
		history.add( Match.createFromText( '@x @a 10 : 1 @y @z' ) );
		history.add( Match.createFromText( '@x @y 10 : 1 @a @b' ) );
		history.add( Match.createFromText( '@aa @b 10 : 1 @y @z' ) );
		history.add( Match.createFromText( '@aa @x 10 : 1 @y @z' ) );
		history.add( Match.createFromText( '@b @x 10 : 1 @y @z' ) );
		history.add( Match.createFromText( '@x @aa 10 : 1 @y @z' ) );
		history.add( Match.createFromText( '@x @aa 10 : 1 @b @z' ) );
		history.add( Match.createFromText( '@x @aa 10 : 1 @y @z' ) );
		history.add( Match.createFromText( '@x @y 10 : 1 @aa @b' ) );

		expect( history ).to.have.length( 16 );

		const filtered = history.filterTeam( '@a', '@b' );
		expect( filtered ).to.have.length( 2 );
	} );

	it( 'should filter by team vs team', () => {
		// OK:
		history.add( Match.createFromText( '@a @b 10 : 1 @c @d' ) );
		history.add( Match.createFromText( '@a @b 10 : 1 @d @c' ) );
		history.add( Match.createFromText( '@c @d 10 : 1 @b @a' ) );
		history.add( Match.createFromText( '@c @d 10 : 1 @a @b' ) );

		// NO OK:
		history.add( Match.createFromText( '@a @x 1 : 10 @y @z' ) );
		history.add( Match.createFromText( '@a @b 1 : 10 @y @z' ) );
		history.add( Match.createFromText( '@a @b 1 : 10 @c @z' ) );
		history.add( Match.createFromText( '@a @b 1 : 10 @z @c' ) );
		history.add( Match.createFromText( '@a @b 1 : 10 @z @d' ) );
		history.add( Match.createFromText( '@a @x 1 : 10 @c @d' ) );
		history.add( Match.createFromText( '@aa @b 1 : 10 @c @d' ) );
		history.add( Match.createFromText( '@aa @x 1 : 10 @c @d' ) );
		history.add( Match.createFromText( '@a @c 1 : 10 @b @d' ) );
		history.add( Match.createFromText( '@a @d 1 : 10 @b @c' ) );

		expect( history ).to.have.length( 14 );

		const filtered = history.filterTeamVsTeam( '@a', '@b', '@c', '@d' );
		expect( filtered ).to.have.length( 4 );
	} );

	it( 'should filter by team vs player', () => {
		// OK:
		history.add( Match.createFromText( '@a @b 10 : 1 @c @x' ) );
		history.add( Match.createFromText( '@a @b 10 : 1 @y @c' ) );
		history.add( Match.createFromText( '@c @x 10 : 1 @b @a' ) );
		history.add( Match.createFromText( '@c @y 10 : 1 @a @b' ) );

		// NO OK:
		history.add( Match.createFromText( '@a @x 1 : 10 @y @z' ) );
		history.add( Match.createFromText( '@a @b 1 : 10 @y @z' ) );
		history.add( Match.createFromText( '@a @b 1 : 10 @d @z' ) );
		history.add( Match.createFromText( '@a @b 1 : 10 @z @r' ) );
		history.add( Match.createFromText( '@a @b 1 : 10 @z @d' ) );
		history.add( Match.createFromText( '@a @x 1 : 10 @c @d' ) );
		history.add( Match.createFromText( '@aa @b 1 : 10 @c @d' ) );
		history.add( Match.createFromText( '@aa @x 1 : 10 @c @d' ) );
		history.add( Match.createFromText( '@a @c 1 : 10 @b @d' ) );
		history.add( Match.createFromText( '@a @d 1 : 10 @b @c' ) );

		expect( history ).to.have.length( 14 );

		const filtered = history.filterTeamVsPlayer( '@a', '@b', '@c' );
		expect( filtered ).to.have.length( 4 );
	} );
} );
