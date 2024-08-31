const hx = require("hbuilderx");
const path = require('path');
const { translationService, getLanguagePair } = require('./translate');
const { getTranslationEngine, getSecret, getGoogleServerUrl, getAlibabaVS } = require('./settings');

const staticPath = path.join(__dirname, 'static');

/**
 * 显示翻译对话框
 */
function showTranslationDialog() {
	const translationEngine = getTranslationEngine();
	const editorPromise = hx.window.getActiveTextEditor();
	editorPromise.then(editor => {
		const selection = editor.selection;
		// 获取文本
		const text = editor.document.getText(selection);
		// 有选中文本时，再去发送消息给webview
		if (text.trim() !== '') {
			// 使用定时器解决webview页面载入无法接收问题
			setTimeout(() => {
				webview.postMessage({ content: text });
			}, 500);
		}
	})
	let te;
	if (translationEngine === 'Alibaba') {
		const { version } = getAlibabaVS();
		te = `${translationEngine}(${version === 'general' ? '通用版' : '专业版'})`;
	}
	const webviewDialog = hx.window.createWebViewDialog({
		modal: false,
		title: '<span style="color: #409EFF;font-weight: bold;">翻译</span>',
		description: te ? te : translationEngine,
		size: {
			width: 630,
			height: 400
		}
	}, {
		enableScripts: true
	});
	const webview = webviewDialog.webView;
	webview.html = `
		<!DOCTYPE html>
		<html lang="en">
		
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>翻译</title>
			<link rel="stylesheet" href="${staticPath}/translation.css">
			<style>
				#container {
					display: flex;
					justify-content: space-evenly;
				}

				.textarea-box {
					position: relative;
					flex: 2;
				}
				
				.delete-icon {
					width: 20px;
					height: 20px;
					position: absolute;
					right: -1px;
					bottom: 2px;
					cursor: pointer;
				}
				
				.textarea {
					/* 限制拖动大小 */
					resize: none;
					width: 100%;
					height: 100%;
				}

				.feature {
					flex: 1;
					display: flex;
					flex-direction: column;
					justify-content: space-between;
					padding: 0 10px;
				}
				.more {
					position: absolute;
					right: 0;
					bottom: 0;
					width: 30px;
					height: 30px;
					text-align: center;
					font-size: 10px;
					padding: 0;
				}
			
				.popup {
					position: absolute;
					border: 1px solid #efefef;
					box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
					background-color: #FFFFFF;
					/* padding: 15px; */
					border-radius: 5px;
					width: 50px;
					text-align: center;
					opacity: 0;
					transform: translateY(20px);
					transition: opacity 0.3s ease, transform 0.3s ease;
					bottom: 40px;
					right: 0px;
				}
			
				.popup.visible {
					opacity: 1;
					transform: translateY(0);
				}
			
				.hidden {
					display: none;
				}
			
				.popup-item {
					margin: 5px 0;
					padding: 5px;
					cursor: pointer;
					color: #1f2f3d;
					border-bottom: 1px solid #efefef;
				}
			
				.popup-item:last-child {
					border-bottom: none;
				}
			
				.popup .popup-item:hover {
					background-color: #ECF5FF;
					color: #409EFF;
				}
			</style>
		</head>
		
		<body>
			<div id="container">
				<div id="toast-container"></div>
				<div class="textarea-box">
					<textarea autofocus class="textarea" name="text" id="text" cols="30" rows="10"></textarea>
					<img class="delete-icon" src="${staticPath}/icons/delete.svg" alt="清空" onclick="clearText()">
				</div>
				<div class="feature">
						<button onclick="toTranslate()">翻译</button>
						<img src="${staticPath}/icons/icon.svg" alt="图标">
						<button class="button--plain" onclick="copy()">复制</button>
				</div>
				<div class="textarea-box">
					<textarea class="textarea" name="result" id="result" cols="30" rows="10" readonly></textarea>
					<button id="more" class="more button--plain">更多</button>
					<div id="popup" class="popup hidden">
						<div class="popup-item" onclick="openLink('baidu')">百度</div>
						<div class="popup-item" onclick="openLink('google')">谷歌</div>
						<div class="popup-item" onclick="openLink('youdao')">有道</div>
					</div>
				</div>
			</div>
			<script src="${staticPath}/toast.js"></script>
			<script>
				function initReceive() {
					// 接收消息
					hbuilderx.onDidReceiveMessage((res) => {
						console.log(res);
						const { data, error, content } = res;
						if (content) {
							document.getElementById('text').value = content;
							toTranslate();
							return;
						}
						if (error) {
							document.getElementById('result').value = '';
							return showToast(error);
						};
						document.getElementById('result').value = data.dst;
					});
				}
			
				function toTranslate() {
					const text = document.getElementById('text').value;
					if (isEmpty(text)) {
						showToast('请输入要翻译的内容');
						return;
					};
					document.getElementById('result').value = '正在翻译中...';
					// 发送消息
					hbuilderx.postMessage({ command: 'translation', data: text });
					console.log(text);
				}
				
				function copy() {
					const result = document.getElementById('result');
					if (isEmpty(result.value)) {
						showToast('请先翻译');
						return;
					}
					result.select();
					document.execCommand('copy');
					showToast('复制成功');
				}
				
				document.getElementById('text').onkeydown = (event) => {
					// 回车 翻译 
					if (!event.shiftKey && event.keyCode == 13) {
						event.cancelBubble = true;
						event.preventDefault();
						event.stopPropagation();
						toTranslate();
					}
				}
				
				// 判空
				function isEmpty(str) { return !str || str.trim() === ''; }
				
				function clearText() {
					const text = document.getElementById('text');
					if (isEmpty(text.value)) return;
					text.value = '';
					document.getElementById('result').value = '';
				}
				window.addEventListener("hbuilderxReady", initReceive);
				
				// 气泡框显示隐藏
				document.addEventListener("DOMContentLoaded", function () {
					const button = document.getElementById("more");
					const popup = document.getElementById("popup");
			
					button.addEventListener("click", function () {
						if (popup.classList.contains("hidden")) {
							popup.classList.remove("hidden");
							setTimeout(() => {
								popup.classList.add("visible");
							}, 10);
						} else {
							popup.classList.remove("visible");
							setTimeout(() => {
								popup.classList.add("hidden");
							}, 300);
						}
					});
			
					document.addEventListener("click", function (event) {
						if (!popup.contains(event.target) && event.target !== button) {
							hiddenPopup(popup);
						}
					});
				});
				
				function hiddenPopup(popup) {
					popup = popup ? popup : document.getElementById("popup");
					popup.classList.remove("visible");
					setTimeout(() => {
						popup.classList.add("hidden");
					}, 300);
				}
			
				function openLink(engine) {
					const text = document.getElementById("text").value;
					if (isEmpty(text)) {
						showToast('请先输入翻译内容');
						return;
					}
					// 发送webview消息
					hbuilderx.postMessage({ command: "openLink", engine: engine, text: text });
					hiddenPopup();
					console.log(engine);
				}
			</script>
		</body>
		
		</html>`;
	webview.onDidReceiveMessage((msg) => {
		console.log(msg);
		if (msg.command == 'translation') {
			const { appId, secretKey } = getSecret();
			translationService(
				msg.data,
				translationEngine,
				appId,
				secretKey,
				getGoogleServerUrl()
			).then(res => {
				webview.postMessage({ data: res });
			}).catch(e => {
				webview.postMessage({ error: e });
			});
		}
		if (msg.command === 'openLink') {
			openLink(msg.engine, msg.text);
		}
	});

	let promi = webviewDialog.show();
	promi.then(function(data) {
		// 处理错误信息
	});
}

function openLink(engine, text) {
	let url = 'https://translate.google.com';
	const { from, to } = getLanguagePair(text);
	switch(engine) {
		case 'baidu':
			url = `https://fanyi.baidu.com/mtpe-individual/multimodal?query=${text}&lang=${from}2${to}`;
			break;
		case 'google':
			const g = getGoogleServerUrl(engine);
			// 本地配置代理地址，则使用代理地址，否则，使用原地址
			url = (g ? g : url) + `?sl=${from}&tl=${to}&text=${text}&op=translate`;
			break;
		case 'youdao':
			url = `https://www.youdao.com/result?word=${text}&lang=en`;
			break;
	}
	hx.env.openExternal(url);
}

module.exports = {
	showTranslationDialog
}