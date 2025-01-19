const hx = require("hbuilderx");
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
// const { EdgeTTS } = require('node-edge-tts');

const { translate, getLanguagePair, audio } = require('../translate');
const { getTranslationEngine, getSecret, getGoogleServerUrl, getAlibabaVS } = require('../settings');
const { getCacheUrl } = require('../cache');
const { getMapping } = require('./wordmp');

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
			const { from, to } = getLanguagePair(text);
			setTimeout(() => {
				webview.postMessage({ content: text, from: from, to: to });
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
			height: 500
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
			<link rel="stylesheet" href="${staticPath}/css/common.css">
			<link rel="stylesheet" href="${staticPath}/css/translation.css">
			<link rel="stylesheet" href="${staticPath}/css/select.css">
			<link rel="stylesheet" href="${staticPath}/css/accordion.css">
			<link rel="stylesheet" href="${staticPath}/css/translation.css">
		</head>
		
		<body>
			<div class="select-container">
				<div class="custom-select" id="fromSelect">
					<div id="selectedLabel1">请选择</div>
					<div id="detect-language"></div>
					<div class="arrow"></div> <!-- 箭头 -->
				<div class="dropdown" id="dropdown1"></div>
				</div>
				<div class="select-box">
					<img onclick="exchange()" class="exchange-icon" src="${staticPath}/icons/exchange.svg" alt="交换">
				</div>
				<div class="custom-select" id="toSelect">
					<div id="selectedLabel2">请选择</div>
					<div class="arrow"></div> <!-- 箭头 -->
					<div class="dropdown" id="dropdown2"></div>
				</div>
			</div>
			<div id="container">
				<!-- 隐藏输入框，存放默认icons路径 -->
				<input type="text" value="${staticPath}/icons/" id="defaultUrl" style="display:none;">
				<div id="toast-container"></div>
				<div class="textarea-box">
					<textarea autofocus class="textarea" oninput="inputChange(this, 'from')" name="text" id="text" cols="30" rows="10"></textarea>
					<div class="textarea-bottom-toolbar">
						<img onclick="playSound(this, 'from')" id="fromSound" class="sound-icon" url="" src="${staticPath}/icons/sound.svg" alt="发音">
						<div class="tooltip">
							<div id="from-phonetic"></div>
							<span id="from-phonetic-tip" class="tooltiptext"></span>
						</div>
						<img class="delete-icon" src="${staticPath}/icons/delete.svg" alt="清空" onclick="clearText()">
					</div>
				</div>
				<div class="feature">
						<button onclick="toTranslate()">翻译</button>
						<img src="${staticPath}/icons/icon.svg" alt="图标">
						<button class="button--plain" onclick="copy()">复制</button>
				</div>
				<div class="textarea-box">
					<textarea class="textarea" name="result" id="result" cols="30" rows="10" readonly></textarea>
					<div class="textarea-bottom-toolbar">
						<img onclick="playSound(this, 'to')" id="toSound" class="sound-icon" url="" src="${staticPath}/icons/sound.svg" alt="发音">
						<div class="tooltip">
							<div id="to-phonetic"></div>
							<span id="to-phonetic-tip" class="tooltiptext"></span>
						</div>
						<button id="more" class="more button--plain">更多</button>
					</div>
					<div id="popup" class="popup hidden">
						<div class="popup-item" onclick="openLink('baidu')">百度</div>
						<div class="popup-item" onclick="openLink('google')">谷歌</div>
						<div class="popup-item" onclick="openLink('youdao')">有道</div>
					</div>
				</div>
			</div>
			<div class="accordion" id="accordion">
				<div class="accordion-header" onclick="toggleAccordion()">
					<span id="message"></span>
					<span id="accordion-icon-google" class="accordion-icon">▶</span>
				</div>
				<div class="accordion-content" id="accordion-content">
					<div id="no-data">暂无</div>
					<div class="accordion-item">
						<div id="category-list"></div>
					</div>
					<div id="example-container" class="accordion-item">
						<div class="example-text mt-10">示例</div>
						<div id="example"></div>
					</div>
				</div>
			</div>
			<script>
				// 保证其他js文件也可以使用该全局变量，如 accordion.js中使用
				let translationData = {};
				
				let audioElement1;
				let audioElement2;
				let audio1;
				let audio2;
			</script>
			<script src="${staticPath}/js/toast.js"></script>
			<script src="${staticPath}/js/select.js"></script>
			<script src="${staticPath}/js/common.js"></script>
			<script src="${staticPath}/js/accordion.js"></script>
			<script src="${staticPath}/languages/${translationEngine}-language.json"></script>
			<script src="${staticPath}/js/translation.js"></script>
		</body>
		
		</html>`;
	webview.onDidReceiveMessage((msg) => {
		console.log(msg);
		if (msg.command == 'translation') {
			const { appId, secretKey } = getSecret();
			const { version, scene } = getAlibabaVS();
			const { from, to, data } = msg;
			translate(
				data,
				translationEngine,
				appId,
				secretKey,
				from,
				to,
				getGoogleServerUrl(),
				version,
				scene
			).then(res => {
				// 为了兼顾其他功能，翻译对话框的单词映射功能，不止返回映射结果，还返回翻译结果
				const mp = getMapping(data);
				if (mp) {
					res.dst = mp;
					res.detail.toPhonetic = '';
				};
				webview.postMessage({ data: res });
			}).catch(e => {
				webview.postMessage(e);
			});
		}
		if (msg.command === 'openLink') {
			openLink(msg.engine, msg.text);
		}
		if (msg.command === 'getAudio') {
			getAudio(msg.data, msg.language).then(res => {
				console.log(res);
				webview.postMessage({ data: res, ft: msg.ft });
			}).catch(e => {
				webview.postMessage(e);
			});
		}
		if(msg.command === 'close') {
			webviewDialog.close();
		}
	});

	let promi = webviewDialog.show();
	promi.then(function(data) {
		// 处理错误信息
	});
}

function generateMD5(input) {
	const hash = crypto.createHash('md5');
	hash.update(input);
	return hash.digest('hex');
}

// TODO node-edge-tts 存在bug，有时会出现音频无法返回的问题
// 替代方案 https://github.com/wxxxcxx/ms-ra-forwarder
async function getAudio(data, language) {
	const timestamp = Date.now();
	const audioCacheDir = getCacheUrl('audio');
	// 缓存，减少请求次数
	let audioUrl = path.join(audioCacheDir, `${generateMD5(data + language)}.mp3`)
	if (fs.existsSync(audioUrl)) {
		console.log('使用缓存audio咯');
		return audioUrl;
	}
	// 清理audio前一天的文件
	const files = fs.readdirSync(audioCacheDir);
	files.forEach(file => {
		const filePath = path.join(audioCacheDir, file);
		const fileStat = fs.statSync(filePath);
		const fileTime = fileStat.mtime.getTime();
		// 删除24小时前的文件
		if (fileTime < (timestamp - 24 * 60 * 60 * 1000)) {
			fs.unlinkSync(filePath);
		}
	});
	// const tts = new EdgeTTS();
	// try {
	// 	await tts.ttsPromise(data, audioUrl).then(() => {
	// 		console.log('tts成功')
	// 	})
	// } catch(e){
	// 	return e;
	// }
	try {
		const arrayBuffer = await audio(data, language);
		const buffer = Buffer.from(arrayBuffer);
		fs.writeFileSync(audioUrl, buffer);
	}catch(e){
		console.log(e);
		return Promise.reject(e);
	}
	
	return audioUrl;
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