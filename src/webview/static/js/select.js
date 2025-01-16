// 交换
function exchange() {
	const fromSelect = document.getElementById('fromSelect');
	const toSelect = document.getElementById('toSelect');
	const fromSelectedLabel = document.getElementById('selectedLabel1');
	const toSelectedLabel = document.getElementById('selectedLabel2');

	const fromSelectedOption = fromSelect.querySelector('.option.selected');
	const toSelectedOption = toSelect.querySelector('.option.selected');
	const fromSelectOption = fromSelect.querySelectorAll('.option');
	const toSelectOption = toSelect.querySelectorAll('.option');

	if (fromSelectedOption && toSelectedOption) {
		// fromLabel和toLabel的文本交换
		const tempText = fromSelectedLabel.textContent;
		const tempCode = fromSelectedLabel.getAttribute('data-value');
		fromSelectedLabel.textContent = toSelectedLabel.textContent;
		fromSelectedLabel.setAttribute('data-value', toSelectedLabel.getAttribute('data-value'));
		toSelectedLabel.textContent = tempText;
		toSelectedLabel.setAttribute('data-value', tempCode);
		// 选中交换
		// from
		for (let i = 0; i < fromSelectOption.length; i++) {
			if (fromSelectOption[i].textContent === fromSelectedLabel.textContent) {
				fromSelectedOption.classList.remove('selected');
				fromSelectOption[i].classList.add('selected');
			}
		}
		// to
		for (let i = 0; i < toSelectOption.length; i++) {
			// 自动检测过滤处理
			if (toSelectedLabel.textContent === '自动检测' ||
				fromSelectedLabel.textContent === toSelectedLabel.textContent) {
				// 选择第一个
				toSelectedLabel.textContent = toSelectOption[0].textContent;
				toSelectedLabel.setAttribute('data-value', toSelectOption[0].getAttribute('data-value'));
				toSelectedOption.classList.remove('selected');
				toSelectOption[0].classList.add('selected');
				// 左右select的选中值一样，默认选中第一个
				if (fromSelectedLabel.textContent === toSelectedLabel.textContent) {
					// 选中下一个
					toSelectedLabel.textContent = toSelectOption[i + 1].textContent;
					toSelectedLabel.setAttribute('data-value', toSelectOption[i + 1].getAttribute('data-value'));
					toSelectedOption.classList.remove('selected');
					toSelectOption[i + 1].classList.add('selected');
				}
			}
			if (toSelectOption[i].textContent === toSelectedLabel.textContent) {
				toSelectedOption.classList.remove('selected');
				toSelectOption[i].classList.add('selected');
			}
		}
	}
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
			// 非auto 清除检测出的语种
			if ((labelId === 'selectedLabel1') && (e.target.getAttribute('data-value') !== 'auto')) {
				document.getElementById('detect-language').textContent = '';
			}
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

document.onclick = function() {
	document.querySelectorAll('.dropdown').forEach(dropdown => {
		dropdown.classList.remove('show'); // 点击页面其他地方隐藏下拉框
	});
	document.querySelectorAll('.custom-select').forEach(select => {
		select.classList.remove('open'); // 移除打开类
	});
};