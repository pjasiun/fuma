const expect = require( 'chai' ).expect;

const Stats = require( '../../app/model/stats' );
const Rank = require( '../../app/model/rank' );
const History = require( '../../app/model/history' );

describe( 'Stats model', () => {
	'use strict';

	const historyStorage = { data: [] };
	const rank = new Rank( new History( historyStorage ) );
	const stats = new Stats( rank );

	beforeEach( () => historyStorage.data.length = 0 );

	describe( 'rankHistory', () => {
		it( 'should return empty stats for new player', () => {
			expect( stats.getPlayerStats( 'a' ) )
				.to.have.property( 'rankHistory' )
				.that.deep.equal( [] );
		} );

		it( 'should include only player\'s games', () => {
			historyStorage.data.push( [ '2016 01 01 12:01', '@a @b 10 : 0 @c @d' ] );
			historyStorage.data.push( [ '2016 01 01 12:02', '@a @b 10 : 0 @c @d' ] );
			historyStorage.data.push( [ '2016 01 01 12:03', '@z @b 10 : 0 @c @d' ] );
			historyStorage.data.push( [ '2016 01 01 12:04', '@a @b 10 : 0 @c @d' ] );

			expect( stats.getPlayerStats( 'a' ) )
				.to.have.property( 'rankHistory' )
				.that.deep.equal( [
				[ new Date( '2016 01 01 12:01' ), 2020 ],
				[ new Date( '2016 01 01 12:02' ), 2038 ],
				[ new Date( '2016 01 01 12:04' ), 2052 ]
			] );
		} );
	} );

	describe( 'lastGames', () => {
		it( 'should return empty stats for new player', () => {
			expect( stats.getPlayerStats( 'a' ) )
				.to.have.property( 'lastGames' )
				.that.deep.equal( [] );
		} );

		it( 'should include only player\'s games', () => {
			historyStorage.data.push( [ '2016 01 01 12:01', '@a @b 10 : 0 @c @d' ] );
			historyStorage.data.push( [ '2016 01 01 12:02', '@a @b 10 : 0 @c @d' ] );
			historyStorage.data.push( [ '2016 01 01 12:03', '@z @b 10 : 0 @c @d' ] );
			historyStorage.data.push( [ '2016 01 01 12:04', '@a @b 10 : 0 @c @d' ] );
			historyStorage.data.push( [ '2016 01 01 12:05', '@a @b 0 : 10 @c @d' ] );

			expect( stats.getPlayerStats( 'a' ) )
				.to.have.property( 'lastGames' )
				.that.deep.equal( [
				{ date: new Date( '2016 01 01 12:05' ), rankChange: -27, blue: 'a b', red: 'c d', 'score': '10 : 0', isWin: false },
				{ date: new Date( '2016 01 01 12:04' ), rankChange: 14, blue: 'c d', red: 'a b', 'score': '10 : 0', isWin: true },
				{ date: new Date( '2016 01 01 12:02' ), rankChange: 18, blue: 'c d', red: 'a b', 'score': '10 : 0', isWin: true },
				{ date: new Date( '2016 01 01 12:01' ), rankChange: 20, blue: 'c d', red: 'a b', 'score': '10 : 0', isWin: true }
			] );
		} );
	} );

	describe( 'records', () => {
		it( 'should return empty stats for new player', () => {
			expect( stats.getPlayerStats( 'a' ) )
				.to.have.property( 'records' )
				.that.deep.equal( {
				gainRankOnLost: 0,
				gainRankOnLostMax: 0,
				humiliations: { lost: 0, wins: 0 },
				looses: 0,
				lostRankOnWin: 0,
				lostRankOnWinMax: 0,
				noRankChange: 0,
				pointsGain: 0,
				pointsGainMatch: false,
				pointsLost: 0,
				pointsLostMatch: false,
				rankMax: 2000,
				rankMin: 2000,
				seriesLooses: 0,
				seriesWins: 0,
				wins: 0
			} );
		} );

		it( 'should count wins and looses', () => {
			historyStorage.data.push( [ '2016 01 01 12:01', '@a @b 10 : 8 @c @d' ] );
			historyStorage.data.push( [ '2016 01 01 12:02', '@a @b 10 : 8 @c @d' ] );
			historyStorage.data.push( [ '2016 01 01 12:03', '@z @b 10 : 8 @c @d' ] );
			historyStorage.data.push( [ '2016 01 01 12:04', '@a @b 10 : 0 @c @d' ] );
			historyStorage.data.push( [ '2016 01 01 12:05', '@a @b 0 : 10 @c @d' ] );

			expect( stats.getPlayerStats( 'a' ).records ).to.deep.equal( {
				gainRankOnLost: 0,
				gainRankOnLostMax: 0,
				humiliations: { lost: 1, wins: 1 },
				looses: 1,
				lostRankOnWin: 0,
				lostRankOnWinMax: 0,
				noRankChange: 0,
				pointsGain: 19,
				pointsGainMatch: {
					'blue': 'c d',
					'date': new Date( [ '2016 01 01 12:04' ] ),
					'isWin': true,
					'rankChange': 19,
					'red': 'a b',
					'score': '10 : 0'
				},
				pointsLost: -23,
				pointsLostMatch: {
					'blue': 'a b',
					'date': new Date( [ '2016 01 01 12:05' ] ),
					'isWin': false,
					'rankChange': -23,
					'red': 'c d',
					'score': '10 : 0'
				},
				rankMax: 2023,
				rankMin: 2000,
				seriesLooses: 1,
				seriesWins: 3,
				wins: 3
			} );

			historyStorage.data.push( [ '2016 01 01 12:05', '@a @b 9 : 10 @c @d' ] );

			expect( stats.getPlayerStats( 'a' ).records ).to.deep.equal( {
				gainRankOnLost: 0,
				gainRankOnLostMax: 0,
				humiliations: { lost: 1, wins: 1 },
				looses: 2,
				lostRankOnWin: 0,
				lostRankOnWinMax: 0,
				noRankChange: 0,
				pointsGain: 19,
				pointsGainMatch: {
					'blue': 'c d',
					'date': new Date( [ '2016 01 01 12:04' ] ),
					'isWin': true,
					'rankChange': 19,
					'red': 'a b',
					'score': '10 : 0'
				},
				pointsLost: -23,
				pointsLostMatch: {
					'blue': 'a b',
					'date': new Date( [ '2016 01 01 12:05' ] ),
					'isWin': false,
					'rankChange': -23,
					'red': 'c d',
					'score': '10 : 0'
				},
				rankMax: 2023,
				rankMin: 1999,
				seriesLooses: 2,
				seriesWins: 3,
				wins: 3
			} );

			// Prepare rank for loose-win situation
			historyStorage.data.push( [ '2016 01 01 12:05', '@a @b 10 : 1 @c @d' ] );
			historyStorage.data.push( [ '2016 01 01 12:05', '@a @b 10 : 1 @c @d' ] );

			// Loose-win for @c & @d
			historyStorage.data.push( [ '2016 01 01 12:05', '@a @b 10 : 8 @c @d' ] );

			expect( stats.getPlayerStats( 'a' ).records ).to.deep.equal( {
				gainRankOnLost: 0,
				gainRankOnLostMax: 0,
				humiliations: { lost: 1, wins: 1 },
				looses: 2,
				lostRankOnWin: 1,
				lostRankOnWinMax: -1,
				noRankChange: 0,
				pointsGain: 19,
				pointsGainMatch: {
					'blue': 'c d',
					'date': new Date( [ '2016 01 01 12:04' ] ),
					'isWin': true,
					'rankChange': 19,
					'red': 'a b',
					'score': '10 : 0'
				},
				pointsLost: -23,
				pointsLostMatch: {
					'blue': 'a b',
					'date': new Date( [ '2016 01 01 12:05' ] ),
					'isWin': false,
					'rankChange': -23,
					'red': 'c d',
					'score': '10 : 0'
				},
				rankMax: 2029,
				rankMin: 1999,
				seriesLooses: 2,
				seriesWins: 3,
				wins: 6
			} );

			expect( stats.getPlayerStats( 'c' ).records ).to.deep.equal( {
				gainRankOnLost: 1,
				gainRankOnLostMax: 1,
				humiliations: { lost: 1, wins: 1 },
				looses: 7,
				lostRankOnWin: 0,
				lostRankOnWinMax: 0,
				noRankChange: 0,
				pointsGain: 23,
				pointsGainMatch: {
					'blue': 'a b',
					'date': new Date( [ '2016 01 01 12:05' ] ),
					'isWin': true,
					'rankChange': 23,
					'red': 'c d',
					'score': '10 : 0'
				},
				pointsLost: -19,
				pointsLostMatch: {
					'blue': 'c d',
					'date': new Date( [ '2016 01 01 12:04' ] ),
					'isWin': false,
					'rankChange': -19,
					'red': 'a b',
					'score': '10 : 0'
				},
				rankMax: 2000,
				rankMin: 1969,
				seriesLooses: 4,
				seriesWins: 2,
				wins: 2
			} );

			rank.reload();
			console.log( rank.getExpected( 'a', 'b', 'c', 'd' ) );

			// 0 points game (expected: 10 : 7.12)
			historyStorage.data.push( [ '2016 01 01 12:05', '@a @b 10 : 7 @c @d' ] );


			expect( stats.getPlayerStats( 'a' ).records ).to.deep.equal( {
				gainRankOnLost: 0,
				gainRankOnLostMax: 0,
				humiliations: { lost: 1, wins: 1 },
				looses: 2,
				lostRankOnWin: 1,
				lostRankOnWinMax: -1,
				noRankChange: 1,
				pointsGain: 19,
				pointsGainMatch: {
					'blue': 'c d',
					'date': new Date( [ '2016 01 01 12:04' ] ),
					'isWin': true,
					'rankChange': 19,
					'red': 'a b',
					'score': '10 : 0'
				},
				pointsLost: -23,
				pointsLostMatch: {
					'blue': 'a b',
					'date': new Date( [ '2016 01 01 12:05' ] ),
					'isWin': false,
					'rankChange': -23,
					'red': 'c d',
					'score': '10 : 0'
				},
				rankMax: 2029,
				rankMin: 1999,
				seriesLooses: 2,
				seriesWins: 4,
				wins: 7
			} );
		} );
	} );
} );
