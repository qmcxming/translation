

# 翻译插件

> HBuilderX的翻译插件，中英互译。
>
> 说明：目前插件市场开启了看广告下载模式，如果不想看广告的话，可以在GitHub上的releases下载 [translation-plugin.zip](https://github.com/qmcx-ming/translation/releases)，使用[离线安装插件](https://hx.dcloud.net.cn/Tutorial/PluginsInstall?id=offlineinstall)。
>
> 还有一件事，在手机上看完广告后，记得点击广告上的**关闭**按钮，不然可能会出现，观看广告失败。
>
> 离线安装插件注意事项：
>
> 1. 解压时，最好选择 **提取到 `translation-plugin/`位置**或者 **全部解压缩**，切记。
> 2. 解压后，如果插件内没有`node_modules`，需要手动执行`npm install`。
> 3. 后面我可能会加一个 `translation-plugin-n.zip`的包，他会包含`node_modules`，意味着你无需手动执行`npm install`了。

## 插件市场

[翻译插件 - DCloud 插件市场](https://ext.dcloud.net.cn/plugin?id=19421)

## GitHub

[HBuilderX的翻译插件](https://github.com/qmcx-ming/translation)

## 配置说明

> 申请教程可以参考这个博客 [百度、阿里、腾讯、有道各平台翻译API申请教程](https://blog.csdn.net/weixin_44253490/article/details/126365385)
- [百度翻译](https://api.fanyi.baidu.com/product/11)
- [腾讯翻译](https://cloud.tencent.com/product/tmt)
- [阿里翻译](https://www.aliyun.com/product/ai/base_alimt?source=5176.11533457&userCode=wsnup3vv)
- 谷歌翻译( v1.2.0新增 )：只需配置代理服务器地址即可 [谷歌翻译镜像站合集](https://cloud.tencent.com/developer/news/1478660)

![pkTnXB4.png](https://s21.ax1x.com/2024/07/26/pkbjHnP.png)

## 使用说明

### 1、快捷键

翻译快捷键(需要先选中文本)：`Ctrl + Shift + Y`

打开翻译对话框快捷键：`Ctrl + Shift + O`

翻译替换：`Ctrl + Shift + X`

### 2、翻译

**如何使用？**

1. 选中文本，右键，点击**翻译**

2. 或者选中文本后，使用快捷键 `Ctrl + Shift + Y`

![翻译](https://s21.ax1x.com/2024/07/19/pkT3rqK.png)

说明：底部状态栏元素(`翻译引擎图标`)只有在插件激活后(即，第一次**选中翻译**或右键**打开翻译窗口**)才会出现。

![翻译提示](https://s21.ax1x.com/2024/07/20/pkTYfk8.png)

### 3、翻译对话框

**如何使用？**

1. 右键，点击打开翻译对话框

2. 或者使用快捷键`Ctrl + Shift + O`
3. **v1.4.0**新增选中文本后，打开翻译对话框回显翻译( 针对于翻译内容较多，但是底部状态栏的翻译提示没法完全显示的问题 )。
4. **v1.5.2** 新增，按下ESC键，可以直接关闭翻译对话框。

**翻译对话框说明**

左侧输入翻译内容，然后点击**翻译**(或者 按下回车`Enter`键)按钮，右侧显示翻译结果。

- Shift + Enter：换行
- Enter：翻译

![翻译对话框](https://s21.ax1x.com/2024/07/19/pkTQRGn.png)

### 4、翻译替换 (v1.1.0 新增)

**如何使用？**

选中文本，右键**翻译替换**(或使用快捷键`Ctrl + Shift + X`)，在弹出的选择框中选择你所想要的格式即可。

**如何选择？**

- 按上下键，选好后回车
- 在搜索框输入序号，然后回车即可
- 也可以直接使用鼠标单击对应的条目

![](https://s21.ax1x.com/2024/07/23/pkHZJ1K.png)

### 5、更多翻译结果 (v1.3.1 新增)

输入翻译内容，然后点击翻译结果框中的更多按钮，选择你要的翻译服务，即可在默认浏览器中打开网页版翻译服务，显示更多翻译结果。

![](https://s21.ax1x.com/2024/08/01/pkX6E6J.png)

### 6、翻译对话框，多语言选择(v1.4.1新增)

目前插件中，各翻译引擎支持语言数量是不同的，这里我只抽取常用、通用(即可以互相进行翻译)的语言。

**百度翻译支持语言列表 (auto除外，28种)**

| 名称         | 代码 |
| ------------ | ---- |
| 自动检测     | auto |
| 中文         | zh   |
| 英语         | en   |
| 粤语         | yue  |
| 文言文       | wyw  |
| 日语         | jp   |
| 韩语         | kor  |
| 法语         | fra  |
| 西班牙语     | spa  |
| 泰语         | th   |
| 阿拉伯语     | ara  |
| 俄语         | ru   |
| 葡萄牙语     | pt   |
| 德语         | de   |
| 意大利语     | it   |
| 希腊语       | el   |
| 荷兰语       | nl   |
| 波兰语       | pl   |
| 保加利亚语   | bul  |
| 爱沙尼亚语   | est  |
| 丹麦语       | dan  |
| 芬兰语       | fin  |
| 捷克语       | cs   |
| 罗马尼亚语   | rom  |
| 斯洛文尼亚语 | slo  |
| 瑞典语       | swe  |
| 匈牙利语     | hu   |
| 繁体中文     | cht  |
| 越南语       | vie  |

**腾讯翻译支持语言列表 (auto除外，18种)**

| 名称       | 代码  |
| ---------- | ----- |
| 自动检测   | auto  |
| 简体中文   | zh    |
| 繁体中文   | zh-TW |
| 英语       | en    |
| 日语       | ja    |
| 韩语       | ko    |
| 法语       | fr    |
| 西班牙语   | es    |
| 意大利语   | it    |
| 德语       | de    |
| 土耳其语   | tr    |
| 俄语       | ru    |
| 葡萄牙语   | pt    |
| 越南语     | vi    |
| 印尼语     | id    |
| 泰语       | th    |
| 马来西亚语 | ms    |
| 阿拉伯语   | ar    |
| 印地语     | hi    |

**阿里翻译支持语言列表 (auto除外，27种)**

| 名称         | 代码  |
| ------------ | ----- |
| 自动检测     | auto  |
| 中文         | zh    |
| 英语         | en    |
| 粤语         | yue   |
| 日语         | ja    |
| 韩语         | ko    |
| 法语         | fr    |
| 西班牙语     | es    |
| 泰语         | th    |
| 阿拉伯语     | ar    |
| 俄语         | ru    |
| 葡萄牙语     | pt    |
| 德语         | de    |
| 意大利语     | it    |
| 希腊语       | el    |
| 荷兰语       | nl    |
| 波兰语       | pl    |
| 保加利亚语   | bg    |
| 爱沙尼亚语   | et    |
| 丹麦语       | da    |
| 芬兰语       | fi    |
| 捷克语       | cs    |
| 罗马尼亚语   | ro    |
| 斯洛文尼亚语 | sl    |
| 瑞典语       | sv    |
| 匈牙利语     | hu    |
| 繁体中文     | zh-tw |
| 越南语       | vi    |

**谷歌翻译支持语言列表 (auto除外，26种)**

| 名称         | 代码  |
| ------------ | ----- |
| 自动检测     | auto  |
| 中文         | zh    |
| 英语         | en    |
| 日语         | ja    |
| 韩语         | ko    |
| 法语         | fr    |
| 西班牙语     | es    |
| 泰语         | th    |
| 阿拉伯语     | ar    |
| 俄语         | ru    |
| 葡萄牙语     | pt    |
| 德语         | de    |
| 意大利语     | it    |
| 希腊语       | el    |
| 荷兰语       | nl    |
| 波兰语       | pl    |
| 保加利亚语   | bg    |
| 爱沙尼亚语   | et    |
| 丹麦语       | da    |
| 芬兰语       | fi    |
| 捷克语       | cs    |
| 罗马尼亚语   | ro    |
| 斯洛文尼亚语 | sl    |
| 瑞典语       | sv    |
| 匈牙利语     | hu    |
| 繁体中文     | zh-TW |
| 越南语       | vi    |

## 赞赏

如果您觉得本插件帮助了您，点个star，或者小小的赞赏一下，当然也可以在[插件市场](https://ext.dcloud.net.cn/plugin?id=19421)来个五星好评，鼓励一下🐶。

![赞赏](https://qmcx-ming.github.io/static/pay.png)
