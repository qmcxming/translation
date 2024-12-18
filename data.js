// google翻译明细数据设计 from:hello to:你好
const data = {
	fromPhonetic: 'həˈlō',// [0][1][3] 单词才有
	toPhonetic: 'Nǐ hǎo',// [0][1][2]
	// 词类 短语或句子无词类
	category: [
		{
			name: 'interjection',// [1][0][0]
			category: '感叹词',
			// 词义
			meaning: [//[1][0][2]
				[
					"你好!",
					["Hello!", "Hi!", "Hallo!"]
				],
				[
					"喂!",
					["Hey!", "Hello!"]
				]
			]
		}
	],
	example: [// 短语或句子无13索引 单词才有
		"<b>hello</b> there, Katie!"//[13][0][0][0]
		// ... [13][0][x][0]
	]
}

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