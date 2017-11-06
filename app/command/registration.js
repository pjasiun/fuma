'use strict';

const registrationRegExp = /^(\+|-)\s*((\s*@[\S]+)*)$/;

const RED_PLAYERS = ':red_circle:';
const BLUE_PLAYERS = ':large_blue_circle:';
const RANDOM_INDICATOR = ':slot_machine:';

class Registration {
	constructor( context, config ) {
		// Default time to live is 8 hrs
		this.timeToLive = config.timeToLive ? config.timeToLive : 8 * 60 * 60 * 1000;
		this.context = context;
		this.registered = [];
		this.randomize = !!config.randomize;
		this.randomizeFactor = config.randomizeFactor;
	}

	handleRequest( request, asyncResponse ) {
		if ( this.cleanRegistered() ) {
			asyncResponse( request.response_url, 'Old users were removed from queue.' );
		}

		const registered = this.registered;
		const registrationValues = registrationRegExp.exec( request.resolvedText );
		const context = this.context;

		if ( !registrationValues ) {
			return;
		}

		const users = registrationValues[ 2 ].split( '@' )
			.filter( user => user.length )
			.map( ( user ) => user.trim() );

		if ( !users.length ) {
			users.push( request.user_name );
		}

		const isAdd = registrationValues[ 1 ] == '+';

		const isRandomized = this.randomize && Math.random() <= this.randomizeFactor;

		for ( let user of users ) {
			if ( isAdd ) {
				add( user );
			} else {
				remove( user );
			}
		}

		const usersMessage = ( users.map( user => '@' + user ).join( ', ' ) );

		return {
			'response_type': 'ephemeral',
			'text': `${usersMessage} have been ${( isAdd ? 'added to' : 'removed from' )} the next match.`
		};

		function add( user ) {
			// Add the player only if he/she is not registered already.
			// We could return if user in in registered pool already but it could be abused to check if someone else is already registered.
			if ( hasUser( registered, user ) ) {
				asyncResponse( request.response_url, 'Oops! Some users already registered and will not be re-added!', 'ephemeral' );
				return;
			}

			registered.push( { name: user, date: new Date() } );

			const playersCount = registered.length % 4;

			if ( playersCount ) {
				asyncResponse( request.response_url, 'A new player joined the next match! ' +
					'Waiting for the next *' + ( 4 - playersCount ) + '*!' );
			} else {
				const players = registered.splice( -4 );

				if ( isRandomized ) {
					shuffle( players );
				} else {
					players.sort( ( playerA, playerB ) => {
						return context.rank.getPlayer( playerA.name ).score - context.rank.getPlayer( playerB.name ).score;
					} );
				}

				const expected = context.rank.getExpected( players[ 0 ].name, players[ 3 ].name, players[ 1 ].name, players[ 2 ].name );

				const isTeamARed = Math.random() >= 0.5;
				const teamAColor = isTeamARed ? RED_PLAYERS : BLUE_PLAYERS;
				const teamBColor = isTeamARed ? BLUE_PLAYERS : RED_PLAYERS;

				const teamA = `@${players[ 0 ].name} @${players[ 3 ].name}`;
				const teamB = `@${players[ 1 ].name} @${players[ 2 ].name}`;
				const expectedString = `(${expected.red} : ${expected.blue})`;

				const isRandomizedMessage = isRandomized ? ' ' + RANDOM_INDICATOR : '';

				asyncResponse( request.response_url, `:fire: ${teamA} ${teamAColor} ${expectedString} ${teamBColor} ${teamB}${isRandomizedMessage}` );
			}
		}

		function remove( user ) {
			const index = registered.map( ( registeredUser ) => registeredUser.name ).lastIndexOf( user );

			if ( index > -1 ) {
				registered.splice( index, 1 );

				const playersCount = registered.length % 4;

				asyncResponse( request.response_url, 'User removed from the match. :chicken: ' +
					'Now we need ' + ( 4 - playersCount ) + ' players.' );
			}
		}

		function hasUser( registered, user ) {
			return registered.map( ( registeredUser ) => registeredUser.name ).indexOf( user ) !== -1;
		}
	}

	cleanRegistered() {
		const now = new Date();

		const registeredBefore = this.registered.length;

		this.registered = this.registered.filter( ( registeredUser ) => {
			return ( now.getTime() - registeredUser.date.getTime() ) < this.timeToLive;
		} );

		return this.registered.length !== registeredBefore;
	}
}

/**
 * @link http://stackoverflow.com/a/2450976
 *
 * @param array
 * @returns {*}
 */
function shuffle( array ) {
	var currentIndex = array.length, temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while ( 0 !== currentIndex ) {

		// Pick a remaining element...
		randomIndex = Math.floor( Math.random() * currentIndex );
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[ currentIndex ];
		array[ currentIndex ] = array[ randomIndex ];
		array[ randomIndex ] = temporaryValue;
	}

	return array;
}

module.exports = Registration;
