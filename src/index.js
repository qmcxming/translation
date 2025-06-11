const hx = require("hbuilderx");
const {
	camelCase,
	pascalCase,
	snakeCase,
	constantCase,
	kebabCase,
	sentenceCase,
	upperCase,
	lowerCase
} = require('change-case-all');
const { showTranslationDialog } = require('./webview/html');
const { translate, detectLanguage, getLanguagePair } = require('./translate');
const { 
	getTranslationEngine, 
	getSecret, 
	getGoogleServerUrl, 
	getHideTime, 
	getAlibabaVS, 
	getTranslationMode 
} = require('./settings');
const { showWordMappingDialog, getMapping } = require('./webview/wordmp');

function translation() {
	let editorPromise = hx.window.getActiveTextEditor();
	editorPromise.then(async editor => {
		// 获取文本
		const text = editor.document.getText(editor.selection);
		hx.window.setStatusBarMessage('正在翻译中...');
		// 单词映射
		let dst = getMapping(text);
		if(!dst) {
			dst = await getTranslationContent(text);
		}
		if (dst) {
			if (getTranslationMode()) {
				hx.window.showInformationMessage(`<font color="#3574F0">${text}</font><p>${dst}</p>`, [
						'复制'])
					.then(res => hx.env.clipboard.writeText(dst));
			} else {
				hx.window.setStatusBarMessage(dst, getHideTime());
			}
		}
	});
}

const myStatusBarItem = hx.window.createStatusBarItem(
	hx.StatusBarAlignment.Right,
	100,
);
myStatusBarItem.command = 'qmcx.translationDialog';

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
 * 获取选中的文本和当前光标选中的位置
 */
async function getSelectedText() {
	const editor = await hx.window.getActiveTextEditor();
	const text = editor?.document?.getText(editor.selection) || '';
	const selection = editor?.selection;
	return { text, selection };
}

/**
 * 显示翻译替换搜索建议列表
 */
function showTranslationReplace() {
	const editorPromise = hx.window.getActiveTextEditor();
	editorPromise.then(async editor => {
		let selection = editor.selection;
		// 获取文本
		let text = editor.document.getText(selection);
		// 未选中文本
		if (isEmpty(text)) {
			// 选当前词或下一个相同词：经过测试，只支持英文，中文不支持啊
			hx.commands.executeCommand('editor.action.addSelectionToNextFindMatch');
			const res1 = await getSelectedText();
			text = res1.text;
			selection = res1.selection;
			// 针对中文选词处理
			if (isEmpty(text)) {
				// 选择到软行尾
				await hx.commands.executeCommand('cursorEndSelect');
				const res2 = await getSelectedText();
				text = res2.text;
				selection = res2.selection;
			}
		}
		if (detectLanguage(text)) { // 中文 -> 翻译 -> 转换
			const mappingText = getMapping(text);
			text = mappingText ? mappingText : text;
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
			// 光标向右一词：替换完成后，光标移动到替换后单词的词尾
			hx.commands.executeCommand('cursorWordEndRight');
		})
	})
}

function isEmpty(str) { return !str || str.trim() === ''; }

/**
 * 获取翻译内容
 * @param {String} text 文本
 */
async function getTranslationContent(text) {
	const { appId, secretKey } = getSecret();
	const { version, scene } = getAlibabaVS();
	const { from, to } = getLanguagePair(text);
	hx.window.setStatusBarMessage('正在翻译中...');
	try {
		const res = await translate(
			text,
			getTranslationEngine(),
			appId,
			secretKey,
			from,
			to,
			getGoogleServerUrl(),
			version,
			scene
		);
		console.log(res);
		hx.window.clearStatusBarMessage();
		return res.dst;
	} catch (e) {
		const { name, error } = e;
		console.log(e);
		hx.window.setStatusBarMessage(`${name}:${error}`, 3000, 'error');
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
	showTranslationReplace,
	showWordMappingDialog
}