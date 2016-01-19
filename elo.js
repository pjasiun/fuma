'use strict';

const elo = require( 'elo-rank' )( 40 );

let playerA = 2000;
let playerB = 2000;

let expectedScoreA = elo.getExpected( playerA, playerB );
let expectedScoreB = elo.getExpected( playerB, playerA );

console.log( 'expectedScoreA: ' + expectedScoreA );
console.log( 'expectedScoreB: ' + expectedScoreB );

for ( let i = 0; i < 10; i++ ) {
	playerA = elo.updateRating( expectedScoreA, 10 / 17, playerA );
	playerB = elo.updateRating( expectedScoreB, 7 / 17, playerB );

	console.log( 'playerA rank: ' + playerA );
	console.log( 'playerB rank: ' + playerB );

	expectedScoreA = elo.getExpected( playerA, playerB );
	expectedScoreB = elo.getExpected( playerB, playerA );

	console.log( 'expectedScoreA: ' + 10 );
	console.log( 'expectedScoreB: ' + ( expectedScoreB / expectedScoreA ) * 10 );
}
