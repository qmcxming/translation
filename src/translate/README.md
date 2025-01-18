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
5. TTS引擎：Edge TTS

解决方案：

(1) [SchneeHertz/node-edge-tts](https://github.com/SchneeHertz/node-edge-tts)：此方案存在缺陷，接口似乎存在bug，有时会出现音频无法返回的问题。

(2) [wxxxcxx/ms-ra-forwarder: 免费的在线文本转语音API](https://github.com/wxxxcxx/ms-ra-forwarder)：暂未尝试，不过在utools中的一些翻译插件均是使用该方案，总体而言，还是完美的，部分细节需要稍作处理。

https://microsoft-tts.supercopilot.top/

- 根据语种的不同，自动使用对应的语言朗读
- 中英文可以使用 zh-CN-XiaoyiNeural
- 请求路径：/api/ra
- 请求方法：POST
- Content-Type：text/plain
- 声音列表获取：https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/voices/list?trustedclienttoken=6A5AA1D4EAFF4E9FB37E23D68491D6F4

```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="zh-CN-XiaoyiNeural">
    如果喜欢这个项目的话请点个 Star 吧。
  </voice>
</speak>
```

