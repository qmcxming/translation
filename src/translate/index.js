const baiduTranslationService = require('./baidu');
const googleTranslationService = require('./google');
const tencentTranslationService = require('./tencent');
const alibabaTranslationService = require('./alibaba');
const { translationEngines, detectLanguage, getLanguagePair } = require('./request');

/**
 * 一个简单的翻译api集成[百度翻译、腾讯翻译、阿里翻译]
 * @author 青明尘下
 * @description 中英互译
 * @link https://api.fanyi.baidu.com/product/11 百度翻译
 * @link https://cloud.tencent.com/product/tmt 腾讯翻译
 * @link https://www.aliyun.com/product/ai/base_alimt?source=5176.11533457&userCode=wsnup3vv 阿里翻译
 */

/**
 * 翻译服务
 * @param {String} text 文本
 * @param {('baidu'|'tencent'|'alibaba'|'google')} engine 翻译引擎
 * @param {String} appId APP ID
 * @param {String} secretKey 密钥
 * @param {string} [fromLan='auto'] 源语言
 * @param {string} toLan 目标语言
 * @param {string} [url=translationEngines['google']] 服务器地址(仅谷歌翻译支持)
 * @param {string} [version='general'] 翻译版本(仅阿里翻译支持)
 * @param {string} [scene='general'] 翻译场景(仅阿里翻译支持)
 */
async function translationService(text, engine, appId, secretKey, from = 'auto', to, url = translationEngines['google'], version =
	'general', scene = 'general') {
	// 转换小写
	engine = engine.toLocaleLowerCase();
	await validate(text, appId, secretKey, engine, url).catch(e => Promise.reject(e));
	switch (engine) {
		case 'baidu':
			return baiduTranslationService(text, appId, secretKey, from, to);
		case 'tencent':
			return tencentTranslationService(text, appId, secretKey, from, to);
		case 'alibaba':
			return alibabaTranslationService(text, appId, secretKey, version, scene, from, to);
		case 'google':
			return googleTranslationService(text, url, from, to);
	}
}

/**
 * 验证文本、APP ID 和密钥是否为空
 *
 * @param {String} text - 文本
 * @param {String} appId - APP ID
 * @param {String} secretKey - 密钥
 * @param {String} engine 翻译引擎
 */
function validate(text, appId, secretKey, engine, url) {
	if (isEmpty(text)) return Promise.reject('翻译内容不能为空');
	if (engine !== 'google') {
		if (isEmpty(appId) || isEmpty(secretKey)) return Promise.reject('密钥不能为空');
	} else {
		// 谷歌翻译适用
		if (isEmpty(url)) return Promise.reject('代理服务器不能为空');
	}
	return Promise.resolve();
}

/**
 * 检查字符串是否为空
 * @param {string} str 要检查的字符串
 * @returns {boolean} 如果字符串为空或仅包含空白字符，则返回 true，否则返回 false
 */
function isEmpty(str) {
	if (typeof str !== 'string') return true;
	return str.trim().length === 0;
}

module.exports = {
	translationService,
	detectLanguage,
	getLanguagePair
}