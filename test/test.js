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
			var count = 0, timeout, interval, stopAt = 2;

			if (!pass) {
				return cb('Event not emitted =\'(');
			}

			EventHub.on('multiple', function multipleListener(data) {
				if (!data) {
					clearTimeout(timeout);
					return cb('Multiple event fired, but no data =\'(');
				}

				count += 1;

				if (count === stopAt) {
					EventHub.removeListener('multiple', multipleListener);
				} else if (count > stopAt) {
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
				if (count !== stopAt) {
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
			var count = 0, timeout, interval, stopAt = 2;

			if (!pass) {
				return cb('Event not emitted =\'(');
			}

			EventHub.on(emitterName, 'multiple', function multipleListener(data) {
				if (!data) {
					clearTimeout(timeout);
					return cb('Multiple event fired, but no data =\'(');
				}

				count += 1;

				if (count === stopAt) {
					EventHub.removeListener(emitterName, 'multiple', multipleListener);
				} else if (count > stopAt) {
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
				if (count !== stopAt) {
					return cb('Event not fired the correct number of times =\'(');
				}

				cb();
			}, 50);
		}, 10);
	}

	function testExtended(cb) {
		var listener1Called = false,
			listener2Called = false;

		function listener1() {
			listener1Called = true;
		}
		function listener2() {
			listener2Called = true;
		}

		console.log('Testing multiple listeners');

		EventHub.once('once-multiple', listener1);
		EventHub.once('once-multiple', listener2);

		EventHub.emit('once-multiple');

		setTimeout(function () {
			var stopAt = 2;

			function listener1() {
				listener1Called += 1;
			}
			function listener2() {
				listener2Called += 1;
			}

			if (!listener1Called || !listener2Called) {
				return cb('Both listeners were not called =\'(');
			}

			if (EventHub.listeners('once-multiple').length > 0) {
				return cb('Both listeners called, but not removed');
			}

			listener1Called = 0;
			listener2Called = 0;

			EventHub.on('on-multiple', listener1);
			EventHub.on('on-multiple', listener2);

			EventHub.emit('on-multiple');
			EventHub.emit('on-multiple');

			setTimeout(function () {
				if (listener1Called !== stopAt || listener2Called !== stopAt) {
					return cb('Events not called the correct number of times');
				}

				if (EventHub.listeners('on-multiple').length !== 2) {
					return cb('Incorrect number of listeners');
				}

				EventHub.removeAllListeners('on-multiple');

				if (EventHub.listeners('on-multiple').length > 0) {
					return cb('Listeners not removed');
				}

				cb();
			}, 50);
		}, 50);
	}

	function testExtendedResource(cb) {
		var listener1Called = false,
			listener2Called = false,
			emitter = new EventEmitter(),
			emitterName = 'multiple';

		function listener1() {
			listener1Called = true;
		}
		function listener2() {
			listener2Called = true;
		}

		console.log('Testing multiple listeners on a resource');

		EventHub.register(emitterName, emitter);

		EventHub.once(emitterName, 'once-multiple', listener1);
		EventHub.once(emitterName, 'once-multiple', listener2);

		emitter.emit('once-multiple');

		setTimeout(function () {
			var stopAt = 2;

			function listener1() {
				listener1Called += 1;
			}
			function listener2() {
				listener2Called += 1;
			}

			if (!listener1Called || !listener2Called) {
				return cb('Both listeners were not called =\'(');
			}

			if (EventHub.listeners('once-multiple').length > 0) {
				return cb('Both listeners called, but not removed');
			}

			listener1Called = 0;
			listener2Called = 0;

			EventHub.on(emitterName, 'on-multiple', listener1);
			EventHub.on(emitterName, 'on-multiple', listener2);

			emitter.emit('on-multiple');
			emitter.emit('on-multiple');

			setTimeout(function () {
				if (listener1Called !== stopAt || listener2Called !== stopAt) {
					return cb('Events not called the correct number of times');
				}

				if (EventHub.listeners(emitterName, 'on-multiple').length !== 2) {
					return cb('Incorrect number of listeners');
				}

				EventHub.removeAllListeners(emitterName, 'on-multiple');

				if (EventHub.listeners(emitterName, 'on-multiple').length > 0) {
					return cb('Listeners not removed');
				}

				cb();
			}, 50);
		}, 50);
	}
/*
	function testBad(cb) {
		console.log('Testing bad values');
		cb();
	}
*/

	tests = [testBasic, testBasicResources, testExtended, testExtendedResource/*, testBad*/];

	forEachAsync(tests, function (next, fn) {
		fn(function (err) {
			if (err) {
				console.log('Test failed:', err);
				fail = true;
			} else {
				console.log('Test passed =D');
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
