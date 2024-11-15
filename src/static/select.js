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

document.onclick = function() {
	document.querySelectorAll('.dropdown').forEach(dropdown => {
		dropdown.classList.remove('show'); // 点击页面其他地方隐藏下拉框
	});
	document.querySelectorAll('.custom-select').forEach(select => {
		select.classList.remove('open'); // 移除打开类
	});
};