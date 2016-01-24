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

	function expectMatchToHaveStandardProperties( match ) {
		expect( match.red1 ).to.equals( 'r1' );
		expect( match.red2 ).to.equals( 'r2' );
		expect( match.redScore ).to.equals( 10 );
		expect( match.blueScore ).to.equals( 7 );
		expect( match.blue1 ).to.equals( 'bl1' );
		expect( match.blue2 ).to.equals( 'bl2' );
	}
} );