const { getLanguagePair, send, ErrorMessage } = require('../request');
const { getValue } = require('./tk');
const { handlerGoogleData } = require('./g-utils');

/**
 * 谷歌翻译服务
 * @param {String} text 文本
 * @param {String} url 谷歌翻译服务URL
 * @param {String} from 源语言
 * @param {String} to 目标语言
 * @param {String} original 是否返回原文
 */
async function googleTranslate(text, url, from, to, original) {
	const TRANSLATION_API_PATH = '/translate_a/single'; // t
	// const { from, to } = getLanguagePair(text);
	// 去除 / 如 https://baidu.com/ -> https://baidu.com
	const DEFAULT_GOOGLE_API_SERVER_URL = url.replace(/\/$/, '');
	console.log(DEFAULT_GOOGLE_API_SERVER_URL);
	
	const tkk = await getValue(DEFAULT_GOOGLE_API_SERVER_URL);
	if(!tkk) return Promise.reject(new ErrorMessage('google', 'TKK更新失败, 请检查网络连接'));
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
		Promise.reject(new ErrorMessage('google', '网络连接超时，请检查代理服务器地址是否可用'));
	});
	const { name, result, detail } = handlerGoogleData(res);
	const response = {
		name,
		from: res[2],
		to: to,
		dst: result,
		src: text,
		detail
	};
	if(original) response.row = res;
	return response;
}

module.exports = googleTranslate;