(function () {
	'use strict';

	var EventHub = require('../lib/eventhub'),
		EventEmitter = require('events').EventEmitter,
		forEachAsync = require('forEachAsync'),
		fail = false,
		tests;

	function testBasic(cb) {
		var timeout, pass;

		console.log('Testing basic EventEmitter functionality');

		EventHub.once('single', function (data) {
			if (!data) {
				clearTimeout(timeout);
				return cb('Single event fired, but no data =\'(');
			}

			pass = true;
		});

		EventHub.emit('single', 'Some data...');
		timeout = setTimeout(function () {
			var count = 0, timeout, interval;

			if (!pass) {
				return cb('Event not emitted =\'(');
			}

			EventHub.on('multiple', function multipleListener(data) {
				if (!data) {
					clearTimeout(timeout);
					return cb('Multiple event fired, but no data =\'(');
				}

				count += 1;

				if (count === 2) {
					EventHub.removeListener('multiple', multipleListener);
				} else if (count > 2) {
					clearTimeout(timeout);
					clearInterval(interval);
					return cb('Too many events fired, which means removeListener didn\'t work =\'(');
				}
			});

			interval = setInterval(function () {
				EventHub.emit('multiple', 'some data');
			}, 10);

			timeout = setTimeout(function () {
				clearInterval(interval);
				if (count !== 2) {
					return cb('Event not fired the correct number of times =\'(');
				}

				cb();
			}, 50);
		}, 10);
	}

	function testBasicResources(cb) {
		var timeout, pass, emitter = new EventEmitter(), emitterName = 'new';

		console.log('Testing basic functionality of resources');

		EventHub.register(emitterName, emitter);
		EventHub.once(emitterName, 'single', function (data) {
			if (!data) {
				clearTimeout(timeout);
				return cb('Single event fired, but no data =\'(');
			}

			pass = true;
		});

		emitter.emit('single', 'Some data...');
		timeout = setTimeout(function () {
			var count = 0, timeout, interval;

			if (!pass) {
				return cb('Event not emitted =\'(');
			}

			EventHub.on(emitterName, 'multiple', function multipleListener(data) {
				if (!data) {
					clearTimeout(timeout);
					return cb('Multiple event fired, but no data =\'(');
				}

				count += 1;

				if (count === 2) {
					EventHub.removeListener(emitterName, 'multiple', multipleListener);
				} else if (count > 2) {
					clearTimeout(timeout);
					clearInterval(interval);
					return cb('Too many events fired, which means removeListener didn\'t work =\'(');
				}
			});

			interval = setInterval(function () {
				emitter.emit('multiple', 'some data');
			}, 10);

			timeout = setTimeout(function () {
				clearInterval(interval);
				if (count !== 2) {
					return cb('Event not fired the correct number of times =\'(');
				}

				cb();
			}, 50);
		}, 10);
	}

/*
	function testExtended(cb) {
		console.log('Testing extended functionality');
		cb();
	}

	function testBad(cb) {
		console.log('Testing bad values');
		cb();
	}
*/

	tests = [testBasic, testBasicResources/*, testExtended, testBad*/];

	forEachAsync(tests, function (next, fn) {
		fn(function (err) {
			if (err) {
				console.log('Test failed:' + err);
				fail = true;
			} else {
				console.log('Test passed =\'D');
			}

			console.log();
			next();
		});
	}).then(function () {
		if (fail) {
			console.log('Tests failed =\'(');
		} else {
			console.log('All tests passed b^.^d');
		}
	});
}());
