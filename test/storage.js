const fs = require( 'fs' );

const expect = require( 'chai' ).expect;
const mockery = require( 'mockery' );

const StorageRepository = require( '../app/storage' );

describe( 'StorageRepository', () => {
	'use strict';

	const initialState = { foo: 'bar' };
	const storageName = 'test';

	let repository;

	beforeEach( ( done ) => {
		repository = new StorageRepository();
		fs.unlink( './data/test.json', () => done() )
	} );

	afterEach( ( done ) => fs.unlink( './data/test.json', () => done() ) );

	describe( 'createStorage', () => {
		it( 'should return storage object with save method', () => {
			const storage = repository.createStorage( storageName );

			expect( storage ).to.have.property( 'save' );
		} );

		it( 'should add storage to repository', () => {
			expect( repository.hasStorage( storageName ) ).to.be.false;

			const storage = repository.createStorage( storageName );

			expect( repository.hasStorage( storageName ) ).to.be.true;

			expect( storage ).to.equal( repository.getStorage( storageName ) );
		} );
	} );

	describe( 'storage', () => {
		it( 'should save storage file', ( done ) => {
			const storage = repository.createStorage( storageName, initialState );

			storage.save().then( () => {
				fs.readFile( './data/test.json', ( error, fileBuffer ) => {
					expect( JSON.parse( fileBuffer.toString() ) ).to.deep.equal( initialState );

					done();
				} );
			} );
		} );

		it( 'should read initial data from storage file', ( done ) => {
			const initialFileData = { foo: 'baz' };

			fs.writeFile( './data/test.json', JSON.stringify( initialFileData ), () => {
				const storage = repository.createStorage( storageName, initialState );

				storage.save().then( () => {
					fs.readFile( './data/test.json', ( error, fileBuffer ) => {
						expect( JSON.parse( fileBuffer.toString() ) ).to.deep.equal( initialFileData );

						done();
					} );
				} );
			} );
		} );
	} );
} );
