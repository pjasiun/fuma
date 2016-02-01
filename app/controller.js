'use strict';

const matchPublic = /^\s*public\s*(.*)$/;

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
		const values = matchPublic.exec( request.text );
		let isPublic = false;

		if ( values ) {
			request.text = values[ 1 ];
			isPublic = true;
		}

		for ( let command of this.commands ) {
			const response = command.handleRequest( request );

			if ( response ) {
				if ( isPublic ) {
					response.response_type = 'in_channel';
				}

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