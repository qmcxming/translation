const categoryList = {
  interjection: '感叹词',
  noun: '名词',
  verb: '动词',
  adjective: '形容词',
  adverb: '副词',
  pronoun: '代词',
  conjunction: '连词',
  preposition: '介词',
  article: '冠词',
  particle: '小品词'
};

function handlerGoogleData(res) {
  const result = res[0].reduce((acc, item) => {
		if (item[0]) {
			acc += item[0];
		}
		return acc;
	}, '');
	let detail = {};
  if(res[0][1]) {
		detail.fromPhonetic = res[0][1][3] ? res[0][1][3] : '';
		detail.toPhonetic = res[0][1][2] ? res[0][1][2] : '';
	}
	// 一般情况下，短语或句子无词类
	detail.dict = res[1] ? res[1].map(item => ({
		name: item[0],
		category: item[0] ? categoryList[item[0]] : '',
		meaning: item[2]// 词义
	})): [];
	detail.example = res[13] ? res[13][0].map(item => item[0]) : [];
  return {
    name: 'google',
    result,
    detail
  }
}

module.exports = {
  handlerGoogleData
}