'use strict';

class Controller {
	constructor() {
		this.commands = [];
	}

	addCommand( name ) {
		const Command  = require( './command/' + name );
		const instance = new Command( this );
		this.commands.push( instance );
	}

	handleRequest( request ) {
		for ( let command of this.commands ) {
			const response = command.handleRequest( request );

			if ( response ) {
				return response;
			}
		}

		return {
			'text': 'Incorrect command.\n' +
					'Use `' + request.command + ' help` for help.'
		};
	}
}

module.exports = Controller;