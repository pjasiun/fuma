'use strict';

const registrationRegExp = /^(\+|-)\s*((\s*@[\S]+)*)$/;

class Registration {
	constructor( context ) {
		this.context = context;
		this.registered = [];
	}

	handleRequest( request, asyncResponse ) {
		const registered = this.registered;
		const registrationValues = registrationRegExp.exec( request.resolvedText );
		const context = this.context;

		if ( !registrationValues ) {
			return null;
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

		return {
			'response_type': 'ephemeral',
			'text': ( users.map( user => '@' + user ).join( ', ' ) ) +
			' have been ' +
			( isAdd ? 'added to' : 'removed from' ) +
			' the next match.'
		};

		function add( user ) {
			// Add the player only if he/she is not registered already.
			// We could return if user in in registered pool already but it could be abused to check if someone else is already registered.
			if ( registered.indexOf( user ) !== -1 ) {
				asyncResponse( request.response_url, 'Oops! Some users already registered and will not be re-added!', 'ephemeral' );
				return;
			}

			registered.push( user );

			const playersCount = registered.length % 4;

			if ( playersCount ) {
				asyncResponse( request.response_url, 'A new player joined the next match! ' +
					'Waiting for the next *' + ( 4 - playersCount ) + '*!' );
			} else {
				const players = registered.splice( -4 );
				players.sort( ( playerA, playerB ) => context.rank.getPlayer( playerA ).score - context.rank.getPlayer( playerB ).score );
				const expected = context.rank.getExpected( players[ 0 ], players[ 3 ], players[ 1 ], players[ 2 ] );

				asyncResponse( request.response_url, ':fire: @' + players[ 0 ] + ' @' + players[ 3 ] +
					' (' + expected.red + ' : ' + expected.blue + ')' +
					' @' + players[ 1 ] + ' @' + players[ 2 ] );
			}
		}

		function remove( user ) {
			const index = registered.lastIndexOf( user );

			if ( index > -1 ) {
				registered.splice( index, 1 );

				let players = registered.length % 4;

				asyncResponse( request.response_url, 'User removed from the match. :chicken: ' +
					'Now we need ' + ( 4 - players ) + ' players.' );
			}
		}
	}
}

module.exports = Registration;
