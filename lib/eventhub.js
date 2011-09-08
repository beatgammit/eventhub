(function () {
	'use strict';

    var events,
        EventEmitter,
        generalPurpose = '_eventHub';

    try {
        events = require('events');
    } catch (e) {
        events = require('events.node');
    }

	EventEmitter = events.EventEmitter;

	/*
	 * No dependencies, generic event hub.
	 * This allows event emitters to be managed globally, without having a global.
	 */
	function EventHub() {
		this.emitters = {};
		this.emitters[generalPurpose] = new EventEmitter();
	}

	/*
	 * Listens to a resource for a specified event.
	 * If no resource is specified (null, or left out), global is assumed
	 *
	 * addListener([resource,] event, cb, [once=false])
	 *
	 * @param resource- the resource to listen to (optional)
	 * @param event- the event to listen to (required)
	 * @param cb- callback to call when the event has fired (required)
	 * @param once- true if the callback should be called only once; (optional)
	 * @return false if resource doesn't exist or true if success
	 */
	EventHub.prototype.addListener = function (resource, event, cb, once) {
		if (typeof event === 'function') {
			once = cb;
			cb = event;
			event = resource;
			resource = generalPurpose;
		}

		if (!resource) {
			resource = generalPurpose;
		}

		if (!this.emitters[resource]) {
			return false;
		}

		if (once) {
			this.emitters[resource].once(event, cb);
		} else {
			this.emitters[resource].on(event, cb);
		}

		return true;
	};
	EventHub.prototype.on = EventHub.prototype.addListener;

	EventHub.prototype.once = function (resource, event, cb) {
		if (typeof event === 'function') {
			cb = event;
			event = resource;
			resource = generalPurpose;
		}

		if (!resource) {
			resource = generalPurpose;
		}

		return this.addListener(resource, event, cb, true);
	};

	/*
	 * Remove a listener. This is only valid for permanent listeners.
	 * 
	 * removeListener([resource,] event, listener)
	 *
	 * @param resource- resource to remove listener from; defaults to the global listener
	 * @param event- event listened to
	 * @param listener- callback given to addListener
	 * @return false if no resource exists, true otherwise
	 */
	EventHub.prototype.removeListener = function (resource, event, listener) {
		if (arguments.length < 3) {
			listener = event;
			event = resource;
			resource = generalPurpose;
		}

		if (!resource) {
			resource = generalPurpose;
		}

		if (!this.emitters[resource]) {
			return false;
		}

		this.emitters[resource].removeListener(event, listener);
		return true;
	};

	EventHub.prototype.removeAllListeners = function (resource, event) {
		if (!event) {
			event = resource;
			resource = generalPurpose;
		}

		if (!resource) {
			resource = generalPurpose;
		}

		this.emitters[resource].removeAllListeners(event);
	};

	EventHub.prototype.setMaxListeners = function (resource, n) {
		if (arguments.length > 1) {
			n = resource;
			resource = generalPurpose;
		}

		if (!resource) {
			resource = generalPurpose;
		}

		this.emitters[resource].setMaxListeners(n);
	};

	EventHub.prototype.listeners = function (resource, event) {
		if (!event) {
			event = resource;
			resource = generalPurpose;
		}

		if (!resource) {
			resource = generalPurpose;
		}

		return this.emitters[resource].listeners(event);
	};

	/*
	 * Registers an EventEmitter.
	 * 
	 * @param resource- the resource being watched (string)
	 * @param emitter- an EventEmitter that can accept events
	 * @return false if the resource exists or true if success
	 */
	EventHub.prototype.register = function (resource, emitter) {
		if (this.emitters[resource]) {
			return false;
		}

		this.emitters[resource] = emitter;

		this.emit('newResource', resource, emitter);
		return true;
	};

	EventHub.prototype.remove = function (resource) {
		if (this.emitters[resource]) {
			delete this.emitters[resource];
		}
	};

	/*
	 * Emits an general event.
	 */
	EventHub.prototype.emit = function () {
		var emitter = this.emitters[generalPurpose];
		
		emitter.emit.apply(emitter, arguments);
	};

	EventHub.prototype.get = function (resource) {
		if (!resource) {
			resource = generalPurpose;
		}

		return this.emitters[resource];
	};

	module.exports = new EventHub();
}());
