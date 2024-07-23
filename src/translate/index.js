const crypto = require('crypto');
const axios = require('axios');

/**
 * 一个简单的翻译api集成[百度翻译、腾讯翻译、阿里翻译]
 * @author 青明尘下
 * @description 中英互译
 * @link https://api.fanyi.baidu.com/product/11 百度翻译
 * @link https://cloud.tencent.com/product/tmt 腾讯翻译
 * @link https://www.aliyun.com/product/ai/base_alimt?source=5176.11533457&userCode=wsnup3vv 阿里翻译
 */

/**
 * 通用错误提示
 */
const errorTips = {
	appIdError: '请检查应用ID(AppId/SecretId/AccessKeyID)是否正确或者服务是否开通',
	secretKeyError: '密钥(SecretKey)错误'
};

/**
 * 翻译引擎
 */
const translationEngines = {
	baidu: 'http://api.fanyi.baidu.com/api/trans/vip/translate',
	tencent: 'https://tmt.tencentcloudapi.com',
	alibaba: {
		// 通用版本
		general: 'http://mt.cn-hangzhou.aliyuncs.com/api/translate/web/general',
		// 专业版本
		ecommerce: 'http://mt.cn-hangzhou.aliyuncs.com/api/translate/web/ecommerce'
	}
}

/**
 * 检测语言(是否为中文)
 * @param {String} word 文本
 */
function detectLanguage(word) {
	return /[\u4e00-\u9fa5]/gm.test(word);
}

/**
 * 获取源语言以及目标语言
 * @param {Object} text 文本
 */
function getLanguagePair(text) {
	const isChinese = detectLanguage(text);
	const from = isChinese ? 'zh' : 'en'; // 源语言
	const to = !isChinese ? 'zh' : 'en'; // 目标语言
	return { from, to };
}

/**
 * 翻译服务
 * @param {String} text 文本
 * @param {('baidu'|'tencent'|'alibaba')} engine 翻译引擎
 * @param {String} appId APP ID
 * @param {String} secretKey 密钥
 * @param {string} [version='general'] 翻译版本(仅阿里翻译支持)
 * @param {string} [scene='general'] 翻译场景(仅阿里翻译支持)
 */
async function translationService(text, engine, appId, secretKey, version = 'general', scene = 'general') {
	await validate(text, appId, secretKey).catch(e => Promise.reject(e));
	// 转换小写
	engine = engine.toLocaleLowerCase();
	switch (engine) {
		case 'baidu':
			return baiduTranslationService(text, appId, secretKey);
		case 'tencent':
			return tencentTranslationService(text, appId, secretKey);
		case 'alibaba':
			return alibabaTranslationService(text, appId, secretKey);
	}
}

/**
 * 验证文本、APP ID 和密钥是否为空
 *
 * @param {String} text - 文本
 * @param {String} appId - APP ID
 * @param {String} secretKey - 密钥
 */
function validate(text, appId, secretKey) {
	if (isEmpty(text)) return Promise.reject('翻译内容不能为空');
	if (isEmpty(appId) || isEmpty(secretKey)) return Promise.reject('密钥不能为空');
	return Promise.resolve();
}

/**
 * 百度翻译服务
 * @param {String} text 文本
 * @param {String} appId APP ID
 * @param {String} secretKey 密钥
 */
async function baiduTranslationService(text, appId, secretKey) {
	const { from, to } = getLanguagePair(text);
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

	const res = await send(translationEngines['baidu'], data, headers);
	if (res.error_code) {
		switch (res.error_code) {
			case '52003':
				return Promise.reject(errorTips['appIdError']);
			case '54001':
				return Promise.reject(errorTips['secretKeyError']);
		}
	}

	return {
		from: res.from,
		to: res.to,
		// destination 目标
		dst: res.trans_result[0].dst,
		src: res.trans_result[0].src
	}
}

/**
 * 腾讯翻译服务
 * @param {String} text 文本
 * @param {String} appId APP ID
 * @param {String} secretKey 密钥
 */
async function tencentTranslationService(text, appId, secretKey) {
	const { from, to } = getLanguagePair(text);
	const data = {
		SourceText: text,
		Source: from,
		Target: to,
		ProjectId: 0
	};

	const SECRET_ID = appId;
	const SECRET_KEY = secretKey;
	const TOKEN = '';

	const host = 'tmt.tencentcloudapi.com';
	const service = "tmt";
	const region = "ap-guangzhou";
	const action = "TextTranslate";
	const version = "2018-03-21"
	const timestamp = parseInt(String(new Date().getTime() / 1000));
	const date = getDate(timestamp);
	const payload = JSON.stringify(data);

	// 步骤 1：拼接规范请求串
	const signedHeaders = "content-type;host";
	const hashedRequestPayload = getHash(payload);
	const httpRequestMethod = "POST";
	const canonicalUri = "/";
	const canonicalQueryString = "";
	const canonicalHeaders =
		"content-type:application/json; charset=utf-8\n" + "host:" + host + "\n";

	const canonicalRequest =
		httpRequestMethod +
		"\n" +
		canonicalUri +
		"\n" +
		canonicalQueryString +
		"\n" +
		canonicalHeaders +
		"\n" +
		signedHeaders +
		"\n" +
		hashedRequestPayload;

	// 步骤 2：拼接待签名字符串
	const algorithm = "TC3-HMAC-SHA256"
	const hashedCanonicalRequest = getHash(canonicalRequest)
	const credentialScope = date + "/" + service + "/" + "tc3_request"
	const stringToSign =
		algorithm +
		"\n" +
		timestamp +
		"\n" +
		credentialScope +
		"\n" +
		hashedCanonicalRequest;

	// 步骤 3：计算签名
	const kDate = sha256(date, "TC3" + SECRET_KEY);
	const kService = sha256(service, kDate);
	const kSigning = sha256("tc3_request", kService);
	const signature = sha256(stringToSign, kSigning, "hex");

	// 步骤 4：拼接 Authorization
	const authorization =
		algorithm +
		" " +
		"Credential=" +
		SECRET_ID +
		"/" +
		credentialScope +
		", " +
		"SignedHeaders=" +
		signedHeaders +
		", " +
		"Signature=" +
		signature

	// 步骤 5：构造请求头
	const headers = {
		Authorization: authorization,
		"Content-Type": "application/json; charset=utf-8",
		Host: host,
		"X-TC-Action": action,
		"X-TC-Timestamp": timestamp,
		"X-TC-Version": version,
	};

	if (region) {
		headers["X-TC-Region"] = region
	}
	if (TOKEN) {
		headers["X-TC-Token"] = TOKEN
	}

	const { Response } = await send(translationEngines['tencent'], data, headers);

	// 部分错误处理
	if (Response.Error) {
		switch (Response.Error.Code) {
			case 'AuthFailure.SecretIdNotFound':
				return Promise.reject(errorTips['appIdError']);
			case 'AuthFailure.SignatureFailure':
				return Promise.reject(errorTips['secretKeyError']);
		}
	}

	return {
		from: Response.Source,
		to: Response.Target,
		dst: Response.TargetText,
		src: text
	};
}

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
		Scene: 'general'
	};

	//  通用版
	const url = translationEngines['alibaba']['general'];
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
	console.log("1.加密后的请求体：", bodyMd5);

	// 生成唯一随机值
	const uuid = crypto.randomUUID();
	console.log("2.唯一随机值：", uuid);

	// 请求头SHA-1加密
	const arr = [method, accept, bodyMd5, content_type, date, "x-acs-signature-method:HMAC-SHA1",
		"x-acs-signature-nonce:" + uuid, "x-acs-version:2019-01-02", path
	]
	const stringToSign = arr.join("\n");

	// 2. 计算 HMAC-SHA1
	const signature = HMACSha1(stringToSign, secretKey);
	console.log("4.计算后的HMAC-SHA1：", signature);

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
		const { Data } = await send(url, data, headers);
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
		console.log('alibaba: ', e.response.data.Code);
	}
}

/**
 * 发送post请求
 * @param {String} url 请求地址
 * @param {*} data 数据
 * @param {{}} [headers={}] 请求头
 */
function send(url, data, headers = {}) {
	return new Promise((resolve, reject) => {
		axios.post(url, data, {
			headers
		}).then(res => {
			console.log(res.data);
			resolve(res.data);
		}).catch(error => {
			// console.log(error);
			reject(error);
		});
	});
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

/**
 * 为给定的消息和密钥生成SHA-256 HMAC
 * 
 * @param {String} message 要进行哈希处理的消息。
 * @param {String} secret HMAC的密钥。默认为空字符串。
 * @param {String} encoding 输出哈希的编码格式。如果未指定，则返回一个Buffer对象。
 * @returns {String | Buffer} 消息的HMAC哈希值。
 */
function sha256(message, secret = "", encoding) {
	const hmac = crypto.createHmac("sha256", secret)
	return hmac.update(message).digest(encoding)
}

/**
 * 为给定的消息生成SHA-256哈希值。
 * 
 * @param {String} message 消息
 * @param {String} [encoding="hex"] 输出哈希的编码格式。默认为"hex"
 * @returns {String | Buffer} 消息的SHA-256哈希值
 */
function getHash(message, encoding = "hex") {
	const hash = crypto.createHash("sha256")
	return hash.update(message).digest(encoding)
}

/**
 * 根据时间戳返回格式化的日期字符串。
 *
 * @param {Number} timestamp 时间戳
 * @returns {String} 格式化的日期字符串，格式为 YYYY-MM-DD
 */
function getDate(timestamp) {
	const date = new Date(timestamp * 1000);
	const year = date.getUTCFullYear();
	const month = String(date.getUTCMonth() + 1).padStart(2, '0');
	const day = String(date.getDay()).padStart(2, '0');
	return `${year}-${month}-${day}`;
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

module.exports = {
	translationService,
	detectLanguage
}