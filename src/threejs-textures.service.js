/**!
 * THREEjs Textures Service for
 * THREEjs Angular module implmenting
 * THREEjs https://github.com/mrdoob/three.js/
 * see http://threejs.org by mrdoob
 * @author  Mike Goodstadt  <mikegoodstadt@gmail.com>
 * @version 1.0.0
 */
 
 (function() {
	'use strict';
	angular
		.module('threejs')
		.factory('THREETextures', THREETextures);

	function THREETextures(THREEService, $document, $q, $rootScope) {
		// TODO: check if texture already loaded - add and remove from array
		var textures = {
			loaded: []
		};

		return {
			load: function(filenames) {
				// console.log(filenames);
				
				var self = this;
				var imagesToLoad = []; // push async functions into list for subsequent processing
				angular.forEach(filenames, function(filename, key) {
					var newImage = true;
					for (var i = textures.loaded.length - 1; i >= 0; i--) {
						if (textures.loaded[key] == filename) newImage = false;
					}
					if (newImage) {
						var loadImage = self.add(key, filename);
						imagesToLoad.push(loadImage);
					}
				});
				return $q.all(imagesToLoad)
				.then(function(results) {
					if (results.length > 0) console.log("Images loaded: " + results);
					return window.THREE;
				});
			},
			add: function(textureName, filename) {
				var deferred = $q.defer();

				// Create Manager
				var textureManager = new THREE.LoadingManager();
				textureManager.onProgress = function ( item, loaded, total ) {
					// this gets called after any item has been loaded
					console.log( item, loaded, total );
				};
				textureManager.onLoad = function () {
					// all textures are loaded
					$rootScope.$apply(function() {
						deferred.resolve(filename);
					});
				};

				// Create New Texture
				var newTexture = new THREE.Texture();
				var onProgress = function ( xhr ) {
					if ( xhr.lengthComputable ) {
						var percentComplete = xhr.loaded / xhr.total * 100;
						console.log( Math.round(percentComplete, 2) + '% downloaded' );
					}
				};
				var onError = function ( xhr ) {
				};
				var loader = new THREE.TextureLoader( textureManager );
				loader.load( filename, function ( texture ) {
					newTexture = texture;
					newTexture.name = textureName;
					textures.loaded.push( newTexture );
				}, onProgress, onError );

				return deferred.promise;
			},
			remove: function(filename) {
				angular.forEach(textures.loaded, function(texture, key) {
					if (texture == filename) {
						textures.loaded[key].pop();
						// REMOVE DOM ELEMENT?
						console.log("Removed " + filename + " texture.");
					}
				});
			},
			get: function(textureName) {
				var texture, found;
				if (textureName !== undefined || textureName !== false) {
					for (var i = textures.loaded.length - 1; i >= 0; i--) {
						if (textures.loaded[i].name === textureName) {
							texture = textures.loaded[i];
							found = true;
							// console.log("Texture \"" + textureName + "\" found!");
						}
					}
				}
				if (!found) {
					texture = textures.loaded[0];
					console.log("Texture \"" + textureName + "\" not found: returning \"" + texture.name + ".\"");
				}
				// console.log(texture);
				return texture;

			}
		};
	}
})();