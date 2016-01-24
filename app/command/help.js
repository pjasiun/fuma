'use strict';

class Result {
	constructor( context ) {
		this.context = context;
	}

	handleRequest( request ) {
		if ( request.text != 'help' ) {
			return;
		}

		return {
			'response_type': 'ephemeral',
			'text': 'Here is a list of available commands:\n' +
					'```' + request.command + ' help - help page``` :P',
		};
	}
}

module.exports = Result;