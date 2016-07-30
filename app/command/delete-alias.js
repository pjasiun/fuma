'use strict';

const commandRegExp = /^delete alias\s+([A-Z]*)$/;

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

		this.context.aliases.delete( alias );

		return {
			'text': 'Alias \"' + alias + '\" deleted.',
			'response_type': 'in_channel'
		};
	}
}

module.exports = DeleteAlias;
