// 获取 tk

const MIM = 60 * 60 * 1000;
const ELEMENT_URL_PATH = "/translate_a/element.js";

const tkkPattern = /tkk='(\d+).(-?\d+)'/;

let innerValue = null;

let googleTranslationUrl = 'https://translate.google.com';

function getValue(url) {
	googleTranslationUrl = url;
	return update() || generate();
}

function update() {
	if (innerValue) {
		const now = Math.floor(Date.now() / MIM);
		if (innerValue[0] === now) {
			return innerValue;
		}
	}

	const newTKK = updateFromGoogle();

	if (!innerValue || (newTKK && newTKK[0] >= innerValue[0])) {
		innerValue = newTKK;
	}
	return innerValue;
}

function generate() {
	const now = Math.floor(Date.now() / MIM);
	const generator = Math.random;
	return [now, Math.abs(Math.floor(generator() * 1000000000)) + Math.floor(generator() * 1000000000)];
}

function getElementJsRequest(serverUrl) {
	return `${serverUrl.trimEnd('/')}${ELEMENT_URL_PATH}`;
}

async function updateFromGoogle() {
	try {
		const [v1, v2] = await fetchTKK();
		console.log(`TKK Updated: ${v1}.${v2}`);
		return [v1, v2];
	} catch (error) {
		console.warn("TKK update failed", error);
		return null;
	}
}

async function fetchTKK(serverUrl = googleTranslationUrl) {
	const elementJS = await fetch(getElementJsRequest(serverUrl))
		.then(response => response.text());

	const match = tkkPattern.exec(elementJS);
	if (!match) {
		throw new Error("TKK not found.");
	}

	return [parseInt(match[1], 10), parseInt(match[2], 10)];
}

async function testConnection() {
	try {
		await fetch(getElementJsRequest(googleTranslationUrl), { method: 'HEAD' });
		console.log("TKK connection test: OK");
		return true;
	} catch (e) {
		console.log("TKK connection test: FAILURE");
		return false;
	}
}

String.prototype.tk = function(tkk = getValue()) {
	console.log(`TKK: ${tkk}`);
	if (!tkk) return '*.*';
	let a = [];
	let b = 0;

	while (b < this.length) {
		let c = this.charCodeAt(b);
		if (c < 128) {
			a.push(c);
		} else {
			if (c < 2048) {
				a.push((c >> 6) | 192);
			} else {
				if (c >= 55296 && c <= 57343 && b + 1 < this.length && this.charCodeAt(b + 1) >= 56320 && this
					.charCodeAt(b + 1) <= 57343) {
					c = 65536 + ((c & 1023) << 10) + (this.charCodeAt(++b) & 1023);
					a.push((c >> 18) | 240);
					a.push((c >> 12 & 63) | 128);
				} else {
					a.push((c >> 12) | 224);
				}
				a.push((c >> 6 & 63) | 128);
			}
			a.push((c & 63) | 128);
		}
		b++;
	}

	let [d, e] = tkk;
	let f = d;

	for (let h of a) {
		f += h;
		f = calculate(f, "+-a^+6");
	}
	f = calculate(f, "+-3^+b+-f");
	f ^= e;

	if (f < 0) {
		f = (f & 0x7fffffff) + 0x7fffffff + 1;
	}
	f = (f % 1E6);

	return `${f}.${f ^ d}`;
}

function calculate(a, b) {
	let g = a;
	for (let c = 0; c < b.length - 2; c += 3) {
		const d = b.charAt(c + 2);
		const e = d >= 'a' ? d.charCodeAt(0) - 87 : parseInt(d);
		const f = b.charAt(c + 1) === '+' ? g >>> e : g << e;
		g = b.charAt(c) === '+' ? g + f & 0xFFFFFFFF : g ^ f;
	}
	return g;
}

module.exports = { getValue };