const hx = require("hbuilderx");
const { camelCase, pascalCase, snakeCase, constantCase, kebabCase, sentenceCase, upperCase, lowerCase } =
require(
	'change-case-all');
const { showTranslationDialog } = require('./html');
const { translationService, detectLanguage } = require('./translate');
const { getTranslationEngine, getSecret, getGoogleServerUrl, getHideTime } = require('./settings');

function translation() {
	let editorPromise = hx.window.getActiveTextEditor();
	console.log(getHideTime());
	editorPromise.then(async editor => {
		// 获取文本
		const text = editor.document.getText(editor.selection);
		hx.window.setStatusBarMessage('正在翻译中...');
		const dst = await getTranslationContent(text);
		if (dst) hx.window.setStatusBarMessage(dst, getHideTime());
	});
}

const myStatusBarItem = hx.window.createStatusBarItem(
	hx.StatusBarAlignment.Right,
	100,
);
myStatusBarItem.command = 'extension.translationDialog';

/**
 * 设置翻译状态栏元素
 */
function setTranslationStatusBar() {
	myStatusBarItem.text = '$(' + getTranslationEngine().toLocaleLowerCase() + ')';
	myStatusBarItem.tooltip = `打开翻译对话框(${getTranslationEngine()})`;
	myStatusBarItem.show();
}

/**
 * 销毁翻译状态栏元素
 */
function clearTranslationStatusBar() {
	myStatusBarItem.dispose();
}

const template = [{
		label: '1',
		description: 'helloWorld',
		handler: camelCase
	},
	{
		label: '2',
		description: 'HelloWorld',
		handler: pascalCase
	},
	{
		label: '3',
		description: 'hello_world',
		handler: snakeCase
	},
	{
		label: '4',
		description: 'HELLO_WORLD',
		handler: constantCase
	},
	{
		label: '5',
		description: 'hello-world',
		handler: kebabCase
	},
	{
		label: '6',
		description: 'HELLO-WORLD',
		handler: (word) => {
			return upperCase(kebabCase(word));
		}
	},
	{
		label: '7',
		description: 'hello world',
		handler: (word) => {
			return lowerCase(sentenceCase(word));
		}
	},
	{
		label: '8',
		description: 'HELLO WORLD',
		handler: (word) => {
			return upperCase(sentenceCase(word));
		}
	},
	{
		label: '9',
		description: 'Hello world',
		handler: sentenceCase
	},
]

/**
 * 显示翻译替换搜索建议列表
 */
function showTranslationReplace() {
	const editorPromise = hx.window.getActiveTextEditor();
	editorPromise.then(async editor => {
		const selection = editor.selection;
		// 获取文本
		let text = editor.document.getText(selection);
		if (detectLanguage(text)) { // 中文 -> 翻译 -> 转换
			text = await getTranslationContent(text);
		}
		const items = template.map(item => ({
			label: item.label,
			// 英文 -> 直接转换
			description: item.handler(text)
		}));
		const pickResult = hx.window.showQuickPick(items, { placeHolder: '请选择替换模板' });

		pickResult.then(function(result) {
			if (!result) {
				return;
			}
			// 替换选区
			editor.edit(editBuilder => {
				editBuilder.replace(selection, result.description);
			});
		})
	})
}

/**
 * 获取翻译内容
 * @param {String} text 文本
 */
async function getTranslationContent(text) {
	const { appId, secretKey } = getSecret();
	console.log(text);
	hx.window.setStatusBarMessage('正在翻译中...');
	try {
		const res = await translationService(
			text,
			getTranslationEngine(),
			appId,
			secretKey,
			getGoogleServerUrl()
		);
		console.log(res);
		hx.window.clearStatusBarMessage();
		return res.dst;
	} catch (e) {
		console.log(e);
		hx.window.setStatusBarMessage(e, 3000, 'error');
	}
}

// 配置改变触发
let configurationChangeDisplose = hx.workspace.onDidChangeConfiguration(function(event) {
	if (event.affectsConfiguration("translation.aEngine")) {
		console.log("当前翻译引擎：", getTranslationEngine());
		setTranslationStatusBar();
	}
});

module.exports = {
	translation,
	showTranslationDialog,
	setTranslationStatusBar,
	clearTranslationStatusBar,
	showTranslationReplace
}