let dataList = [];
let checkedRows = [];

function renderTable() {
	const table = $('#data-table');
	table.innerHTML = '';
	$('#no-data').style.display = !dataList.length ? 'block' : 'none';
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
			setDeleteButtonStatus();
			console.log(checkedRows);
		}
		row.innerHTML = `
				<span>${index + 1}</span>
				<span class="original" data-index="${index}">${item.original}</span>
				<span style="color: #2196F3;"> → </span>
				<span>${item.translation}</span>
				<span>${item.time}</span>
			`;
		table.appendChild(row);
		// 绑定row里面的 .original 事件 阻止冒泡
		const original = row.querySelector('.original');
		original.onclick = function(event) {
			event.stopPropagation();
			const index = this.getAttribute('data-index');
			const dialog = $("#ipt-dialog");
			$('#source').value = dataList[index].original;
			$('#target').value = dataList[index].translation;
			$('#dataId').value = dataList[index].id;
			dialog.style.opacity = '1';
			dialog.style.zIndex = '999';
			$('#title').innerHTML = '修改单词映射';
		};
		original.onmouseover = setSimpleTip
		original.onmouseout = function() {
			setSimpleTip(false);
		}
	});
}

function showDialog() {
	const dialog = $("#ipt-dialog");
	dialog.style.opacity = '1';
	dialog.style.zIndex = '999';
	$('#source').value = '';
	$('#target').value = '';
	$('#dataId').value = '';
	$('#title').innerHTML = '新增单词映射';
};

function saveWordMapping() {
	const original = $('#source').value;
	const translation = $('#target').value;
	if (!original || !translation) {
		showToast('请输入完整信息')
		return;
	}
	const id = $('#dataId').value;
	if (id) {
		hbuilderx.postMessage({ command: 'update', original, translation, id: parseInt(id) });
	} else {
		hbuilderx.postMessage({ command: 'save', original, translation });
	}
	closeDialog();
	showToast(id ? '修改成功' : '新增成功');
}

function showMessageBox () {
	// 确定删除吗
	showWarning(`确定删除 <b>${checkedRows.length}</b> 条数据吗`);
}

function closeDialog() {
	const dialog = $('#ipt-dialog');
	dialog.style.opacity = '0';
	dialog.style.zIndex = '-1';
}

function setDeleteButtonStatus() {
	const deleteButton = $('#delete-row');
	deleteButton.disabled = checkedRows.length > 0 ? false : true;
	deleteButton.innerHTML = checkedRows.length ? `删除 ${checkedRows.length}` : '删除';
}

function setSimpleTip(mode = true) {
	const tip = $('#simple-tip');
	if (mode) {
		// 保留三个字符，剩下用省略号代替
		let text = this.innerText;
		text = text.length > 3 ? text.slice(0, 3) + '...' : text;
		tip.innerHTML = `🚀点击<b>${text}</b>，修改单词映射`;
	} else {
		tip.innerHTML = '';
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
	const messageBox = $('#message-box');
	const overlay = $('#overlay');
	const msg = $('.message-box-body p');
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
	const messageBox = $('#message-box');
	const overlay = $('#overlay');
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

function confirmDelete() {
	hbuilderx.postMessage({ command: 'delete', ids: checkedRows });
	checkedRows = [];
	setDeleteButtonStatus();
	closeMessageBox();
	showToast('删除成功');
}


window.addEventListener("hbuilderxReady", initReceive);