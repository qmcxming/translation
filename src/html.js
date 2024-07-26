const hx = require("hbuilderx");
const path = require('path');
const { translationService } = require('./translate');
const { getTranslationEngine, getSecret, getGoogleServerUrl } = require('./settings');

const staticPath = path.join(__dirname, 'static');

/**
 * 显示翻译对话框
 */
function showTranslationDialog() {
	const translationEngine = getTranslationEngine();
	const webviewDialog = hx.window.createWebViewDialog({
		modal: false,
		title: '<span style="color: #409EFF;font-weight: bold;">翻译</span>',
		description: translationEngine,
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
			</style>
		</head>
		
		<body>
			<div id="container">
				<div id="toast-container"></div>
				<div class="textarea-box">
					<textarea class="textarea" name="text" id="text" cols="30" rows="10"></textarea>
					<img class="delete-icon" src="${staticPath}/icons/delete.svg" alt="清空" onclick="clearText()">
				</div>
				<div class="feature">
						<button onclick="toTranslate()">翻译</button>
						<img src="${staticPath}/icons/icon.svg" alt="图标">
						<button class="button--plain" onclick="copy()">复制</button>
				</div>
				<div class="textarea-box">
					<textarea class="textarea" name="result" id="result" cols="30" rows="10" readonly></textarea>
				</div>
			</div>
			<script src="${staticPath}/toast.js"></script>
			  <script>
				function initReceive() {
					// 接收消息
					hbuilderx.onDidReceiveMessage((res) => {
						console.log(res);
						const { data, error } = res;
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
	});

	let promi = webviewDialog.show();
	promi.then(function(data) {
		// 处理错误信息
	});
}

module.exports = {
	showTranslationDialog
}