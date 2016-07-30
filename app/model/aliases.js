'use strict';

class Aliases {
	constructor( storage ) {
		this.data = storage.data;
		this.save = storage.save;
	}

	getValue( alias ) {
		return this.data[ alias ];
	}

	set( alias, value ) {
		this.data[ alias ] = value;
		this.save();
	}

	delete( alias ) {
		delete this.data[ alias ];
		this.save();
	}

	*[ Symbol.iterator ]() {
		for ( let alias in this.data ) {
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
