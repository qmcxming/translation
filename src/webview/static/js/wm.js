let dataList = [];
const tableDom = document.querySelector('#data-table');
const iptDialogDom = document.querySelector("#ipt-dialog");
const sourceDom = document.querySelector("#source");
const targetDom = document.querySelector("#target");
const dialogTitleDom = document.querySelector("#title");
const noDataDom = document.querySelector('#no-data');
const deleteRowDom = document.querySelector('#delete-row');
const idDom = document.querySelector('#dataId')
let checkedRows = [];

function renderTable() {
	tableDom.innerHTML = '';
	noDataDom.style.display = !dataList.length ? 'block' : 'none';
	dataList.forEach((item, index) => {
		const row = document.createElement('div');
		row.className = 'row';
		row.onclick = function() {
			if (this.classList.contains('selected')) {
				this.classList.remove('selected');
				checkedRows = checkedRows.filter(id => id !== item.id);
			} else {
				this.classList.add('selected');
				checkedRows.push(item.id);
			}
			// 排序 从小到大排序
			checkedRows.sort((a, b) => a - b);
			setDeleteRowDomStatus();
			console.log(checkedRows);
		}
		row.innerHTML = `
				<span>${index + 1}</span>
				<span class="original" data-index="${index}">${item.original}</span>
				<span style="color: #2196F3;"> → </span>
				<span>${item.translation}</span>
				<span>${item.time}</span>
			`;
		tableDom.appendChild(row);
		// 绑定row里面的 .original 事件 阻止冒泡
		const original = row.querySelector('.original');
		original.onclick = function(event) {
			event.stopPropagation();
			const index = this.getAttribute('data-index');
			console.log('打开对话框', index);
			sourceDom.value = dataList[index].original;
			targetDom.value = dataList[index].translation;
			idDom.value = dataList[index].id;
			iptDialogDom.style.opacity = '1';
			iptDialogDom.style.zIndex = '999';
			dialogTitleDom.innerHTML = '修改单词映射';
		};
		original.onmouseover = setSimpleTip
		original.onmouseout = function() {
			setSimpleTip(false);
		}
	});
}

function showDialog() {
	iptDialogDom.style.opacity = '1';
	iptDialogDom.style.zIndex = '999';
	sourceDom.value = '';
	targetDom.value = '';
	idDom.value = '';
	dialogTitleDom.innerHTML = '新增单词映射';
};

function saveWordMapping() {
	const original = sourceDom.value;
	const translation = targetDom.value;
	if (!original || !translation) {
		showToast('请输入完整信息')
		return;
	}
	if (idDom.value) {
		hbuilderx.postMessage({ command: 'update', original, translation, id: parseInt(idDom.value) });
	} else {
		hbuilderx.postMessage({ command: 'save', original, translation });
	}
	closeDialog();
	showToast(idDom.value ? '修改成功' : '新增成功');
}

deleteRowDom.onclick = () => {
	// 确定删除吗
	showWarning(`确定删除 <b>${checkedRows.length}</b> 条数据吗`);
}

function closeDialog() {
	iptDialogDom.style.opacity = '0';
	iptDialogDom.style.zIndex = '-1';
}

function setDeleteRowDomStatus() {
	deleteRowDom.disabled = checkedRows.length > 0 ? false : true;
	deleteRowDom.innerHTML = checkedRows.length ? `删除 ${checkedRows.length}` : '删除';
}

function setSimpleTip(mode = true) {
	if (mode) {
		// 保留三个字符，剩下用省略号代替
		const text = this.innerText;
		const tip = text.length > 3 ? text.slice(0, 3) + '...' : text;
		document.querySelector('#simple-tip').innerHTML = `🚀点击<b>${tip}</b>，修改单词映射`;
	} else {
		document.querySelector('#simple-tip').innerHTML = '';
	}
}

function initReceive() {
	hbuilderx.onDidReceiveMessage((res) => {
		const { data } = res;
		dataList = data;
		renderTable();
		console.log(res);
	});
}

/**
 * 显示提示框
 */
function showWarning(message) {
	const messageBox = document.getElementById('message-box');
	const overlay = document.getElementById('overlay');
	const msg = document.querySelector('.message-box-body p');
	msg.innerHTML = message;

	// 显示遮罩层和弹出框
	overlay.classList.remove('hidden', 'hide');
	overlay.classList.add('show');
	messageBox.classList.remove('hidden', 'hide');
	messageBox.classList.add('show');

	// 移除动画结束后的状态避免冲突
	messageBox.addEventListener('animationend', function handleAnimationEnd(event) {
		if (event.animationName === 'slide-in') {
			messageBox.style.opacity = 1; // 确保显示
			overlay.style.opacity = 1;
		}
		messageBox.removeEventListener('animationend', handleAnimationEnd);
	});
}

function closeMessageBox() {
	const messageBox = document.getElementById('message-box');
	const overlay = document.getElementById('overlay');
	// 隐藏弹出框和遮罩层
	messageBox.classList.remove('show');
	messageBox.classList.add('hide');
	overlay.classList.remove('show');
	overlay.classList.add('hide');

	// 动画完成后彻底隐藏
	messageBox.addEventListener('animationend', function handleAnimationEnd(event) {
		if (event.animationName === 'slide-out') {
			messageBox.classList.add('hidden'); // 完全隐藏
			messageBox.style.opacity = 0; // 确保隐藏
		}
		messageBox.removeEventListener('animationend', handleAnimationEnd);
	});
	overlay.addEventListener('animationend', function handleOverlayAnimationEnd(event) {
		if (event.animationName === 'fade-out') {
			overlay.classList.add('hidden');
		}
		overlay.removeEventListener('animationend', handleOverlayAnimationEnd);
	});
}

function confirmAction() {
	hbuilderx.postMessage({ command: 'delete', ids: checkedRows });
	checkedRows = [];
	setDeleteRowDomStatus();
	closeMessageBox();
	showToast('删除成功');
}


window.addEventListener("hbuilderxReady", initReceive);