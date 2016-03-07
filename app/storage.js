'use strict';

const fs = require( 'fs' );

 function storage( name, def ) {
	const fileName = '../data/' + name + '.json';
	let value;

	try {
		value = require( fileName );
	} catch( err ) {
		value = def;
	}

	value.save = () => {
		fs.writeFile( __dirname + '/' + fileName, JSON.stringify( value ), 'utf8' );
	};

	return value;
}

module.exports = storage;
