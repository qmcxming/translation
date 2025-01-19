const baiduTranslate = require('./baidu');
const googleTranslate = require('./google');
const tencentTranslate = require('./tencent');
const alibabaTranslate = require('./alibaba');
const { translationEngines, detectLanguage, getLanguagePair, ErrorMessage } = require('./request');
const voiceList = require('./voices.json');

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
 * @param {('baidu'|'tencent'|'alibaba'|'google')} engine 翻译引擎 默认 google
 * @param {String} appId APP ID
 * @param {String} secretKey 密钥
 * @param {string} [from='auto'] 源语言 默认 auto
 * @param {string} to 目标语言
 * @param {string} [url='https://translate.google.com'] 服务器地址(仅谷歌翻译支持) 默认 https://translate.google.com
 * @param {string} [version='general'] 翻译版本(仅阿里翻译支持)
 * @param {string} [scene='general'] 翻译场景(仅阿里翻译支持)
 * @param {boolean} [original=false] 是否返回原文
 * @returns {Promise}
 */
async function translate(text, engine = 'google', appId, secretKey, from = 'auto', to, url = translationEngines['google'], version =
	'general', scene = 'general', original = false) {
	// 转换小写
	engine = engine.toLocaleLowerCase();
	await validate(text, appId, secretKey, engine, url).catch(e => Promise.reject(e));
	switch (engine) {
		case 'baidu':
			return baiduTranslate(text, appId, secretKey, from, to, original);
		case 'tencent':
			return tencentTranslate(text, appId, secretKey, from, to, original);
		case 'alibaba':
			return alibabaTranslate(text, appId, secretKey, version, scene, from, to, original);
		case 'google':
			return googleTranslate(text, url, from, to, original);
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
	if (isEmpty(text)) return Promise.reject(new ErrorMessage(engine, '翻译内容不能为空'));
	if (engine !== 'google') {
		if (isEmpty(appId) || isEmpty(secretKey)) 
			return Promise.reject(new ErrorMessage(engine, '应用ID 和密钥不能为空'));
	} else {
		// 谷歌翻译适用
		if (isEmpty(url)) return Promise.reject(new ErrorMessage(engine, '谷歌翻译API地址不能为空'));
	}
	return Promise.resolve();
}

function createSSML(text, voiceName) {
	text = text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('\'', '&apos;').replaceAll('"', '&quot;');
	let ssml = '\
		<speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xmlns:emo="http://www.w3.org/2009/10/emotionml" version="1.0" xml:lang="en-US">\
			<voice name="'+ voiceName + '">\
					<prosody rate="0%" pitch="0%">\
							'+ text + '\
					</prosody >\
			</voice >\
		</speak > '
	return ssml;
}

/**
 * 获取音频数据
 * @param {string} text 文本
 * @param {string} language 语种 
 */
async function audio(text, language) {
	if(isEmpty(text)) return Promise.reject(new ErrorMessage('音频数据', '文本不能为空'));
	if(isEmpty(language)) return Promise.reject(new ErrorMessage('音频数据', '语种不能为空'));
	let voiceName = '';
	voiceList.forEach(voice => {
		if(voice.codes.includes(language)) {
			voiceName = voice.name;
		}
	})
	if(isEmpty(voiceName)) {
		return Promise.reject(new ErrorMessage('音频数据', '没有该语音包，可以尝试切换语种，再次播放哦'));
	}
	let ssml = createSSML(text, voiceName);
	const response = await fetch('https://microsoft-tts.supercopilot.top/api/ra', {
		method: 'POST',
		headers: {
			'Content-Type': 'text/plain',
			'Format': 'audio-24khz-48kbitrate-mono-mp3'
		},
		body: ssml
	})
	if (response.status == 200) {
		return response.arrayBuffer();
	} else if (response.status == 401) {
		return Promise.reject(new ErrorMessage('音频数据', '无效的密钥'));
	} else {
		return response.text().then(text => Promise.reject(new ErrorMessage('音频数据', text)));
	}
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
	translate,
	detectLanguage,
	getLanguagePair,
	audio
}