'use strict';

const sendRequest = require( 'request' );
const rank = require( '../model/rank' );

const registrationRegExp = /^(\+|-)\s*((\s*@[\S]+)*)$/;

class Registration {
	constructor( context ) {
		this.context = context;
		this.registered = [];
	}

	handleRequest( request ) {
		const registered = this.registered;
		const registrationValues = registrationRegExp.exec( request.text );

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
			registered.push( user );

			const playersCount = registered.length % 4;

			if ( playersCount ) {
				asyncReponse( 'A new player joined the next match! ' +
					'Waiting for the next *' + ( 4 - playersCount ) + '*!' );
			} else {
				const players = registered.splice( -4 );
				players.sort( ( playerA, playerB ) => rank.getPlayer( playerA ).score - rank.getPlayer( playerB ).score );
				const expected = rank.getExpected( players[ 0 ], players[ 3 ], players[ 1 ], players[ 2 ] );

				asyncReponse( ':fire: @' + players[ 0 ] + ' @' + players[ 3 ] +
					' (' + expected.red + ' : ' + expected.blue + ')' +
					' @' + players[ 1 ] + ' @' + players[ 2 ] );
			}

			if ( registered > 20 ) {
				registered.splice( 0, 4 );
			}
		}

		function remove( user ) {
			const index = registered.lastIndexOf( user );

			if ( index > -1 ) {
				registered.splice( index, 1 );

				let players = registered.length % 4;

				asyncReponse( 'User removed from the match. :chicken: ' +
					'Now we need ' + ( 4 - players ) + ' players. ' );
			}
		}

		function asyncReponse( text ) {
			sendRequest( {
				uri: request.response_url,
				method: 'POST',
				json: {
					'response_type': 'in_channel',
					'text': text
				}
			} );
		}
	}
}

module.exports = Registration;