'use strict';

const registrationRegExp = /^(\+|-)\s*((\s*@[\S]+)*)$/;

class Registration {
	constructor( context, timeToLive ) {
		// Default time to live is 8 hrs
		this.timeToLive = timeToLive ? timeToLive : 8 * 60 * 60 * 1000;
		this.context = context;
		this.registered = [];
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
				players.sort( ( playerA, playerB ) => context.rank.getPlayer( playerA.name ).score -
				context.rank.getPlayer( playerB.name ).score );
				const expected = context.rank.getExpected( players[ 0 ], players[ 3 ], players[ 1 ], players[ 2 ] );

				asyncResponse( request.response_url, ':fire: @' + players[ 0 ].name + ' @' + players[ 3 ].name +
					' (' + expected.red + ' : ' + expected.blue + ')' +
					' @' + players[ 1 ].name + ' @' + players[ 2 ].name );
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

module.exports = Registration;
