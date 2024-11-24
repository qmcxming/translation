const crypto = require('crypto');
const { getLanguagePair, send, translationEngines } = require('../request');
const errorCode = require('./errorCode');

/**
 * 百度翻译服务
 * @param {String} text 文本
 * @param {String} appId APP ID
 * @param {String} secretKey 密钥
 * @param {String} from 源语言
 * @param {String} to 目标语言
 */
async function baiduTranslationService(text, appId, secretKey, from, to) {
	console.log(appId, secretKey);
	// const { from, to } = getLanguagePair(text);
	const salt = new Date().getTime();
	const str1 = appId + text + salt + secretKey;
	const sign = crypto
		.createHash('md5')
		.update(str1)
		.digest('hex');

	const data = {
		q: text,
		appid: appId,
		salt: salt,
		from: from,
		to: to,
		sign: sign
	};

	const headers = {
		'Content-Type': 'application/x-www-form-urlencoded'
	};

	const res = await send(translationEngines['baidu'], data, null, headers);
	if (res.error_code) {
		return Promise.reject(errorCode[res.error_code]);
	}

	return {
		from: res.from,
		to: res.to,
		// destination 目标
		dst: res.trans_result[0].dst,
		src: res.trans_result[0].src
	}
}

module.exports = baiduTranslationService