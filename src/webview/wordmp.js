const hx = require("hbuilderx");
const fs = require('fs');
const path = require('path');

const { getCacheUrl } = require('../cache');

const staticPath = path.join(__dirname, 'static');

function readData() {
	const url = path.join(getCacheUrl(), 'wordMapping.json');
	console.log(url);
	if (!fs.existsSync(url)) {
		// 创建wordMapping.json文件写入 []
		fs.writeFileSync(url, '[]');
	}
	const data = fs.readFileSync(url, 'utf-8');
	return JSON.parse(data);
}

// 获取映射
function getMapping(text) {
	const data = readData();
	const result = data.find(item => item.original === text);
	return result ? result.translation : null;
}

// 更新
function updateData(id, newData) {
	const filePath = path.join(getCacheUrl(), 'wordMapping.json');
	const data = readData();
	const index = data.findIndex(item => item.id === id);
	if (index !== -1) {
		// 更新数据
		data[index] = { ...data[index], ...newData };
		fs.writeFileSync(filePath, JSON.stringify(data));
		console.log(`数据 id=${id} 更新成功`);
	} else {
		console.log(`未找到 id=${id} 的数据`);
	}
}

// 新增
function addData(newItem) {
	const filePath = path.join(getCacheUrl(), 'wordMapping.json');
	const data = readData();

	// 自动生成id
	const maxId = data.length > 0 ? Math.max(...data.map(item => item.id)) : 0;
	newItem.id = maxId + 1;
	// 加一条时间 格式为 2023-11-16 14:30:00
	newItem.time = new Date().toLocaleString('zh-CN', { hour12: false });

	// 追加新数据到数组
	data.push(newItem);

	fs.writeFileSync(filePath, JSON.stringify(data));
	console.log(`新增数据 id=${newItem.id} 成功`);
}

// 删除
function deleteDataByIds(ids) {
	const filePath = path.join(getCacheUrl(), 'wordMapping.json');
	const data = readData();
	const newData = data.filter(item => !ids.includes(item.id));

	fs.writeFileSync(filePath, JSON.stringify(newData));
	console.log(`删除数据 id=${ids} 成功`);
}

/**
 * 显示单词映射对话框
 */
function showWordMappingDialog() {
	const webviewDialog = hx.window.createWebViewDialog({
		modal: false,
		title: '<span style="color: #409EFF;font-weight: bold;">单词映射</span>',
		description: '<span style="color: #F0BC68;">为确保翻译精准无误，仅当出现完全匹配的情况时，才会执行以下对应的映射转换</span>',
		size: {
			width: 630,
			height: 540
		}
	}, {
		enableScripts: true
	});
	const webview = webviewDialog.webView;

	// 读取缓存数据
	const dataList = readData();
	// TODO 后续统一一下postMessage封装成一个函数 html.js也有使用到的
	setTimeout(() => {
		webview.postMessage({ data: dataList });
	}, 500)
	webview.onDidReceiveMessage((msg) => {
		const { command, id, original, translation, ids } = msg;
		switch (command) {
			case 'save':
				addData({ original, translation })
				break;
			case 'update':
				updateData(id, {
					original,
					translation,
					time: new Date().toLocaleString('zh-CN', { hour12: false })
				})
				break;
			case 'delete':
				deleteDataByIds(ids);
		}
		webview.postMessage({ data: readData() });
		console.log(msg);
	});
	webview.html = `
	<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>单词映射</title>
		<link rel="stylesheet" href="${staticPath}/css/wm.css">
	</head>
	<body>
	<div class="container">
		<div id="data-table">
		
		</div>
		<div id="no-data">暂无数据</div>
	</div>
	<div class="tool-container">
		<div class="tool">
			<button id="add-row">添加</button>
			<button id="delete-row" disabled>删除</button>
		</div>
	</div>
	<div class="dialog" id="ipt-dialog">
		<div class="dialog-content">
			<div class="dialog-title">
				<span id="title">单词映射</span>
				<span id="close">×</span>
			</div>
			<div class="dialog-body">
				<div class="dialog-row dr1">
					<input type="hidden" value="" id="dataId" />
					<textarea id="source" placeholder="请输入源单词"></textarea>
					<span style="color: #2196F3;padding: 0 5px;">→</span>
					<textarea id="target" placeholder="请输入目标单词"></textarea>
				</div>
				<div class="dialog-row dr2">
					<button id="save">保存</button>
					<button class="button--plain" id="cancel">取消</button>
				</div>
			</div>
		</div>
	</div>
	<div id="simple-tip"></div>
	<script src="${staticPath}/js/wm.js"></script>
	</body>
	</html>
	`;

	let promi = webviewDialog.show();
	promi.then(function(data) {
		// 处理错误信息
	});
}

module.exports = {
	showWordMappingDialog,
	getMapping
}