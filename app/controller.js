'use strict';

const sendRequest = require( 'request' );

const matchPublic = /^\s*public\s*(.*)$/;

class Controller {
	constructor( storageRepository, persistentModels ) {
		this.commands = [];
		this.storageRepository = storageRepository;

		for ( let model of Object.keys( persistentModels ) ) {
			this[ model ] = persistentModels[ model ];
		}
	}

	addCommand( command ) {
		this.commands.push( command );
	}

	handleRequest( request ) {
		let isPublic = false;

		const values = matchPublic.exec( request.text );

		if ( values ) {
			request.text = values[ 1 ];
			isPublic = true;
		}

		request.resolvedText = this.aliases.resolve( request.text || '' );

		for ( let command of this.commands ) {
			const response = command.handleRequest( request, asyncResponse );

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

function asyncResponse( uri, text, type ) {
	if ( !type ) {
		type = 'in_channel'
	}

	sendRequest( {
		uri: uri,
		method: 'POST',
		json: {
			'response_type': type,
			'text': text
		}
	} );
}

module.exports = Controller;
