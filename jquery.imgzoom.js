/**
 * imgzoom.min.js v1.0.1 | (c) JS Foundation and other contributors
 * demo is : https://www.lvbee.com.cn/myH5/imgzoom/index.html
 * 使用Terser压缩工具进行代码压缩 terser jquery.imgzoom.js -o jquery.imgzoom.min.js -c -m
 * 自己做的jQuery图像缩放、旋转、拖动的插件，压缩后10K代码，支持多种调用方式。同时兼容移动端，可以手指旋转和缩放，也可以鼠标滚轮缩放。
 * 自己做的jQuery图像缩放、旋转、拖动的插件，压缩后10K代码，支持多种调用方式。
同时兼容移动端，可以手指旋转和缩放，也可以鼠标滚轮缩放。
官网网站：https://www.lvbee.com.cn/myH5/imgzoom/index.html
Gitee代码：https://gitee.com/lvbee/jquery.imgzoom
使用方法如上链接查看，谢谢支持啦~
 */
(function($) {
	//一.参数说明：options = {};
	//1.elem 仅方案二才要传；
	//2.src 如果没有初始图，可传动态设置的
	//二.方法说明：
	//1.onScale()
	//2.
	var cfg = {};

	function ImgZoom(me) {
		var myImgZoom = this,
			$box = $(me),
			$img = $box.find('img'),
			state = { nScale: 1, imgWidth: 0, imgHeight: 0, left: 0, top: 0, centerX: 0, centerY: 0, rotate: 0 };
		//定义好方法：
		myImgZoom.changeImage = function(_options, callback) {
			if ($img.length < 1) $box.append($img = $('<img/>'));
			if (typeof(_options) == 'string') _options = { src: _options };
			if (_options && _options.src) $img.attr('src', _options.src);
			myImgZoom.getImageSize(function(width, height) {
				state.imgWidth = width;
				state.imgHeight = height;
				if (_options && _options.isResetScale === false) {
					myImgZoom.setScale(state.nScale);
					myImgZoom.computeCenter();
				} else {
					myImgZoom.initStartPosition(_options ? _options.autoZoom : false);
				}
				return callback && callback($img, width, height);
			});
		}
		myImgZoom.initStartPosition = function(autoZoom) {
			autoZoom = !autoZoom ? cfg.autoZoom : true;
			var bW = state.bWidth = $box.width(),
				bH = state.bHeight = $box.height(),
				mW = state.imgWidth,
				mH = state.imgHeight;
			var nScale = myImgZoom.buildScale(Math.min(bW / mW, bH / mH));
			if (nScale >= 1 || !autoZoom) nScale = 1;
			state.left = (bW - mW * nScale) * 0.5;
			state.top = (bH - mH * nScale) * 0.5;
			$img.css({
				'width': mW * nScale,
				'height': mH * nScale,
				'left': state.left,
				'top': state.top
			})
			if (nScale != state.nScale) state.nScale = nScale, myImgZoom.onScale();
			myImgZoom.computeCenter();
		}
		myImgZoom.computeCenter = function(callback) {
			state.centerX = state.left + state.imgWidth * state.nScale * 0.5;
			state.centerY = state.top + state.imgHeight * state.nScale * 0.5;
		}
		myImgZoom.onScale = function() {
			if (state.$btns && state.$btns.length > 0) state.$btns.find('.imgzoom-btns-scale').text(state.nScale);
			return cfg.onScale && cfg.onScale(state.nScale);
		}
		myImgZoom.imageToImage = function(callback) {
			// 创建一个新的Image对象
			var img = new Image();
			img.crossOrigin = 'Anonymous';
			// 当图片加载完成后
			img.onload = function() {
				return callback && callback(img);
			};
			img.onerror = function(e) {
				return callback && callback(null, e);
			}
			img.src = $img.attr('src');
		}
		//图片转base64：isClockwise是否顺时针旋转，null表示不旋转
		myImgZoom.imageToBase64 = function(callback, isClockwise) {
			myImgZoom.imageToImage(function(img, error) {
				if (!img) return callback && callback({ code: -1, message: 'load image fail.' });
				var canvas = document.createElement('canvas');
				if (isClockwise === true || isClockwise === false) {
					//旋转总是90度的，故调换：
					canvas.width = img.height;
					canvas.height = img.width;
					var context = canvas.getContext('2d');
					// 清除canvas
					context.clearRect(0, 0, canvas.width, canvas.height);
					// 保存当前的变换状态
					context.save();
					// 将坐标系的原点移动到图片的中心
					context.translate(canvas.width / 2, canvas.height / 2);
					// 旋转图片，例如旋转45度（弧度制，所以需要转换为弧度）
					var radians = (isClockwise !== false ? 90 : -90) * (Math.PI / 180);
					context.rotate(radians);
					// 将坐标系的原点移回左上角（因为我们已经以图片中心为原点旋转了）
					context.translate(-img.width / 2, -img.height / 2);
					// 绘制图片
					context.drawImage(img, 0, 0, img.width, img.height);
					// 恢复之前的变换状态
					context.restore();
				} else {
					canvas.width = img.width;
					canvas.height = img.height;
					var context = canvas.getContext('2d');
					context.drawImage(img, 0, 0, img.width, img.height);
				}
				base64Image = canvas.toDataURL('image/png'); // 或者使用'image/jpeg'
				if (!base64Image || base64Image.length < 6) return callback && callback({ code: -2, message: 'image to base64 fail.' });
				return callback && callback({ code: 1, data: base64Image, message: 'success.' });
			});
		}
		myImgZoom.onRotate = function() {
			var transform = myImgZoom.rotateToTransform();
			if (state.$btns && state.$btns.length > 0) state.$btns.find('.imgzoom-btns-rotate').text(transform);
			return cfg.onRotate && cfg.onRotate(transform, state.rotate);
		}
		myImgZoom.getImageSize = function(callback) {
			var src = $img.attr('src');
			if (!src || src.length < 1) return callback && callback($img, 0, 0);
			var $clone = $img.clone();
			$clone.css('width', 'auto').css('height', 'auto').appendTo(document.body);
			// $clone.attr('style', 'position: fixed;top:10px;left:10px;z-index:99;').bind('load', function() {
			$clone.attr('style', 'position: fixed;top:999999px;left:999999px;z-index:-1;').bind('load error', function() {
				callback && callback($clone.width() || 0, $clone.height() || 0);
				$clone.remove();
			});
		}
		myImgZoom.setBoxSize = function(width, height) {
			if (width) $box.css('width', width);
			if (height) $box.css('height', height);
		}
		myImgZoom.setScale = function(scale) {
			state.nScale = myImgZoom.buildScale(scale);
			myImgZoom.addScale(true, 0);
		}
		myImgZoom.buildScale = function(scaleVal) {
			var scale = cfg.scale;
			if (!scale) return scaleVal;
			scaleVal = parseFloat(Number(isNaN(scaleVal) ? 1 : scaleVal).toFixed(2));
			return Math.max(scale.min, Math.min(scaleVal, scale.max));
		}
		myImgZoom.addScale = function(isAdd, scale) {
			scale = Number(isNaN(scale) ? 0 : Math.max(scale, 0));
			state.nScale += isAdd ? scale : -scale;
			state.nScale = myImgZoom.buildScale(state.nScale);
			state.left = state.centerX - state.imgWidth * state.nScale * 0.5;
			state.top = state.centerY - state.imgHeight * state.nScale * 0.5;
			$img.css({
				'width': state.imgWidth * state.nScale,
				'height': state.imgHeight * state.nScale,
				'left': isNaN(state.left) ? 0 : state.left,
				'top': isNaN(state.top) ? 0 : state.top
			});
			if (scale != 0) return myImgZoom.onScale();
		}
		myImgZoom.initBtns = function() {
			$box.find('.imgzoom-btns').remove();
			var btns, html = [];
			html.push('<div class="imgzoom-btns" style="position: absolute;right: 0;z-index: 2;">');
			var btCss =
				'background: #fff;border-left:1px solid #bbb;width: 26px;user-select:none;text-align: center;cursor: pointer;font-size: 12px;height: 18px;line-height: 18px;overflow: hidden;white-space: nowrap;';
			if (cfg.scale && cfg.scale.enabled && cfg.scale.btns) {
				btns = true;
				html.push('<div style="display: flex;margin:4px;border: 1px solid #bbb;border-radius:2px;">');
				html.push('<div class="imgzoom-btns-left" style="' + btCss + ';">-</div>');
				html.push('<div class="imgzoom-btns-scale" style="' + btCss + ';cursor: default;">1</div>');
				html.push('<div class="imgzoom-btns-right" style="' + btCss + ';">+</div>');
				html.push('</div>');
			}
			if (cfg.rotate && cfg.rotate.enabled && cfg.rotate.btns) {
				btns = true;
				html.push('<div style="display: flex;margin:4px;border: 1px solid #bbb;border-radius:2px;">');
				html.push('<div class="imgzoom-btns-left2" style="' + btCss + ';">L</div>');
				html.push('<div class="imgzoom-btns-rotate" style="' + btCss + ';cursor: default;">0</div>');
				html.push('<div class="imgzoom-btns-right2" style="' + btCss + ';">R</div>');
				html.push('</div>');
			}
			html.push('</div>');
			if (!btns) return;
			var $btns = state.$btns = $(html.join(' \n ')).appendTo($box);
			$btns.children('div').children('div:first-child').css('border', 'none');
			$btns.children('div').children('div').bind('click', function() {
				var $btn = $(this);
				if ($btn.hasClass('imgzoom-btns-left') || $btn.hasClass('imgzoom-btns-right')) myImgZoom.addScale($btn.hasClass('imgzoom-btns-right'), 0.1);
				if ($btn.hasClass('imgzoom-btns-left2') || $btn.hasClass('imgzoom-btns-right2')) myImgZoom.rotate($btn.hasClass('imgzoom-btns-right2'), 0.1);
			});
		}
		myImgZoom.rotateToTransform = function() {
			// if (state.rotate == -4) return -360;
			return (state.rotate * 90) % 360;
		}
		myImgZoom.rotate = function(isClockwise) { //type旋转类型：0顺时针1逆时针2垂直3水平
			if (!cfg.rotate || !cfg.rotate.enabled) return;
			if (isClockwise !== false) state.rotate++;
			else state.rotate--;
			myImgZoom.onRotate();
			var useH5 = function() {
				$img.css('transform', 'rotate(' + myImgZoom.rotateToTransform() + 'deg)').css('transition', 'transform 0.5s ease-in-out');
				myImgZoom.computeCenter();
			}
			if (cfg.rotate && cfg.rotate.onlyUseH5 !== false) return useH5(); //仅使用H5方案
			//尝试使用canvas旋转：
			myImgZoom.imageToBase64(function(j) {
				if (!j || j.code != 1) return useH5(); //跨域或转换失败，就用备用方案了
				//加点css效果，稍微弥补一下：
				$img.css('transform', 'rotate(' + (isClockwise ? '-90' : '90') + 'deg)').css('transition', 'none');
				myImgZoom.changeImage({ src: j.data, isResetScale: false }, function() {
					$img.css('transform', 'rotate(' + (isClockwise ? '0' : '-0') + 'deg)').css('transition', 'transform 0.5s ease-in-out');
				});
			}, isClockwise);
		}
		myImgZoom.isDrag = function() {
			return cfg.drag && cfg.drag.enabled;
		}
		myImgZoom.isScale = function() {
			return cfg.scale && cfg.scale.enabled;
		}
		myImgZoom.isRotate = function() {
			return cfg.rotate && cfg.rotate.enabled;
		}
		myImgZoom.addImageEventListener = function(dragCallback, scaleCallback) {
			var EventType;
			var start = function(e) {
					if (!EventType) EventType = e.type;
					if (EventType != e.type) return;
					executeEventType(e, 'start');
				},
				executeEventType = function(e, status) {
					if (EventType == 'mousedown') {
						if (e.which === 1 || e.button === 0) {
							if (myImgZoom.isDrag()) return dragCallback(true, e, status); //是鼠标左键，表示要移动
						}
						//web端的滚轮事件另外处理了，这里不用回调！
						// if (myImgZoom.isScale() || myImgZoom.isRotate()) return scaleCallback(true, e, status);
					}
					if (EventType == 'touchstart') {
						var touches = e.originalEvent ? e.originalEvent.touches : null;
						if (!touches || touches.length < 1) return;
						if (touches.length === 1) {
							if (myImgZoom.isDrag()) return dragCallback(false, e, status); //是一个手指，表示要移动
						}
						if (touches.length === 2) {
							if (myImgZoom.isScale() || myImgZoom.isRotate()) return scaleCallback(false, e, status); //是两个手指，表示要缩放or旋转
						}
						return false;
					}
					return false;
				},
				stopPropagation = function(e) {
					if (e.stopPropagation) e.stopPropagation();
					else if (e.preventDefault) e.preventDefault();
					return e.returnValue = false;
				},
				move = function(e) {
					if (!EventType) return;
					if (executeEventType(e, 'move')) return stopPropagation(e);
				},
				end = function(e) {
					if (!EventType) return;
					executeEventType(e, 'end')
				}
			if (myImgZoom.isDrag()) {
				$img.on('mousedown', start);
				$(document).on('mousemove', move).on('mouseup', end);
			}
			if (myImgZoom.isScale()) $box.bind('mousewheel wheel', myImgZoom.mouseWheelEventMove);
			if (myImgZoom.isDrag() || myImgZoom.isScale() || myImgZoom.isRotate()) $box.on('touchstart', start).on('touchmove', move).on('touchend', end);
		}
		myImgZoom.initImageEventListener = function() {
			if (!myImgZoom.isDrag() && !myImgZoom.isScale() && !myImgZoom.isRotate()) return; //移动和缩放都关闭了，无需监听事件！
			myImgZoom.initBtns();
			var ePosition = function(e, t) {
					var res = e['page' + t];
					if (res !== undefined) return res;
					if (e.originalEvent && e.originalEvent.touches && e.originalEvent.touches.length > 0) return e.originalEvent.touches[0]['client' + t];
					return 0;
				},
				eTouchDistance = function(event) {
					event = event.originalEvent || event;
					var touch1 = event.touches[0];
					var touch2 = event.touches[1];
					return Math.sqrt(Math.pow(touch2.pageX - touch1.pageX, 2) + Math.pow(touch2.pageY - touch1.pageY, 2));
				},
				eAngle = function(event) {
					event = event.originalEvent || event;
					var touch1 = event.touches[0];
					var touch2 = event.touches[1];
					var dx = touch2.pageX - touch1.pageX;
					var dy = touch2.pageY - touch1.pageY;
					return Math.atan2(dy, dx) * (180 / Math.PI); // 将弧度转换为角度
				}
			var TMap = {};
			myImgZoom.addImageEventListener(function(isMouse, e, status) { //拖动
				if (status == 'start') {
					TMap.dragStart = true;
					TMap.sX = ePosition(e, 'X');
					TMap.sY = ePosition(e, 'Y');
					TMap.sImgX = state.left;
					TMap.sImgY = state.top;
					return true;
				}
				if (status == 'move') {
					if (!TMap.dragStart) return false;
					// 计算top位置，且限制其溢出位置：
					var top = TMap.sImgY + ePosition(e, 'Y') - TMap.sY;
					var left = TMap.sImgX + ePosition(e, 'X') - TMap.sX;
					if (cfg.drag.overflowX != -1) {
						var ofx = cfg.drag.overflowX || 0;
						var mW = !ofx ? 0 : (state.imgWidth * state.nScale);
						left = Math.min(Math.max(left, ofx), state.bWidth - ofx - mW);
					}
					if (cfg.drag.overflowY != -1) {
						var ofy = cfg.drag.overflowY || 0;
						var mH = !ofy ? 0 : (state.imgHeight * state.nScale);
						top = Math.min(Math.max(top, ofy), state.bHeight - ofy - mH);
					}
					// 修改图片位置：
					$img.css({
						'left': left,
						'top': top
					});
					return true;
				}
				if (status == 'end') {
					if (!TMap.dragStart) return false;
					TMap.dragStart = false;
					state.left = parseInt($img.css('left'));
					state.top = parseInt($img.css('top'));
					myImgZoom.computeCenter();
					return true;
				}
			}, function(isMouse, e, status) { //缩放
				if (isMouse) return; //web端的已经额外处理了，这里不用再处理！
				// myImgZoom.setLogs('status:: ', myImgZoom.isRotate());
				BK: if (myImgZoom.isRotate()) {
					if (status == 'start') {
						TMap.rotateStart = true;
						TMap.startAngle = eAngle(e);
						break BK;
					}
					if (status == 'move') {
						if (!TMap.rotateStart) break BK;
						var currentAngle = eAngle(e);
						// 计算缩放因子
						var angleDiff = currentAngle - TMap.startAngle;
						if (angleDiff >= 30 || angleDiff <= -30) {
							// 重置起始以进行下一次计算
							TMap.startAngle = currentAngle;
							//去旋转：
							myImgZoom.rotate(angleDiff > 0);
						}
						break BK;
					}
					if (status == 'end') {
						if (!TMap.rotateStart) return false;
						TMap.rotateStart = false;
						TMap.startAngle = null;
						break BK;
					}
				}
				if (myImgZoom.isScale()) {
					if (status == 'start') {
						TMap.scaleStart = true;
						TMap.lastScale = state.nScale;
						TMap.startDistance = eTouchDistance(e);
						return true;
					}
					if (status == 'move') {
						if (!TMap.scaleStart) return false;
						var currentDistance = eTouchDistance(e);
						// 计算缩放因子
						var scaleFactor = currentDistance / TMap.startDistance;
						// 应用缩放因子
						TMap.lastScale *= scaleFactor;
						myImgZoom.setScale(TMap.lastScale);
						if (state.nScale != TMap.lastScale) myImgZoom.onScale();
						// 重置起始距离以进行下一次计算
						TMap.startDistance = currentDistance;
						return true;
					}
					if (status == 'end') {
						if (!TMap.scaleStart) return false;
						TMap.scaleStart = false;
						TMap.lastScale = state.nScale;
						TMap.startDistance = null;
						return true;
					}
				}
				if (TMap.rotateStart) return true;
			});
		}
		myImgZoom.mouseWheelEventMove = function(e) {
			var delta = e.originalEvent ? (e.originalEvent.deltaY || -e.originalEvent.wheelDelta || e.originalEvent.detail) : 0;
			//由于默认要放大，故=0也算！
			myImgZoom.addScale(delta <= 0, Math.max(cfg.scale ? cfg.scale.step : 0, 0.01));
			return e.preventDefault ? e.preventDefault() : e.returnValue = false;
		}
		// myImgZoom.setLogs = function(...logs) {
		// 	myImgZoom.row = myImgZoom.row || 1;
		// 	var html = [];
		// 	$.each(logs, function(i, log) {
		// 		html.push('\t' + log);
		// 	});
		// 	console.log(...logs);
		// 	$('#logs').prepend('<div>' + (myImgZoom.row++) + '、' + html.join(' ') + "</div>");
		// }
		//对外抛事件：
		$box.bind('changeImage', function(e, _options, callback) {
			myImgZoom.changeImage(_options, callback);
		});
		$box.bind('getImageSize', function(e, callback) {
			myImgZoom.getImageSize(function(width, height) {
				return callback && callback($img, width, height);
			});
		});
		$box.bind('setBoxSize', function(e, width, height) {
			myImgZoom.setBoxSize(width, height);
		});
		$box.bind('imageToBase64', function(e, callback) {
			myImgZoom.imageToBase64(callback);
		});
		$box.bind('setScale', function(e, scale) {
			myImgZoom.setScale(scale);
			if (state.nScale != scale) myImgZoom.onScale();
		});
		$box.bind('getScale', function(e, callback) {
			var scale = parseFloat(Number(state.nScale * 100).toFixed(2));
			return callback && callback(scale + '%', scale);
		});
		$box.bind('rotate', function(e, isClockwise) {
			myImgZoom.rotate(isClockwise);
		});
		$box.bind('getRotate', function(e, callback) {
			return callback && callback(myImgZoom.rotateToTransform());
		});
		//init box
		myImgZoom.setBoxSize(cfg.width, cfg.height);
		$box.css({
			'position': 'relative',
			'overflow': 'hidden',
		});
		// init img
		myImgZoom.changeImage({
			src: cfg.src,
			autoZoom: cfg.autoZoom
		}, function() {
			$img.css({
				'position': 'absolute',
				'display': 'block',
				'-webkit-user-select': 'none',
				'-moz-user-select': 'none',
				'-ms-user-select': 'none',
				'user-select': 'none',
				'z-index': 1,
			});
			myImgZoom.initImageEventListener();
			return cfg.success && cfg.success($box);
		});
	}
	//$('#id').imgzoom({...});
	$.fn.imgzoom = function(options, success) {
		// 默认设置
		cfg = $.extend({
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
				btns: true,
			},
			success: null,
		}, options);
		if (cfg.scale) {
			var scale = cfg.scale;
			scale.min = !scale.min || isNaN(scale.min) || scale.min <= 0 ? 0.1 : parseFloat(scale.min);
			scale.max = !scale.max || isNaN(scale.max) || scale.max <= 0 ? 1 : parseFloat(scale.max);
			scale.step = !scale.step || isNaN(scale.step) || scale.step <= 0.01 ? 0.1 : parseFloat(scale.step);
		}
		cfg.success = cfg.success || success;
		// 遍历匹配的元素
		return this.each(function() {
			new ImgZoom(this);
		});
	};
	//$.imgzoom({...elem...});
	$.imgzoom = function(options, success) {
		if (!options || !options.elem) throw new Error('elem is not defined.');
		$(options.elem).imgzoom(options, success);
	}
})(jQuery);