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
	reset();
}

// 在默认浏览器中打开
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