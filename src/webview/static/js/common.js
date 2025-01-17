/**
 * 字符串判空
 * @param {string} str 字符串
 * @returns {boolean}
 */
function isEmpty(str) { return !str || str.trim() === ''; }

/**
 * 简单的jq选择器🤣
 * @param {string} name 选择器名称，例如 #id .class
 * @returns {HTMLElement}
 */
function $(name) {
	return document.querySelector(name);
}

