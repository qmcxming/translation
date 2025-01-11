const hx = require('hbuilderx');
const fs = require('fs');
const path = require('path');

// AppData缓存工具

/**
 * 获取缓存目录
 * @pamram {string} dir 目录
 * @returns {string} 缓存目录
 */
function getCacheUrl(dir) {
	let CACHE_URL = path.join(hx.env.appData, 'translation-plugin');
	if(dir) {
		CACHE_URL = path.join(CACHE_URL, dir);
	}
	// 判断缓存目录是否存在
	if(!fs.existsSync(CACHE_URL)) {
		fs.mkdirSync(CACHE_URL, { recursive: true });
	}
	return CACHE_URL;
}

module.exports = {
	getCacheUrl
};