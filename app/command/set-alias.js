'use strict';

const commandRegExp = /^set alias\s+([A-Z]*)\s+(.*)$/;

class SetAlias {
	constructor( context ) {
		this.context = context;
	}

	handleRequest( request ) {
		const values = commandRegExp.exec( request.text );

		if ( !values ) {
			return null;
		}

		const alias = values[ 1 ];
		const value = values[ 2 ];

		this.context.aliases.set( alias, value );

		return {
			'text': 'Alias \"' + alias + '\" added.',
			'response_type': 'in_channel'
		};
	}
}

module.exports = SetAlias;
