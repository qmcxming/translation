const hx = require("hbuilderx");
const { showTranslationDialog } = require('./html');
const { translationService } = require('./translate');
const { getTranslationEngine, getSecret } = require('./settings');

function translation() {
	let editorPromise = hx.window.getActiveTextEditor();
	editorPromise.then(async editor => {
		// 获取文本
		const text = editor.document.getText(editor.selection);
		const { appId, secretKey } = getSecret();
		console.log(text);
		hx.window.setStatusBarMessage('正在翻译中...');
		try {
			const res = await translationService(
				text,
				getTranslationEngine(),
				appId,
				secretKey
			);
			console.log(res);
			hx.window.setStatusBarMessage(res.dst, 3000);
		} catch (e) {
			hx.window.setStatusBarMessage(e, 3000, 'error');
		}
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
	myStatusBarItem.text = '$('+ getTranslationEngine().toLocaleLowerCase() +')';
	myStatusBarItem.tooltip = `打开翻译对话框(${getTranslationEngine()})`;
	myStatusBarItem.show();
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
	setTranslationStatusBar
}