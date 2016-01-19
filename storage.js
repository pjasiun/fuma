'use strict';

const fs = require( 'fs' );

 function storage( name, def ) {
	const fileName = './' + name + '.json';
	let value;

	try {
		value = require( fileName );
	} catch ( err ) {
		value = def;
	}

	value.save = () => {
		fs.writeFile( fileName, JSON.stringify( value ), 'utf8' );
	}

	return value;
}

module.exports = storage;