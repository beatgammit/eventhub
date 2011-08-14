TL;DR
=====

Installation
------------

`npm install eventhub`

Basic usage
-----------

**Use global event:**

	var EventHub = require('eventhub');

	EventHub.on('greeting', function (data) {
		console.log(data);
	});

	eventhub.emit('greeting', 'Hello World!');

**Attach event:**

	var EventHub = require('eventhub'),
		EventEmitter = require('events').EventEmitter,
		greeter;
	
	greeter = new EventEmitter();
	EventHub.register('greeter', greeter);

	// EventHub.emitters['greeter'].once('greeting', function (data) {
	EventHub.once('greeter', 'greeting', function (data) {
		console.log(data);
		EventHub.remove('greeter');
	});

Intro
=====

EventHub is a general purpose event hub. When you require it, you get an instance of an event hub that can accept EventEmitters, or function as a stand-alone event emitter.

The idea is that EventHub will act as a message center. Each module in an application will include EventHub and communicate with events.

The API of EventHub is exactly the same as Node's EventEmitter, except that most methods have an optional first parameter that specifies the resource.  The only functions added are:

* `register`- registers an EventEmitter
* `remove`- removes an EventEmitter
* `get`- gets an EventEmitter

For more information, see the API.

API
===

The API is intentionally not bullet-proof. This means that no errors will ever be thrown for invalid parameters, but each function will do its best to avoid incorrect usage.

addListener([resource,] event, listener, [once=false])
------------------------------------------------

Functions exactly like EventEmitter if given two arguments. This function just calls the built-in addListener function of the specified EventEmitter.  This function takes up to 4 arguments:

* `resource`- resource to listen to (defaults to global emitter)
* `event`- event to listen to (required, string)
* `listener`- callback for each event (required, function)
* `once`- true to get exactly one notification (defaults to false)

Returns true if the emitter was found and the respective addListener function was called, or false otherwise.

on([resource,] event, cb, [once=false])
----------------------------------------

Alias for addListener.

once([resource,] event, cb)
---------------------------

Convenience function for addListener(resource, event, cb, true).

removeListener([resource,] event, listener)
-------------------------------------------

Removes a listener from the specified resource. If no resource is specified, the global emitter is assumed. This function takes up to 3 arguments:

* `resource`- resource to remove listener from (defaults to global emitter)
* `event`- event to remove listener for (required, string)
* `listener`- function used as a callback which should be removed (required, function)

Returns true if the emitter was found and removeListener was called on it, or false otherwise.

removeAllListeners([resource,] event)
-------------------------------------

Removes all listeners for the specified event.  This function takes up to two arguments:

* `resource`- resource to remove listeners from (defaults to globlal emitter)
* `event`- event to remove listeners for (required, string)

setMaxListeners([resource,] n)
------------------------------

Sets the maximum. This will increase the default to the specified number (n). If n is zero, the number of listeners will be unlimited. This function takes up to two arguments:

* `resource`- resource to increase max of (defaults to global emitter)
* `n`- number to set maximum to (required, number)

listeners([resource,] event)
----------------------------

Returns an array of listeners to a particular event. This function takes up to two arguments:

* `resource`- resource to get listeners from (defaults to global emitter)
* `event`- event to get listeners from (required, string)

Returns an array of listeners. This array may be manipulated (to remove, add, or modify listeners).

register(resource, emitter)
---------------------------

Registers an emitter as the specified resource. This function takes exactly two arguments:

* `resource`- name for this emitter (string)
* `emitter`- instance that will emit events and allow listeners (EventEmitter)

Returns true if the emitter was added, or false if an emitter already exists by that name.

remove(resource)
----------------

Removes an emitter. This function takes exactly one argument:

* `resource`- name of the EventEmitter to remove

emit(event, data)
-----------------

Alias for the global emitter's emit function.

get(resource)
-------------

Gets an EventEmitter by name. This function takes up to one argument:

* `resource`- the name of the EventEmitter to get (defaults to the global EventEmitter)

This function returns an EventEmitter or 'undefined' if none exists.

Event: 'newResource'
--------------------

Emitted every time a new resource is registered. The event fired will have a two parameters: `function (resource, emitter) { }`

* `resource`- the name of the resource that was registered
* `emitter`- the emitter that was registered
