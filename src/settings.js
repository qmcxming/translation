const hx = require("hbuilderx");

const translationConfig = hx.workspace.getConfiguration('translation');
console.log(translationConfig.get('aEngine'));

/**
 * 获取插件配置信息
 * @param {String} section 配置项的key
 */
function getTranslationConfig(section) {
	return translationConfig.get(section);
}

/**
 * 获取翻译引擎
 */
function getTranslationEngine() {
	return translationConfig.get('aEngine');
}

/**
 * 获取APP ID 和 密钥
 */
function getSecret() {
	const engine = getTranslationEngine().toLocaleLowerCase();
	const str = getTranslationConfig(engine + 'Secret');
	const secret = str.split(',');
	return {
		appId: secret[0],
		secretKey: secret[1]
	};
}

/**
 * 获取Google服务器地址
 * @param {string} [engine=getTranslationEngine().toLocaleLowerCase()] 翻译引擎
 */
function getGoogleServerUrl(engine = getTranslationEngine().toLocaleLowerCase()) {
	return getTranslationConfig(engine + 'Secret');
}

/**
 * 获取翻译结果自动隐藏时间
 */
function getHideTime() {
	const time = getTranslationConfig('time');
	return time > 0 ? time * 1000 : null;
}

/**
 * 获取Alibaba翻译的版本和场景
 */
function getAlibabaVS() {
	if (getTranslationEngine() !== 'Alibaba') {
		return { version: 'general', scene: 'general' };
	}
	const version = translationConfig.get('z1alibabaVersion');
	return version === 'general' ? {
		version,
		scene: 'general'
	} : {
		version,
		scene: translationConfig.get('z2alibabaProScene')
	};
}

module.exports = {
	getTranslationConfig,
	getTranslationEngine,
	getSecret,
	getGoogleServerUrl,
	getHideTime,
	getAlibabaVS
}