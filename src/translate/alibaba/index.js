const crypto = require('crypto');
const { getLanguagePair, send, errorTips, translationEngines } = require('../request');
/**
 * 阿里翻译服务
 * @param {String} text 文本
 * @param {String} appId APP ID
 * @param {String} secretKey 密钥
 * @param {('general'|'ecommerce')} [version='general'] 翻译版本(通用版和专业版, 默认general)
 * @param {string} [scene='general'] 翻译场景(通用版: general 专业版: title、description、communication、medical、social、finance)
 * @link https://help.aliyun.com/zh/machine-translation/developer-reference/api-alimt-2018-10-12-translate?spm=a2c4g.11186623.0.0.6ad24f6fmuQm0q - 专业版
 * @link https://help.aliyun.com/zh/machine-translation/developer-reference/api-alimt-2018-10-12-translategeneral?spm=a2c4g.11186623.0.0.546b6678QMR17g - 通用版
 */
async function alibabaTranslationService(text, appId, secretKey, version = 'general', scene = 'general') {
	const { from, to } = getLanguagePair(text);
	const data = {
		// 翻译文本的格式
		FormatType: 'text',
		// 原文语言
		SourceLanguage: from,
		// 译文语言
		TargetLanguage: to,
		// 需要翻译的内容
		SourceText: text,
		// 通用版默认是：general
		// 专业版默认是：title
		// TODO 后续新增 翻译版本选择 和 翻译场景选择，再进行修改
		Scene: scene
	};

	//  通用版
	const url = translationEngines['alibaba'][version];
	// 专业版 http://mt.cn-hangzhou.aliyuncs.com/api/translate/web/ecommerce 并且设置 Scene: 'title'

	const realUrl = new URL(url);

	// 下面字段用于进行加密签名
	const method = "POST";
	const accept = "application/json";
	const content_type = "application/json;chrset=utf-8";
	const path = realUrl.pathname;
	const date = new Date().toUTCString();
	const host = realUrl.host;

	// 将请求体进行MD5加密和Base64编码
	const bodyMd5 = MD5Base64Encode(JSON.stringify(data));
	// console.log("1.加密后的请求体：", bodyMd5);

	// 生成唯一随机值
	const uuid = crypto.randomUUID();
	// console.log("2.唯一随机值：", uuid);

	// 请求头SHA-1加密
	const arr = [method, accept, bodyMd5, content_type, date, "x-acs-signature-method:HMAC-SHA1",
		"x-acs-signature-nonce:" + uuid, "x-acs-version:2019-01-02", path
	]
	const stringToSign = arr.join("\n");

	// 2. 计算 HMAC-SHA1
	const signature = HMACSha1(stringToSign, secretKey);
	// console.log("4.计算后的HMAC-SHA1：", signature);

	// 3. 获得最终的Authorization
	const authHeader = "acs " + appId + ":" + signature;

	const headers = {
		'Accept': accept,
		'Content-Type': content_type,
		'Content-MD5': bodyMd5,
		'Date': date,
		'Host': host,
		'Authorization': authHeader,
		'x-acs-signature-nonce': uuid,
		'x-acs-signature-method': 'HMAC-SHA1',
		'x-acs-version': '2019-01-02',
	};

	try {
		const { Data } = await send(url, data, null, headers);
		return {
			from: from,
			to: to,
			dst: Data.Translated,
			src: text
		};
	} catch (e) {
		switch (e.response.data.Code) {
			case 'InvalidAccessKeyId.NotFound':
				return Promise.reject(errorTips['appIdError']);
			case 'SignatureDoesNotMatch':
				return Promise.reject(errorTips['secretKeyError']);
		}
	}
}

/**
 * 将内容进行MD5加密后再进行Base64编码
 * @param {String} str 要加密的字符串
 */
function MD5Base64Encode(str) {
	if (!str) {
		console.log("加密的内容为空！！！");
		return "";
	}
	// 得到MD5的十六进制字符串
	const md5Hash = crypto.createHash('md5').update(str).digest('hex');
	// 将MD5的十六进制字符串转换为Base64编码
	return Buffer.from(md5Hash, 'hex').toString('base64');
}

/**
 * 计算 HMAC-SHA1
 * @param {String} data 要加密的数据
 * @param {String} key key值
 */
function HMACSha1(data, key) {
	// 计算HMAC-SHA1
	const md5Hash = crypto.createHmac('sha1', key).update(data).digest();
	// 最终签名
	return Buffer.from(md5Hash, "hex").toString('base64');
}

module.exports = alibabaTranslationService;