// 底部折叠栏(手风琴)

function toggleAccordion() {
	if (translationData.name !== 'google') {
		return;
	}
	const accordion = document.getElementById('accordion');
	accordion.classList.toggle('active');
	accordionUpdate();
}

function accordionUpdate() {
	if (JSON.stringify(translationData) !== "{}") {
		const exampleList = translationData.detail.example;
		const categoryList = translationData.detail.dict;
		let str = '';
		if (categoryList.length > 0) {
			str = categoryList.map(item => {
				return '<div class=\"category-name\">' + item.category + '</div>' +
					'<div class=\"category-content\">' +
					item.meaning.map(mean => {
						return '<div class=\"category-meaning\">' + mean[0] + '</div>' +
							'<div class=\"category-meaning\">' +
							mean[1].join('<span class=\"comma\">,</span> ') + '</div>';
					}).join('') +
					'</div>';
			}).join('');
		}
		document.getElementById('category-list').innerHTML = str;
		document.getElementById('example').innerHTML = exampleList.length > 0 ? exampleList
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