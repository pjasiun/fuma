'use strict';

const fs = require( 'fs' );

class Storage {
	constructor( fileName, initialData ) {
		this.fileName = fileName;
		this.data = initialData
	}

	save() {
		return new Promise( ( resolve, reject ) => {
			fs.writeFile( __dirname + '/' + this.fileName, JSON.stringify( this.data ), 'utf8', ( error ) => {
				if ( error ) {
					return reject( error );
				}

				resolve();
			} );
		} )
	}
}

class StorageRepository {
	/**
	 * @param {String} location Location of repositories
	 */
	constructor( location ) {
		// TODO: node6 add default parameter
		if ( !location ) {
			location = '../data/';
		}

		this._location = location;
		this._storageRepository = {};
	}

	createStorage( name, initialState ) {
		// TODO: node6 add default parameter
		if ( !initialState ) {
			initialState = {}
		}

		const fileName = this._location + name + '.json';

		let data;

		try {
			data = require( fileName );
		} catch ( err ) {
			data = initialState;
		}

		const storage = new Storage( fileName, data );

		this._storageRepository[ name ] = storage;

		return storage;
	}

	hasStorage( name ) {
		return !!this._storageRepository[ name ];
	}

	getStorage( name ) {
		return this._storageRepository[ name ];
	}
}

module.exports = StorageRepository;
