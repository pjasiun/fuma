const expect = require( 'chai' ).expect;
const Match = require( '../../app/model/match' );

describe( 'Match', () => {
	it( 'should be created from the regexp', () => {
		expectMatchToHaveStandardProperties( Match.createFromText( '@r1 @r2 10 : 7 @bl1 @bl2' ) );
	} );

	it( 'should be created from the regexp whithout spaces', () => {
		expectMatchToHaveStandardProperties( Match.createFromText( '@r1@r2 10:7 @bl1@bl2' ) );
	} );

	it( 'should be created from the regexp whith additional spaces', () => {
		expectMatchToHaveStandardProperties( Match.createFromText( '\t@r1\t@r2 10\t:7  @bl1    @bl2   ' ) );
	} );

	it( 'should not be created from the cropped text', () => {
		expect( Match.createFromText( '@r1 @r2 10 : 7 @bl1' ) ).to.be.null;
	} );

	it( 'should not be created from the text without special characters', () => {
		expect( Match.createFromText( '@r1 @r2 10 7 @bl1 @bl2' ) ).to.be.null;
	} );

	it( 'should check if player was in match', () => {
		expect( Match.createFromText( '@a @b 10 : 2 @x @y' ).hasPlayer( '@a' ) ).to.be.true;
		expect( Match.createFromText( '@a @b 10 : 2 @x @y' ).hasPlayer( '@b' ) ).to.be.true;
		expect( Match.createFromText( '@a @b 10 : 2 @x @y' ).hasPlayer( '@x' ) ).to.be.true;
		expect( Match.createFromText( '@a @b 10 : 2 @x @y' ).hasPlayer( '@y' ) ).to.be.true;
		expect( Match.createFromText( '@a @b 10 : 2 @x @y' ).hasPlayer( 'a' ) ).to.be.true;
		expect( Match.createFromText( '@a @b 10 : 2 @x @y' ).hasPlayer( 'b' ) ).to.be.true;
		expect( Match.createFromText( '@a @b 10 : 2 @x @y' ).hasPlayer( 'x' ) ).to.be.true;
		expect( Match.createFromText( '@a @b 10 : 2 @x @y' ).hasPlayer( 'y' ) ).to.be.true;
		expect( Match.createFromText( '@a @b 10 : 2 @x @y' ).hasPlayer( '@c' ) ).to.be.false;
		expect( Match.createFromText( '@a @b 10 : 2 @x @y' ).hasPlayer( '@aa' ) ).to.be.false;
		expect( Match.createFromText( '@aa @b 10 : 2 @x @y' ).hasPlayer( '@a' ) ).to.be.false;
		expect( Match.createFromText( '@aa @b 10 : 2 @x @y' ).hasPlayer( 'a' ) ).to.be.false;
	} );

	it( 'should check if it contains team', () => {
		expect( Match.createFromText( '@a @b 10 : 2 @x @y' ).hasTeam( '@a', '@b' ) ).to.be.true;
		expect( Match.createFromText( '@a @b 10 : 2 @x @y' ).hasTeam( '@b', '@a' ) ).to.be.true;
		expect( Match.createFromText( '@a @b 10 : 2 @x @y' ).hasTeam( 'a', '@b' ) ).to.be.true;
		expect( Match.createFromText( '@a @b 10 : 2 @x @y' ).hasTeam( '@a', 'b' ) ).to.be.true;
		expect( Match.createFromText( '@a @b 10 : 2 @x @y' ).hasTeam( '@x', '@y' ) ).to.be.true;
		expect( Match.createFromText( '@a @b 10 : 2 @x @y' ).hasTeam( '@y', '@x' ) ).to.be.true;
		expect( Match.createFromText( '@a @b 10 : 2 @x @y' ).hasTeam( 'x', 'y' ) ).to.be.true;
		expect( Match.createFromText( '@a @b 10 : 2 @x @y' ).hasTeam( '@a', '@x' ) ).to.be.false;
		expect( Match.createFromText( '@a @b 10 : 2 @x @y' ).hasTeam( '@b', '@x' ) ).to.be.false;
		expect( Match.createFromText( '@a @b 10 : 2 @x @y' ).hasTeam( '@a', '@y' ) ).to.be.false;
		expect( Match.createFromText( '@a @b 10 : 2 @x @y' ).hasTeam( '@aa', '@b' ) ).to.be.false;
		expect( Match.createFromText( '@aa @b 10 : 2 @x @y' ).hasTeam( '@b', '@a' ) ).to.be.false;
	} );

	it( 'should check if it is a versus match', () => {
		expect( Match.createFromText( '@a @b 10 : 2 @x @y' ).isVersus( '@a', '@x' ) ).to.be.true;
		expect( Match.createFromText( '@a @b 10 : 2 @x @y' ).isVersus( '@a', '@y' ) ).to.be.true;
		expect( Match.createFromText( '@a @b 10 : 2 @x @y' ).isVersus( '@x', '@a' ) ).to.be.true;
		expect( Match.createFromText( '@a @b 10 : 2 @x @y' ).isVersus( '@b', '@x' ) ).to.be.true;
		expect( Match.createFromText( '@a @b 10 : 2 @x @y' ).isVersus( 'a', 'x' ) ).to.be.true;
		expect( Match.createFromText( '@a @b 10 : 2 @x @y' ).isVersus( '@a', '@b' ) ).to.be.false;
		expect( Match.createFromText( '@a @b 10 : 2 @x @y' ).isVersus( '@b', '@a' ) ).to.be.false;
		expect( Match.createFromText( '@a @b 10 : 2 @x @y' ).isVersus( '@x', '@y' ) ).to.be.false;
		expect( Match.createFromText( '@a @b 10 : 2 @x @y' ).isVersus( '@y', '@x' ) ).to.be.false;
		expect( Match.createFromText( '@aa @b 10 : 2 @x @y' ).isVersus( '@a', '@x' ) ).to.be.false;
		expect( Match.createFromText( '@a @b 10 : 2 @x @y' ).isVersus( '@aa', '@x' ) ).to.be.false;
	} );

	it( 'should check if it is has a redTeam', () => {
		expect( Match.createFromText( '@a @b 10 : 2 @x @y' ).hasRedTeam( '@a', '@b' ) ).to.be.true;
		expect( Match.createFromText( '@a @b 10 : 2 @x @y' ).hasRedTeam( '@b', '@a' ) ).to.be.true;
		expect( Match.createFromText( '@a @b 10 : 2 @x @y' ).hasRedTeam( 'a', '@b' ) ).to.be.true;
		expect( Match.createFromText( '@a @b 10 : 2 @x @y' ).hasRedTeam( '@x', '@y' ) ).to.be.false;
		expect( Match.createFromText( '@a @b 10 : 2 @x @y' ).hasRedTeam( '@y', '@x' ) ).to.be.false;
		expect( Match.createFromText( '@a @b 10 : 2 @x @y' ).hasRedTeam( '@a', '@x' ) ).to.be.false;
		expect( Match.createFromText( '@a @b 10 : 2 @x @y' ).hasRedTeam( '@a', '@y' ) ).to.be.false;
		expect( Match.createFromText( '@a @b 10 : 2 @x @y' ).hasRedTeam( '@a', '@c' ) ).to.be.false;
	} );

	it( 'should check if it is has a blueTeam', () => {
		expect( Match.createFromText( '@a @b 10 : 2 @x @y' ).hasBlueTeam( '@x', '@y' ) ).to.be.true;
		expect( Match.createFromText( '@a @b 10 : 2 @x @y' ).hasBlueTeam( '@y', '@x' ) ).to.be.true;
		expect( Match.createFromText( '@a @b 10 : 2 @x @y' ).hasBlueTeam( 'x', '@y' ) ).to.be.true;
		expect( Match.createFromText( '@a @b 10 : 2 @x @y' ).hasBlueTeam( '@a', '@b' ) ).to.be.false;
		expect( Match.createFromText( '@a @b 10 : 2 @x @y' ).hasBlueTeam( '@b', '@a' ) ).to.be.false;
		expect( Match.createFromText( '@a @b 10 : 2 @x @y' ).hasBlueTeam( '@a', '@y' ) ).to.be.false;
		expect( Match.createFromText( '@a @b 10 : 2 @x @y' ).hasBlueTeam( '@x', '@c' ) ).to.be.false;
	} );

	function expectMatchToHaveStandardProperties( match ) {
		expect( match.red1 ).to.equals( 'r1' );
		expect( match.red2 ).to.equals( 'r2' );
		expect( match.redScore ).to.equals( 10 );
		expect( match.blueScore ).to.equals( 7 );
		expect( match.blue1 ).to.equals( 'bl1' );
		expect( match.blue2 ).to.equals( 'bl2' );
	}
} );
