'use strict';

class Aliases {
	constructor( storage ) {
		this.storage = storage;
	}

	getValue( alias ) {
		return this.storage.data[ alias ];
	}

	set( alias, value ) {
		this.storage.data[ alias ] = value;
		this.storage.save();
	}

	delete( alias ) {
		delete this.storage.data[ alias ];
		this.storage.save();
	}

	*[ Symbol.iterator ]() {
		for ( let alias in this.storage.data ) {
			yield alias;
		}
	}

	resolve( text ) {
		for ( let alias of this ) {
			text = text.replace( new RegExp( alias, 'g' ), this.getValue( alias ) );
		}

		return text;
	}
}

module.exports = Aliases;
