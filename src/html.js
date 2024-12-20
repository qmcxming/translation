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
			height: 485
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
			<link rel="stylesheet" href="${staticPath}/css/translation.css">
			<link rel="stylesheet" href="${staticPath}/css/select.css">
			<link rel="stylesheet" href="${staticPath}/css/accordion.css">
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
					/* position: absolute;
					right: -1px;
					bottom: 2px; */
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
					/* position: absolute;
					right: 0;
					bottom: 0; */
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
				
				.select-container {
					display: flex;
					justify-content: space-between;
				}
				
				.custom-select {
					flex: 2;
					display: flex;
				}
				
				.select-box {
					flex: 1;
					padding: 0 15px;
					display: flex;
					justify-content: center;
				}
				
				.exchange-icon {
					width: 20px;
				}
				
				.category-content, .example-item {
					text-indent: 1em;
				}
				
				.category-name, .example-text {
					font-weight: bold;
					font-style: italic;
				}
				
				.comma {
					color: #2196F3;
					margin: 0 5px 0 2px;
				}
				
				#example-container {
					display: none;
				}
				
				.mt-10 {
					margin-top: 10px;
				}
				
				.textarea-bottom-toolbar {
					width: 100%;
					position: absolute;
					bottom: 0;
					height: 30px;
					/* background-color: hotpink; */
					border-radius: 4px;
					display: flex;
					align-items: center;
					justify-content: space-between;
				}
			
				#from-phonetic, #to-phonetic {
					margin-left: 8px;
					max-width: 150px;
					font-size: 13px;
					/* 超出显示... */
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
				
				.tooltip {
					position: relative;
					display: inline-block;
				}
				
				.tooltip .tooltiptext {
					visibility: hidden;
					background-color: white;
					color: block;
					border-radius: 3px;
					padding: 5px;
					position: absolute;
					bottom: 100%;
					max-width: 180px;
					max-height: 240px;
					word-wrap:break-word;
					z-index: 1;
					text-align: center;
					overflow: auto;
				
					/* 向上弹出 */
					transform: translateY(20px);
					opacity: 0;
					transition: opacity 0.3s ease, transform 0.3s ease;
					box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
					border: 1px solid #eaeaea;
					font-size: 13px;
				}
				
				.tooltip:hover .tooltiptext {
					visibility: visible;
					opacity: 1;
					transform: translateY(0px);
				}
				
				#no-data {
					text-align: center;
					font-size: 14px;
					color: #999;
					display: none;
				}
			</style>
		</head>
		
		<body>
			<div class="select-container">
				<div class="custom-select" id="fromSelect">
					<div id="selectedLabel1">请选择</div>
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
				<div id="toast-container"></div>
				<div class="textarea-box">
					<textarea autofocus class="textarea" name="text" id="text" cols="30" rows="10"></textarea>
					<div class="textarea-bottom-toolbar">
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
					<span></span>
					<span class="accordion-icon">▶</span>
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
			<script src="${staticPath}/js/toast.js"></script>
			<script src="${staticPath}/js/select.js"></script>
			<script src="${staticPath}/languages/${translationEngine}-language.json"></script>
			<script>
				const options = languageList;
				let translationData = {};
				console.log(languageList);
				function initReceive() {
					// 接收消息
					hbuilderx.onDidReceiveMessage((res) => {
						console.log(res);
						const { data, error, content, from, to } = res;
						if (content) {
							document.getElementById('text').value = content;
							
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
						translationData = data;
						// 谷歌翻译特有的功能
						if (data.name === 'google') {
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
				
				async function setSelectOption(from, to) {
					const dropdown1 = document.getElementById('dropdown1');
					const selectOptions1 = dropdown1.getElementsByClassName('option');
					const selectedLabel1 = document.getElementById('selectedLabel1');
					setSelected(selectOptions1, dropdown1, selectedLabel1, from);
					
					const dropdown2 = document.getElementById('dropdown2');
					const selectOptions2 = dropdown2.getElementsByClassName('option');
					const selectedLabel2 = document.getElementById('selectedLabel2');
					setSelected(selectOptions2, dropdown2, selectedLabel2, to);
					await new Promise(resolve => setTimeout(resolve, 0)); // 确保每个操作按顺序完成
				}
				
				function setSelected(selectOptions, dropdown, selectedLabel, check) {
					for (let i = 0; i < selectOptions.length; i++) {
						const option = selectOptions[i];
						console.log('麻蛋', option.dataset.value);
						if (check === option.dataset.value) {
							console.log('选中');
							// 高亮显示被选中的选项
							const selectedOption = dropdown.querySelector('.option.selected');
							if (selectedOption) {
								selectedOption.classList.remove('selected'); // 移除之前的选中状态
							}
							selectedLabel.textContent = option.innerHTML;
							selectedLabel.setAttribute('data-value', option.dataset.value); // 设置data-value
							option.classList.add('selected');
						}
					}
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
				
				
				function createCustomSelect(selectId, labelId, dropdownId, defaultValue, filterFirstOption = false) {
					const customSelect = document.getElementById(selectId);
					const dropdown = document.getElementById(dropdownId);
					const selectedLabel = document.getElementById(labelId);
				
					// 动态生成选项
					options.forEach((option, index) => {
						if (filterFirstOption && index === 0) return; // 过滤掉第一个选项
						const div = document.createElement('div');
						div.className = 'option';
						div.textContent = option.name;
						div.setAttribute('data-value', option.code);
						// 设置默认值
						if (option.code === defaultValue) {
							selectedLabel.textContent = option.name;
							selectedLabel.setAttribute('data-value', option.code); // 设置data-value
							div.classList.add('selected');
						}
						dropdown.appendChild(div);
					});
				
					customSelect.onclick = function(e) {
						e.stopPropagation(); // 阻止事件冒泡
						const isOpen = dropdown.classList.toggle('show'); // 切换显示状态
						customSelect.classList.toggle('open', isOpen); // 添加或移除打开类
					};
				
					dropdown.onclick = function(e) {
						if (e.target.classList.contains('option')) {
							e.stopPropagation(); // 阻止事件冒泡
							selectedLabel.textContent = e.target.textContent;
							selectedLabel.setAttribute('data-value', e.target.getAttribute('data-value')); // 更新data-value
				
							// 高亮显示被选中的选项
							const selectedOption = dropdown.querySelector('.option.selected');
							if (selectedOption) {
								selectedOption.classList.remove('selected'); // 移除之前的选中状态
							}
							e.target.classList.add('selected'); // 添加选中状态
				
							dropdown.classList.remove('show'); // 隐藏下拉框
							customSelect.classList.remove('open'); // 移除打开类
						}
					};
				}
				
				createCustomSelect('fromSelect', 'selectedLabel1', 'dropdown1', 'auto');
				createCustomSelect('toSelect', 'selectedLabel2', 'dropdown2', 'zh', true);
				
				function toggleAccordion() {
					if(translationData.name !== 'google') {
						return;
					}
					const accordion = document.getElementById('accordion');
					accordion.classList.toggle('active');
					accordionUpdate();
				}
				
				function accordionUpdate() {
					if(JSON.stringify(translationData) !== "{}") {
						const exampleList = translationData.detail.example;
						const categoryList = translationData.detail.category;
						let str = '';
						if (categoryList.length > 0) {
							str = categoryList.map(item => {
								return '<div class=\"category-name\">'+ item.category +'</div>'
								+ '<div class=\"category-content\">'
								+ item.meaning.map(mean => {
									return '<div class=\"category-meaning\">' + mean[0] + '</div>'
									+ '<div class=\"category-meaning\">' 
									+ mean[1].join('<span class=\"comma\">,</span> ') + '</div>';
								}).join('')
								+ '</div>';
							}).join('');
						}
						document.getElementById('category-list').innerHTML = str;
						document.getElementById('example').innerHTML 
							= exampleList.length > 0 ? exampleList
								.map(item => '<p class=\"example-item\">' + item + '</p>')
								.join('') : '';
						const exampleContainer = document.getElementById('example-container');
						document.getElementById('no-data').style.display = 
							(!exampleList.length && !categoryList.length) ? 'block' : 'none';
						exampleContainer.style.display = exampleList.length ? 'block' : 'none';
					} else {
						document.getElementById('no-data').style.display = 'block';
					}
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
				msg.from,
				msg.to,
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