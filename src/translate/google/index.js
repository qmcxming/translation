const { getLanguagePair, send } = require('../request');
const { getValue } = require('./tk');

/**
 * 谷歌翻译服务
 * @param {String} text 文本
 * @param {String} url 谷歌翻译服务URL
 */
async function googleTranslationService(text, url, from, to) {
	const TRANSLATION_API_PATH = '/translate_a/single'; // t
	// const { from, to } = getLanguagePair(text);
	// 去除 / 如 https://baidu.com/ -> https://baidu.com
	const DEFAULT_GOOGLE_API_SERVER_URL = url.replace(/\/$/, '');
	console.log(DEFAULT_GOOGLE_API_SERVER_URL);
	
	const tkk = await getValue(DEFAULT_GOOGLE_API_SERVER_URL);
	console.log(tkk);

	const params = {
		client: 'gtx',
		sl: from,
		tl: to,
		hl: 'en',
		dt: [
			'at',
			'bd',
			'ex',
			'ld',
			'md',
			'qca',
			'rw',
			'rm',
			'ss',
			't',
		],
		ie: 'UTF-8',
		oe: 'UTF-8',
		pc: 1,
		otf: 1,
		ssel: 0,
		tsel: 0,
		kc: 1,
		tk: text.tk(tkk),
		q: text
	};
	const res = await send(
		DEFAULT_GOOGLE_API_SERVER_URL + TRANSLATION_API_PATH,
		null,
		params, {
			'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36',
			'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
			'Host': new URL(DEFAULT_GOOGLE_API_SERVER_URL).host
		}
	).catch(e => {
		console.log(e);
		Promise.reject('网络连接超时，请检查代理服务器地址是否可用')
	});
	console.log(res);
	console.log('----');
	// console.log(res[res.length - 2]);
	// console.log(res[res.length - 2][1]);
	const result = res[0].reduce((acc, item) => {
		if (item[0]) {
			acc += item[0];
		}
		return acc;
	}, '');
	return {
		from: from,
		to: to,
		dst: result,
		src: text,
		row: res
	}
}

module.exports = googleTranslationService