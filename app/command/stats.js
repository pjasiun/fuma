'use strict';

class Stats {
	constructor( context ) {
		this.context = context;
	}

	handleRequest( request ) {
		if ( request.resolvedText != 'stats' ) {
			return;
		}

		return {
			'text': 'View stats here: http://' + this.context.config.host + ':' + this.context.config.port + '/stats'
		};
	}
}

module.exports = Stats;
