const fs = require( 'fs' );

const expect = require( 'chai' ).expect;

const Controller = require( '../app/controller' );

describe( 'Controller', () => {
	'use strict';

	describe( 'handleRequest', () => {
		it( 'should pass resolved text to command', () => {
			const controller = new Controller( {}, { aliases: { resolve: ( text ) => text } } );

			controller.addCommand( {
				handleRequest: ( request ) => {
					expect( request.resolvedText ).to.equal( 'lol' );
				}
			} );

			controller.handleRequest( { text: 'lol' } );
		} );

		it( 'should remove public from resolved text', () => {
			const controller = new Controller( {}, { aliases: { resolve: ( text ) => text } } );

			controller.addCommand( {
				handleRequest: ( request ) => {
					expect( request.resolvedText ).to.equal( 'lol' );
				}
			} );

			controller.handleRequest( { text: 'public lol' } );
		} );
	} );
} );
