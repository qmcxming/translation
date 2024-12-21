# 翻译优化

1. 主函数名变更为 translate 新增参数

- text：待翻译文本

- engine：翻译引擎，**默认google**，`'baidu'|'tencent'|'alibaba'|'google'`
- appId：APP ID
- secretKey：密钥
- from：源语言，默认auto
- to：目标语言
- url：服务器地址(仅谷歌翻译支持)
- original : 是否返回原文(原本数据)，默认false
- version：翻译版本(仅阿里翻译支持)
- scene：翻译场景(仅阿里翻译支持)

2. 统一返回结果以及错误 【√】

**返回结果**

```js
{
    name: 'google',// 翻译引擎
    from: 'en',// 源语言
    to: 'zh',// 目标语言
    dst: '你好',// 翻译结果
    src: 'hello',// 文本
    row: [...],// 原文
    detail: {// 翻译明细，仅谷歌翻译
        fromPhonetic: 'həˈlō',// 源语言音标
        toPhonetic: 'Nǐ hǎo',// 目标语言音标
        dict: [// 词类示例
            {
                name: 'interjection',
			   category: '感叹词',
                meaning: [
          			[
          				'你好!',
          				['Hello!', 'Hi!', 'Hallo!']
         			],
                     ...
         		]
            },
            ...
        ],
        example: [// 示例
            '<b>hello</b> there, Katie!',
            ...
        ]
    }
}
```

**错误**

```js
{
    name: 'google',// 翻译引擎
    error: 'TKK更新失败, 请检查网络连接'// 错误提示信息
}
```

3. 其他翻译引擎函数 【√】

函数名更改为xxTranslate，如googleTranslate、baiduTranslate...

4. 完善检测语种 detect

思路：直接调用翻译引擎接口，获取文本语种

5. 谷歌翻译原文数据处理抽离出来作为单独的工具js文件 g-utils.js 【√】
