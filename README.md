## 一、前言
jQuery图像缩放、旋转、拖动的插件，压缩后10K代码，支持多种调用方式。同时兼容移动端，可以手指旋转和缩放，也可以鼠标滚轮缩放。

## 二、使用步骤

##### 步骤1、引入必要js和jquery，此插件兼容mobile（略显粗糙）

##### 步骤2、调用方法：

- 写法一：
```js
$(elem).imgzoom(options);
```

- 写法二：
```js
$(elem).imgzoom(options, success);
```

- 写法三：
```js
$.imgzoom({
	elem: 'xxx',
	//...more options
});
```

## 三、options 参数说明：

|参数名|必选|类型|说明|
|:----    |:---|:----- |-----   |
|elem | N  |String/Elem | 元素对象，写法三时传入才生效且必传   |
|src |N  |String |图片链接，如果图片是异步生成才传入   |
|width |N  |String/Number | 容器的宽度（如果固定）  |
|height |N  |String/Number | 容器的高度（如果固定）  |
|autoZoom |N  |Boolean |  是否自动缩放/自适应  |
|scale |N  |Object | 缩放相关配置   |
|drag |N  |Object | 拖动相关配置   |
|rotate |N  |Object | 旋转相关配置   |
|onScale |N  | Method | 监听缩放的变化，返回当前缩放比例（'50%', 0.5）   |
|onRotate |N  | Method | 监听旋转的变化，返回当前旋转角度（'90', 1）   |
|success |N  | Method | 回调方法   |



### 1、scale 参数说明：

- 缩放的相关配置

|参数名|默认值|类型|说明|
|:----    |:---|:----- |-----   |
|enabled | true  | Boolean | 是否允许缩放   |
|min | 0.1  |Number | 最小缩放比例，支持0.01   |
|max | 10  |Number | 最大缩放比例（1表示100%，10表示1000%）  |

### 2、drag 参数说明：

- 拖动的相关配置

|参数名|默认值|类型|说明|
|:----    |:---|:----- |-----   |
|enabled | true  | Boolean | 是否允许拖动   |
|overflowX | 0  |Number | 漫出量（如0表示图片不能拖出外面，-1表示不限制）   |
|overflowY | 0  |Number | 漫出量（如0表示图片不能拖出外面，-1表示不限制）   |


### 3、rotate 参数说明：

- 旋转的相关配置

|参数名|默认值|类型|说明|
|:----    |:---|:----- |-----   |
|enabled | true  | Boolean | 是否允许拖动   |
|onlyUseH5 | true  | Boolean | 仅使用H5效果   |

**说明：**
旋转图片使用的是“canvas”和“transform”，会先尝试使用“canvas”重新绘制并旋转图片，如遇跨域等失败情况，就会使用CSS的“transform”旋转样式来实现，此时由于宽高变化，拖动的漫出量可能会不受控制了。

然而“canvas”是图片转换，故就没有旋转过程的效果了，而且还会出现图片闪一下的问题。所以默认是使用H5的，如果想要关闭请配置onlyUseH5=false



### 4、success 回调方法说明：

- success可以在外层定义，也可以在内层options里定义，优先以options为主（如果options有值，外层定义失效）。
例如：
```js
$('.imgzoom').imgzoom({...}, function(e){...});
```

- success返回元素的jQuery对象，可以使用该对象调用内部对外开放的方法。
例如：
```js
$('.imgzoom').imgzoom({
	...
	success: function(e) {
		e.trigger('setScale', 0.6); //调用方法
	}
});
```

## 四、method 方法说明：

### 调用方法：
```js
e.trigger('method name', method params);
```

### 1. changeImage(...)

**用途**
图片链接变更

**调用方法**
```js
e.trigger('changeImage', 'http://xxxx/xx.png', function($img, width, height){...});

e.trigger('changeImage', {
	src: 'http://xxxx/xx.png',
	isResetScale: false, //是否重置缩放比例，默认true，非必填
}, function($img, width, height){...});
```

**回调参数**
- $img：图片元素
- width：图片实际宽度
- height：图片实际高度


### 2. getImageSize(...)
**用途**
获取图片宽高

**调用方法**
```js
e.trigger('getImageSize', function($img, width, height){...});
```

**回调参数**
- $img：图片元素
- width：图片实际宽度
- height：图片实际高度


### 3. setBoxSize(...)
**用途**
设置外壳的宽高

**调用方法**
```js
e.trigger('setBoxSize', width, height);
```

**参数**
- width：外壳的宽度
- height：外壳的高度

### 4. imageToBase64(...)
**用途**
图片转为base64

**调用方法**
```js
e.trigger('imageToBase64', function(base64){...});
```

**参数**
- base64：返回图片的base64

### 5. setScale(...)
**用途**
设置图片的缩放比例

**调用方法**
```js
e.trigger('setScale', scale);
```

**参数**
- scale：缩放比例，例如：0.6

### 6. rotate(...)
**用途**
旋转图片

**调用方法**
```js
e.trigger('rotate', isClockwise);
```

**参数**
- isClockwise：是否顺时针（true表示顺时针，false表示逆时针）

### 7. getRotate(...)
**用途**
获取图片的旋转数

**调用方法**
```js
e.trigger('getRotate', function(transform){...});
```

**参数**
- transform：图片的旋转数

### 8. getScale(...)
**用途**
获取图片的缩放数

**调用方法**
```js
e.trigger('getScale', function(scale){...});
```

**参数**
- scale：图片的缩放数


## 九、完整示例：

```js
$('.imgzoom').imgzoom({
	src: '', // 链接
	width: '',
	height: '',
	scale: {
		enabled: true, //是否允许缩放
		min: 0.1, //允许缩放+最小值
		step: 0.1,
		max: 10, //允许缩放+最大值
		btns: true,
	},
	drag: {
		enabled: true,
		overflowX: -1,
		overflowY: -1,
	},
	rotate: {
		enabled: true,
		onlyUseH5: true,
	},
	success: function(e){
		e.trigger('setScale', 0.6);
	},
	onScale: function(scale) {
		console.log('比例被改变了：', scale);
	}
});
```






