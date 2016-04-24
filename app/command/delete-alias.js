'use strict';

const commandRegExp = /^delete alias\s+([A-Z]*)$/;

const aliases = require( '../model/aliases' );

class DeleteAlias {
	constructor( context ) {
		this.context = context;
	}

	handleRequest( request ) {
		const values = commandRegExp.exec( request.text );

		if ( !values ) {
			return null;
		}

		const alias = values[ 1 ];

		aliases.delete( alias );

		return {
			'text': 'Alias \"' + alias + '\" deleted.',
			'response_type': 'in_channel'
		};
	}
}

module.exports = DeleteAlias;