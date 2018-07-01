"use strict";

console.log('ServiceWorker: running');

let cacheNames = ['static-files', 'fetch-requests'];

let files = [
	'.',
	'css/main.css',
	'css/main.css.map',
	'js/main/main.js',
	'js/workers/img-processor.js'
];

self.addEventListener("install", function (event) {
	event.waitUntil(cacheFiles());
});

const cacheFiles = async () => {
	try {
		const cache = await caches.open(cacheNames[0])
		return cache.addAll(files)
	} catch (e) {
		console.log('ServiceWorker: install error');
	}
}

self.addEventListener("fetch", function (event) {
	console.log('ServiceWorker: fetch event in progress.');
	if (event.request.method !== 'GET' || event.request.url.indexOf("browser-sync") != -1) {
		console.log('ServiceWorker: fetch event ignored.', event.request.method, event.request.url);
		return;
	}

	event.respondWith(fetchMatch(event));
});

const fetchMatch = async (event) => {
	try {
		var cached = await caches.match(event.request);
		console.log('ServiceWorker: fetch event', cached ? '(cached)' : '(network)', event.request.url);
		return cached || fetchFromNetwork(event);
	} catch (e) {
		console.log('ServiceWorker: install error');
	}
}

const fetchFromNetwork = async (event) => {
	try {
		var response = await fetch(event.request);
		return cacheNetworkResponse(event, response);
	} catch (e) {
		return fetchFromNetworkFailure();
	}
}

const cacheNetworkResponse = async (event, response) => {
	var cacheCopy = response.clone();

	console.log('ServiceWorker: fetch response from network.', event.request.url);
	try {
		var cache = await caches.open(cacheNames[1]);
		return cache.put(event.request, cacheCopy);
	} catch (e) {
		console.log('ServiceWorker: cache response error.', event.request.url);
	}

	return response;
}

const fetchFromNetworkFailure = () => {
	console.log('ServiceWorker: fetch request failed in both cache and network.');

	return new Response('<h1>Service Unavailable</h1>', {
		status: 503,
		statusText: 'Service Unavailable',
		headers: new Headers({
			'Content-Type': 'text/html'
		})
	});
}

self.addEventListener("activate", function (event) {
	console.log('ServiceWorker: activate event in progress.');

	event.waitUntil(
		activate().then(function () {
			console.log('ServiceWorker: activate completed.');
		})
	);
});

const activate = async () => {
	try {
		var keys = await caches.keys();
		return Promise.all(
			keys.map((cacheName) => {
				if (cacheNames.indexOf(cacheName) === -1) {
					return caches.delete(cacheName);
				}
			})
		);
	} catch (e) {
		console.log('ServiceWorker: activate error');
	}
}