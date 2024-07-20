var hx = require("hbuilderx");
const { translation, showTranslationDialog, setTranslationStatusBar } = require('./src');

//该方法将在插件激活的时候调用
function activate(context) {
	setTranslationStatusBar();
	let disposable = hx.commands.registerCommand('extension.translation', () => {
		translation();
	});
	const translationDialog = hx.commands.registerCommand('extension.translationDialog', () => {
		showTranslationDialog();
	})
	//订阅销毁钩子，插件禁用的时候，自动注销该command。
	context.subscriptions.push(disposable);
	context.subscriptions.push(translationDialog);
}

//该方法将在插件禁用的时候调用（目前是在插件卸载的时候触发）
function deactivate() {

}
module.exports = {
	activate,
	deactivate
}