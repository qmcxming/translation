# 翻译优化

## 1、主函数名变更为 translate 新增参数

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

## 2、统一返回结果以及错误 【√】

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

## 3、其他翻译引擎函数 【√】

函数名更改为xxTranslate，如googleTranslate、baiduTranslate...

## 4、完善检测语种 detect

思路：直接调用翻译引擎接口，获取文本语种

## 5、谷歌翻译原文数据处理抽离【√】

抽离出来作为单独的工具js文件 g-utils.js 

## 6、TTS引擎：Edge TTS

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

```js
const name = 'zh-CN-XiaoyiNeural';
const text = '如果喜欢这个项目的话请点个 Star 吧。';
const ssml = `
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="${name}">
    ${text}
  </voice>
</speak>`;
```

**聚合翻译语音列表设计：**

对应的翻译语种传递进来，从第一个元素开始，匹配`codes`【includes】，匹配通过，直接使用当前对元素，否则继续向下查找。

详细可见，`src/translate/voices.json`文件

**错误提示：**

(1) auto 检测出来的语种传入【比如正常语种是en，检测后变成了xx语种】，本地却没有收录该语种对应的语言name：没有该语音包，可以尝试切换语种，再次播放哦。

【这种情况下，缓存的md5加密文件名可能需要变更 → md5(文本 + 语种)】
