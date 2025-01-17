const hx = require("hbuilderx");
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { EdgeTTS } = require('node-edge-tts');

const { translate, getLanguagePair } = require('../translate');
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
			<script>
				const defaultUrl = document.getElementById('defaultUrl');
			
				const options = languageList;
				console.log(languageList);
				function initReceive() {
					// 接收消息
					hbuilderx.onDidReceiveMessage((res) => {
						console.log(res);
						const { data, error, content, from, to, ft } = res;
						// 音频
						if ((ft === 'from') || (ft === 'to')) {
							const audio = document.getElementById(ft + 'Sound');
							audio.setAttribute('url', data);
							loadingStatus(audio, false);
							document.getElementById('message').textContent = '';
							playSound(audio, ft);
							return;
						}
						// 回显
						if (content) {
							document.getElementById('text').value = content;
							// to音频置为可使用
							document.getElementById('fromSound').style.pointerEvents = 'auto';
							document.getElementById('fromSound').style.opacity = 1;
							setSelectOption(from, to).then(() => {
								console.log('选中完成，执行下面的代码');
								toTranslate();
							});
							return;
						}
						if (error) {
							document.getElementById('result').value = '';
							return showToast(error);
						};
						document.getElementById('result').value = data.dst;
						// to音频置为可使用
						document.getElementById('toSound').style.pointerEvents = 'auto';
						document.getElementById('toSound').style.opacity = 1;
						// 重置音频
						document.getElementById('fromSound').setAttribute('url', '');
						document.getElementById('toSound').setAttribute('url', '');
						// 设置auto模式下 检测的语种[阿里翻译不能使用, 所以多做了判断]
						const detectLanguage = document.getElementById('detect-language');
						if((data.from !== 'auto') && (document.getElementById('selectedLabel1').getAttribute('data-value') === 'auto')) {
							detectLanguage.textContent = options.find(item => item.code === data.from).name;
						} else {
							detectLanguage.textContent = '';
						}
						translationData = data;
						// 谷歌翻译特有的功能
						if (data.name === 'google') {
							document.getElementById('accordion-icon-google').style.opacity = 1;
							const { fromPhonetic, toPhonetic } = data.detail;
							const fromPhoneticDom = document.getElementById('from-phonetic');
							const toPhoneticDom = document.getElementById('to-phonetic');
							fromPhoneticDom.textContent = fromPhonetic;
							toPhoneticDom.textContent = toPhonetic;
							// 设置tooltip
							document.getElementById('from-phonetic-tip').textContent = fromPhonetic;
							document.getElementById('to-phonetic-tip').textContent = toPhonetic;
							// 在折叠面板展开时，才去更新折叠面板的内容，否则在点击打开折叠面板时，再去更新
							if (document.getElementById('accordion').classList.length === 2) {
								//console.log(document.getElementById('accordion').classList);
								accordionUpdate();
							}
						}
					});
				}
			
				function toTranslate() {
					const text = document.getElementById('text').value;
					const from = document.getElementById('selectedLabel1').getAttribute('data-value');
					const to = document.getElementById('selectedLabel2').getAttribute('data-value');
					console.log(from, to);
					if (isEmpty(text)) {
						showToast('请输入要翻译的内容');
						return;
					};
					document.getElementById('result').value = '正在翻译中...';
					// 发送消息
					hbuilderx.postMessage({ command: 'translation', data: text, from: from, to: to });
					console.log(text);
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
				
				createCustomSelect('fromSelect', 'selectedLabel1', 'dropdown1', 'auto');
				createCustomSelect('toSelect', 'selectedLabel2', 'dropdown2', languageList[1].code, true);
				
				function playSound(audio, ft) {
					const audioUrl = audio.getAttribute('url');
			
					// 选择音频元素和全局音频对象
					const targetAudio = (ft === 'from') ? audio1 : audio2;
					const targetAudioElement = (ft === 'from') ? audioElement1 : audioElement2;
			
					// 如果音频没有url，发起请求
					if (isEmpty(audioUrl)) {
						console.log('请求audio数据');
						// 数据格式：{ command: "getAudio", data: text, ft: ft }
						loadingStatus(audio, true);
						const text = ft === 'from' ? document.getElementById('text').value : document.getElementById('result').value;
						// 没有音频URL时不继续执行
						document.getElementById('message').textContent = '正在获取音频...';
						hbuilderx.postMessage({ command: 'getAudio', data: text, ft: ft })
						return;
					}
					
					// 如果当前音频正在播放，暂停(即，再次点击暂停)
					if (targetAudioElement && !targetAudioElement.paused) {
						targetAudioElement.pause();
						if (targetAudio) checkSoundStatus(targetAudio, false);
						return;
					}
			
					// 如果另一方的音频正在播放，暂停
					const otherAudioElement = (ft === 'from') ? audioElement2 : audioElement1;
					const otherAudio = (ft === 'from') ? audio2 : audio1;
			
					if (otherAudioElement && !otherAudioElement.paused) {
						otherAudioElement.pause();
						if (otherAudio) checkSoundStatus(otherAudio, false);
					}
			
					// 更新当前播放状态
					console.log('开始播放');
					checkSoundStatus(audio, true);
			
					// 播放音频
					const audioElement = new Audio(audioUrl);
					if (ft === 'from') {
						audioElement1 = audioElement;
						audio1 = audio;
					} else {
						audioElement2 = audioElement;
						audio2 = audio;
					}
			
					audioElement.play();
					audioElement.onended = function() {
						console.log('播放结束');
						// 播放结束后，移除播放状态
						checkSoundStatus(audio, false);
					};
				}
				
				// 加载状态切换
				function loadingStatus(audio, status) {
					if (status) {
						audio.src = defaultUrl.value + 'loading.svg';
						audio.style.pointerEvents = 'none';
						audio.style.opacity = 0.5;
						// 图标旋转
						audio.style.animation = 'spin 1s linear infinite';
					} else {
						audio.style.pointerEvents = 'auto';
						audio.style.opacity = 1;
						audio.style.animation = '';
					}
				}
				
				function checkSoundStatus(audio, isPlaying) {
					if (isPlaying) {
						audio.setAttribute('src', defaultUrl.value + 'end.svg');
						audio.style.transform = 'scale(1.4)'; // 放大
						setTimeout(() => {
							audio.style.transform = 'scale(1)'; // 恢复初始大小
						}, 500); // 与过渡时间一致
					} else {
						audio.setAttribute('src', defaultUrl.value + 'sound.svg');
					}
				}
				
				function inputChange(textarea, ft) {
					const sound = document.getElementById(ft + 'Sound')
					// 输入框的文本变化，就清理掉之前的音频
					sound.setAttribute('url', '');
					// 文本框为空时，禁用按钮
					if (textarea.value.length === 0) {
						sound.style.pointerEvents = 'none';
						sound.style.opacity = 0.5;
					} else {
						sound.style.pointerEvents = 'auto';
						sound.style.opacity = 1;
					}
				}
				
				function reset() {
					const elements = [
						{ id: 'fromSound', phoneticId: 'from-phonetic' },
						{ id: 'toSound', phoneticId: 'to-phonetic' }
					];
				
					elements.forEach(element => {
						const el = document.getElementById(element.id);
						const phoneticEl = document.getElementById(element.phoneticId);
				
						el.setAttribute('url', '');
						el.style.pointerEvents = 'none';
						el.style.opacity = 0.5;
						// 清除图标旋转
						el.style.animation = '';
						el.setAttribute('src', defaultUrl.value + 'sound.svg');
						document.getElementById('message').textContent = '';// 清除加载信息
						phoneticEl.textContent = '';
					});
					// 音频置空
					audio1 = null;
					audio2 = null;
					audioElement1 = null;
					audioElement2 = null;
				}
			</script>
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
			getAudio(msg.data, msg.ft).then(res => {
				console.log(res);
				webview.postMessage({ data: res, ft: msg.ft });
			}).catch(e => {
				webview.postMessage(e);
			});
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

async function getAudio(data, ft) {
	const timestamp = Date.now();
	const audioCacheDir = getCacheUrl('audio');
	// 缓存，减少请求次数
	let audioUrl = path.join(audioCacheDir, `${generateMD5(data)}.mp3`)
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
	const tts = new EdgeTTS();
	try {
		await tts.ttsPromise(data, audioUrl).then(() => {
			console.log('tts成功')
		})
	} catch(e){
		return e;
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