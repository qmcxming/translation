function copy() {
	const result = $('#result');
	if (isEmpty(result.value)) {
		showToast('请先翻译');
		return;
	}
	result.select();
	document.execCommand('copy');
	showToast('复制成功');
}

$('#text').onkeydown = (event) => {
	// 回车 翻译 
	if (!event.shiftKey && event.keyCode == 13) {
		event.cancelBubble = true;
		event.preventDefault();
		event.stopPropagation();
		toTranslate();
	}
}

// 监听ESC键
window.onkeydown = (event) => {
	if (event.keyCode == 27) {
		hbuilderx.postMessage({ command: 'close' });
	}
}

function clearText() {
	$('#text').value = '';
	$('#result').value = '';
	reset();
}

// 在默认浏览器中打开
function openLink(engine) {
	const text = $('#text').value;
	if (isEmpty(text)) {
		showToast('请先输入翻译内容');
		return;
	}
	// 发送webview消息
	hbuilderx.postMessage({ command: "openLink", engine: engine, text: text });
	hiddenPopup();
	console.log(engine);
}

const defaultUrl = $('#defaultUrl');

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
			$('#message').textContent = '';
			playSound(audio, ft);
			return;
		}
		const result = $('#result');
		// 回显
		if (content) {
			$('#text').value = content;
			toTranslate();
			return;
		}
		if (error) {
			result.value = '';
			reset(true);
			return showToast(error);
		};
		soundBtnEnabled();
		result.value = data.dst;
		// 设置auto模式下 检测的语种
		// [v1.5.3后阿里翻译可以使用,但不保证后续阿里翻译检测语种接口是否失效， 所以多做了判断]
		const detectLanguage = $('#detect-language');
		if ((data.from !== 'auto') && ($('#selectedLabel1').getAttribute('data-value') === 'auto')) {
			const ops = options.find(item => item.code === data.from);
			detectLanguage.textContent = ops.name;
			detectLanguage.setAttribute('data-value', ops.code);
		} else {
			detectLanguage.textContent = '';
			detectLanguage.setAttribute('data-value', '');
		}
		// 若阿里翻译语种检测接口失效，将返回的from为auto，禁用发音按钮
		if((data.from === 'auto') && (data.name === 'alibaba')) {
			const fromSound = $('#fromSound');
			fromSound.style.pointerEvents = 'none';fromSound.style.opacity = 0.5;
		}
		translationData = data;
		// 谷歌翻译特有的功能
		if (data.name === 'google') {
			googleUniqueFe(data);
		}
	});
}

// 音频按钮可用
function soundBtnEnabled() {
	const fromSound = $('#fromSound');
	const toSound = $('#toSound');
	// 音频置为可使用
	fromSound.style.pointerEvents = 'auto';fromSound.style.opacity = 1;
	toSound.style.pointerEvents = 'auto';toSound.style.opacity = 1;
	// 重置音频
	fromSound.setAttribute('url', '');
	toSound.setAttribute('url', '');
}

/**
 * 谷歌独有功能-显示音标及词义、词类、例句
 */
function googleUniqueFe(data) {
	$('#accordion-icon-google').style.opacity = 1;
	const { fromPhonetic, toPhonetic } = data.detail;
	$('#from-phonetic').textContent = fromPhonetic;
	$('#to-phonetic').textContent = toPhonetic;
	// 设置tooltip
	$('#from-phonetic-tip').textContent = fromPhonetic;
	$('#to-phonetic-tip').textContent = toPhonetic;
	// 在折叠面板展开时，才去更新折叠面板的内容，否则在点击打开折叠面板时，再去更新
	if ($('#accordion').classList.length === 2) {
		accordionUpdate();
	}
}

function toTranslate() {
	const text = $('#text').value;
	if (isEmpty(text)) {
		showToast('请输入要翻译的内容');
		return;
	};
	const from = $('#selectedLabel1').getAttribute('data-value');
	const to = autoChange(text, from, $('#selectedLabel2').getAttribute('data-value'), languageList);
	console.log(from, to);
	setSelectOption(from, to).then(() => {
		$('#result').value = '正在翻译中...';
		// 发送消息
		hbuilderx.postMessage({ command: 'translation', data: text, from: from, to: to });
		console.log(text);
	});
}

/**
 * 检测语言(是否为中文)
 * @param {String} word 文本
 */
function detectLanguageZh(word) {
	return /[\u4e00-\u9fa5]/gm.test(word);
}

// 一个简单的中英文语种自动切换
const autoChange = (text, from, to, languages) => {
  // 在语言表中，索引为1的是中文，索引为2的是英文
  // 判断text是否为中文
  if(detectLanguageZh(text) && to === languages[1].code && from !== 'wyw') {
    return languages[2].code;
  }
  // 判断text是否为英文
  if(!detectLanguageZh(text) && to === languages[2].code) {
    return languages[1].code;
  }
  return to;
}

window.addEventListener("hbuilderxReady", initReceive);

// 气泡框显示隐藏
document.addEventListener("DOMContentLoaded", function () {
	const button = $("#more");
	const popup = $("#popup");

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
	popup = popup ? popup : $('#popup');
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
		const text = ft === 'from' ? $('#text').value : $('#result').value;
		const fromSelect = $('#selectedLabel1').getAttribute('data-value');
		const language = ft === 'from' ? 
			(fromSelect === 'auto' ? $('#detect-language').getAttribute('data-value') : fromSelect) : 
			$('#selectedLabel2').getAttribute('data-value');
		// 没有音频URL时不继续执行
		$('#message').textContent = '正在获取音频...';
		hbuilderx.postMessage({ command: 'getAudio', data: text, ft: ft, language: language})
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
	audioElement.onended = function () {
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

function reset(flag = false) {
	const elements = [
		{ id: 'fromSound', phoneticId: 'from-phonetic' },
		{ id: 'toSound', phoneticId: 'to-phonetic' }
	];

	elements.forEach(element => {
		const el = document.getElementById(element.id);
		const phoneticEl = document.getElementById(element.phoneticId);

		el.setAttribute('url', '');
		checkSoundStatus(el, false);
		el.style.pointerEvents = flag ? 'auto' : 'none';
		el.style.opacity = flag ? 1 : 0.5;
		// 清除图标旋转
		el.style.animation = '';
		// el.setAttribute('src', defaultUrl.value + 'sound.svg');
		$('#message').textContent = '';// 清除加载信息
		phoneticEl.textContent = '';
	});
	// 音频置空
	audio1 = null;audio2 = null;audioElement1 = null;audioElement2 = null;
}