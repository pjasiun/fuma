'use strict';

const sendRequest = require( 'request' );

const matchPublic = /^\s*public\s*(.*)$/;

const aliases = require( './model/aliases' );

class Controller {
	constructor( storageRepository, persistentModels ) {
		this.commands = [];
		this.storageRepository = storageRepository;

		for ( let model of Object.keys( persistentModels ) ) {
			this[ model ] = persistentModels[ model ];
		}
	}

	addCommand( name ) {
		const Command = require( './command/' + name );
		const instance = new Command( this );
		this.commands.push( instance );
	}

	handleRequest( request ) {
		request.resolvedText = aliases.resolve( request.text || '' );
		const values = matchPublic.exec( request.text );
		let isPublic = false;

		if ( values ) {
			request.text = values[ 1 ];
			isPublic = true;
		}

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
