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

module.exports = {
	getTranslationConfig,
	getTranslationEngine,
	getSecret,
	getGoogleServerUrl
}