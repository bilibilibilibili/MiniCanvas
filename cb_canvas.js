
const text_line_height = 2
class CBcanvasClass {
    constructor(canvas_id) {
        if (!canvas_id) {
            this._errlog('canvas_id is not allow null!')
        }
        this._canvas_id = canvas_id
        this._init(canvas_id)
    }
    _init(canvas_id) {
        this._ctx = wx.createCanvasContext(canvas_id)
    }
    add_pic() {

    }
    async create_react(option) {
        if (!this.screen_width) { this.screen_width = await getWidth() }
        let pixel = this.screen_width / 750
        let { point, style } = option
        point.x = point.x * 2 * pixel
        point.y = point.y * 2 * pixel
        style.width = style.width * 2 * pixel
        style.height = style.height * 2 * pixel
        if (style.fill) {
            this._ctx.setFillStyle(style.color)
            this._ctx.fillRect(point.x, point.y, style.width, style.height)
        } else {
            if (style.lineWidth) {
                this._ctx.setLineWidth(style.lineWidth)
            }
            this._ctx.setStrokeStyle(style.color)
            this._ctx.strokeRect(point.x, point.y, style.width, style.height)
        }
    }
    async fill_text_auto(option) {
        if (!this.screen_width) { this.screen_width = await getWidth() }
        let { text, point, style, wrap, maxWidth } = option
        if (!text) { this._errlog('text is not allow null!') }
        let pixel = this.screen_width / 750
        point = point || {}
        style = style || {}
        point.x = point.x || 0
        point.y = point.y || 0
        point.x = point.x * 2 * pixel
        point.y = point.y * 2 * pixel
        style.fontSize = style.fontSize || 10
        style.family = style.family || 'sans-serif'
        style.weight = style.weight || 'normal'
        style.fontStyle = style.fontStyle || 'normal'
        style.color = style.color || '#333334'
        style.valign = style.valign || 'top'
        style.halign = style.halign || 'left'
        let _font_size = parseInt(style.fontSize * 2 * pixel) + 'px'
        let _font = style.fontStyle + " " + style.weight + " " + _font_size + " " + style.family
        this._ctx.setFillStyle(style.color)
        this._ctx.setTextAlign(style.halign)
        this._ctx.setTextBaseline(style.valign)
        this._ctx.font = _font
        this._reveal_text_arr = []
        if (!maxWidth) {
            this._ctx.fillText(text, point.x, point.y)
        } else {
            if (wrap) {
                this._sub_text_auto(text, maxWidth)
                this._reveal_text_arr.map((item, index) => {
                    this._ctx.fillText(item, point.x, point.y + (style.fontSize + text_line_height) * index)
                })
                let _add_height = (style.fontSize + text_line_height) * (this._reveal_text_arr.length - 1)
                return _add_height
            } else {
                this._text_ellipsis(text, maxWidth)
                this._reveal_text_arr.map((item, index) => {
                    this._ctx.fillText(item, point.x, point.y)
                })
            }
        }

    }
    async get_image_local_path(path) {

        return new Promise((resolve, reject) => {
            wx.downloadFile({
                url: path,
                success: res => {
                    resolve(res.tempFilePath)
                },
                fail: err => {
                    console.log(err)
                }
            })
        })
    }
    async get_canvas_image_path(option) {

        let screen_width = this.screen_width
        let pixel = this.screen_width / 750
        let { width, height, destWidth, destHeight, canvasId, multiple } = option
        width = option.width || screen_width
        destWidth = destWidth || screen_width
        if (width !== screen_width) {
            width = width * 2 * pixel
        }
        if (destWidth !== screen_width) {
            destWidth = destWidth * 2 * pixel
        }

        destHeight = destHeight * 2 * pixel
        let id = this._canvas_id
        return new Promise((resolve, reject) => {
            wx.canvasToTempFilePath({
                x: 0,
                y: 0,
                width: width * 2 * pixel,
                height: height * 2 * pixel,
                destWidth: destWidth * multiple,
                destHeight: destHeight * multiple,
                canvasId: id,
                quality: 1,
                success: (res) => {
                    console.log('图片生成成功')
                    resolve(res.tempFilePath)
                },
                fail: err => {
                    console.log(err)
                }
            })
        })

    }

    async fill_text(option) {

        if (!this.screen_width) { this.screen_width = await getWidth() }
        let { text, point, style, wrap, maxWidth } = option
        if (!text) { this._errlog('text is not allow null!') }
        let pixel = this.screen_width / 750
        point = point || {}
        style = style || {}
        point.x = point.x || 0
        point.y = point.y || 0
        point.x = point.x * 2 * pixel
        point.y = point.y * 2 * pixel
        style.fontSize = style.fontSize || 10
        style.family = style.family || 'sans-serif'
        style.weight = style.weight || 'normal'
        style.fontStyle = style.fontStyle || 'normal'
        style.color = style.color || '#333334'
        style.valign = style.valign || 'top'
        style.halign = style.halign || 'left'
        let _font_size = parseInt(style.fontSize * 2 * pixel) + 'px'
        let _font = style.fontStyle + " " + style.weight + " " + _font_size + " " + style.family
        this._ctx.setFillStyle(style.color)
        this._ctx.setTextAlign(style.halign)
        this._ctx.setTextBaseline(style.valign)
        this._ctx.font = _font
        this._reveal_text_arr = []
        if (!maxWidth) {
            this._ctx.fillText(text, point.x, point.y)
        } else {
            let _sub_str = this._sub_text(text, maxWidth)
            this._reveal_text_arr.map((item, index) => {
                this._ctx.fillText(item, point.x, point.y)
            })
            return _sub_str
        }
    }

    //option = {x,y,width,height,url,repeat}
    async createPattern(option){
        return new Promise(async (resolve, reject) => {
            let pattern = this._ctx.createPattern(option.url, option.repeat)
            this._ctx.fillStyle = pattern
            this._ctx.fillRect(option.x, option.y, option.width, option.height)
            this._ctx.draw()
            resolve()
        })
    }

    async draw_image(option) {
        return new Promise(async (resolve, reject) => {
            this._ctx.restore()
            if (!this.screen_width) { this.screen_width = await getWidth() }
            let { path, point, style, blur, radius } = option
            let pixel = this.screen_width / 750
            point = point || {}
            style = style || {}
            point.x = point.x || 0
            point.y = point.y || 0
            point.x = point.x * 2 * pixel
            point.y = point.y * 2 * pixel
            style.width = style.width || this.screen_width
            style.shape = style.shape || {}
            style.height = style.height * 2 * pixel
            // if (style.width != this.screen_width) {
            style.width = style.width * 2 * pixel
            // }
            radius = radius || 50
            if (style.shape.type === 'circle') {
                style.shape.cx = style.shape.cx * 2 * pixel
                style.shape.cy = style.shape.cy * 2 * pixel
                style.shape.r = style.shape.r * 2 * pixel
                this._ctx.save()
                this._ctx.beginPath()
                this._ctx.arc(style.shape.cx, style.shape.cy, style.shape.r, 0, 2 * Math.PI)
                this._ctx.clip()
            }

            this._ctx.drawImage(path, point.x, point.y, style.width, style.height)
            if (blur) {
                this.draw(async () => {
                    option = {
                        point: point,
                        path: path,
                        style: style
                    }
                    let _image_data = await getImageData(this._canvas_id, option)

                    await this.stackBlurCanvasRGBA(_image_data, point.x, point.y, style.width, style.height, radius)
                    resolve()
                })
            } else {
                resolve()
            }
        })
    }



    _sub_text(text, maxWidth) {
        let _add_text = ''
        let _initial_width = this._ctx.measureText(text).width
        if (_initial_width <= maxWidth) {
            this._reveal_text_arr.push(text)
            return null
        } else {
            for (let item of text) {
                _add_text += item
                let _width = this._ctx.measureText(_add_text).width
                if (_width > maxWidth) {
                    _add_text.substring(0, _add_text.length - 1)
                    this._reveal_text_arr.push(_add_text)
                    let _sub_str = text.replace(_add_text, '')
                    return _sub_str
                }
            }
        }
    }
    /**
     * 截取字符串，自动换行
     * @param {*} text
     * @param {*} maxWidth
     */
    _sub_text_auto(text, maxWidth) {
        let _add_text = ''
        let _initial_width = this._ctx.measureText(text).width
        if (_initial_width <= maxWidth) {
            this._reveal_text_arr.push(text)
        } else {
            for (let item of text) {
                _add_text += item
                let _width = this._ctx.measureText(_add_text).width
                if (_width > maxWidth) {
                    _add_text.substring(0, _add_text.length - 1)
                    this._reveal_text_arr.push(_add_text)
                    let _sub_str = text.replace(_add_text, '')
                    let _sub_str_width = this._ctx.measureText(_sub_str).width
                    if (_sub_str_width > maxWidth) {
                        this._sub_text_auto(_sub_str, maxWidth)
                        break
                    } else {
                        this._reveal_text_arr.push(_sub_str)
                        break
                    }
                }
            }
        }
    }
    _text_ellipsis(text, maxWidth) {
        let _initial_width = this._ctx.measureText(text).width
        if (_initial_width <= maxWidth) {
            this._reveal_text_arr.push(text)
        } else {
            let _add_text = ''
            for (let item of text) {
                _add_text += item
                let _width = this._ctx.measureText(_add_text + '...').width
                if (_width > maxWidth) {
                    _add_text.substring(0, _add_text.length - 1)
                    let _reveal_str = _add_text + '...'
                    this._reveal_text_arr.push(_reveal_str)
                    break
                }
            }
        }
    }

    stackBlurCanvasRGBA(imageData, top_x, top_y, width, height, radius) {
        if (isNaN(radius) || radius < 1) return;
        radius |= 0;
        var pixels = imageData;
        var x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum, a_sum,
            r_out_sum, g_out_sum, b_out_sum, a_out_sum,
            r_in_sum, g_in_sum, b_in_sum, a_in_sum,
            pr, pg, pb, pa, rbs;

        var div = radius + radius + 1;
        var w4 = width << 2;
        var widthMinus1 = width - 1;
        var heightMinus1 = height - 1;
        var radiusPlus1 = radius + 1;
        var sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2;

        var stackStart = new BlurStack();
        var stack = stackStart;
        for (i = 1; i < div; i++) {
            stack = stack.next = new BlurStack();
            if (i == radiusPlus1) var stackEnd = stack;
        }
        stack.next = stackStart;
        var stackIn = null;
        var stackOut = null;

        yw = yi = 0;

        var mul_sum = mul_table[radius];
        var shg_sum = shg_table[radius];

        for (y = 0; y < height; y++) {
            r_in_sum = g_in_sum = b_in_sum = a_in_sum = r_sum = g_sum = b_sum = a_sum = 0;

            r_out_sum = radiusPlus1 * (pr = pixels[yi]);
            g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
            b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
            a_out_sum = radiusPlus1 * (pa = pixels[yi + 3]);

            r_sum += sumFactor * pr;
            g_sum += sumFactor * pg;
            b_sum += sumFactor * pb;
            a_sum += sumFactor * pa;

            stack = stackStart;

            for (i = 0; i < radiusPlus1; i++) {
                stack.r = pr;
                stack.g = pg;
                stack.b = pb;
                stack.a = pa;
                stack = stack.next;
            }

            for (i = 1; i < radiusPlus1; i++) {
                p = yi + ((widthMinus1 < i ? widthMinus1 : i) << 2);
                r_sum += (stack.r = (pr = pixels[p])) * (rbs = radiusPlus1 - i);
                g_sum += (stack.g = (pg = pixels[p + 1])) * rbs;
                b_sum += (stack.b = (pb = pixels[p + 2])) * rbs;
                a_sum += (stack.a = (pa = pixels[p + 3])) * rbs;

                r_in_sum += pr;
                g_in_sum += pg;
                b_in_sum += pb;
                a_in_sum += pa;

                stack = stack.next;
            }


            stackIn = stackStart;
            stackOut = stackEnd;
            for (x = 0; x < width; x++) {
                pixels[yi + 3] = pa = (a_sum * mul_sum) >> shg_sum;
                if (pa != 0) {
                    pa = 255 / pa;
                    pixels[yi] = ((r_sum * mul_sum) >> shg_sum) * pa;
                    pixels[yi + 1] = ((g_sum * mul_sum) >> shg_sum) * pa;
                    pixels[yi + 2] = ((b_sum * mul_sum) >> shg_sum) * pa;
                } else {
                    pixels[yi] = pixels[yi + 1] = pixels[yi + 2] = 0;
                }

                r_sum -= r_out_sum;
                g_sum -= g_out_sum;
                b_sum -= b_out_sum;
                a_sum -= a_out_sum;

                r_out_sum -= stackIn.r;
                g_out_sum -= stackIn.g;
                b_out_sum -= stackIn.b;
                a_out_sum -= stackIn.a;

                p = (yw + ((p = x + radius + 1) < widthMinus1 ? p : widthMinus1)) << 2;

                r_in_sum += (stackIn.r = pixels[p]);
                g_in_sum += (stackIn.g = pixels[p + 1]);
                b_in_sum += (stackIn.b = pixels[p + 2]);
                a_in_sum += (stackIn.a = pixels[p + 3]);

                r_sum += r_in_sum;
                g_sum += g_in_sum;
                b_sum += b_in_sum;
                a_sum += a_in_sum;

                stackIn = stackIn.next;

                r_out_sum += (pr = stackOut.r);
                g_out_sum += (pg = stackOut.g);
                b_out_sum += (pb = stackOut.b);
                a_out_sum += (pa = stackOut.a);

                r_in_sum -= pr;
                g_in_sum -= pg;
                b_in_sum -= pb;
                a_in_sum -= pa;

                stackOut = stackOut.next;

                yi += 4;
            }
            yw += width;
        }


        for (x = 0; x < width; x++) {
            g_in_sum = b_in_sum = a_in_sum = r_in_sum = g_sum = b_sum = a_sum = r_sum = 0;

            yi = x << 2;
            r_out_sum = radiusPlus1 * (pr = pixels[yi]);
            g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
            b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
            a_out_sum = radiusPlus1 * (pa = pixels[yi + 3]);

            r_sum += sumFactor * pr;
            g_sum += sumFactor * pg;
            b_sum += sumFactor * pb;
            a_sum += sumFactor * pa;

            stack = stackStart;

            for (i = 0; i < radiusPlus1; i++) {
                stack.r = pr;
                stack.g = pg;
                stack.b = pb;
                stack.a = pa;
                stack = stack.next;
            }

            yp = width;

            for (i = 1; i <= radius; i++) {
                yi = (yp + x) << 2;

                r_sum += (stack.r = (pr = pixels[yi])) * (rbs = radiusPlus1 - i);
                g_sum += (stack.g = (pg = pixels[yi + 1])) * rbs;
                b_sum += (stack.b = (pb = pixels[yi + 2])) * rbs;
                a_sum += (stack.a = (pa = pixels[yi + 3])) * rbs;

                r_in_sum += pr;
                g_in_sum += pg;
                b_in_sum += pb;
                a_in_sum += pa;

                stack = stack.next;

                if (i < heightMinus1) {
                    yp += width;
                }
            }

            yi = x;
            stackIn = stackStart;
            stackOut = stackEnd;
            for (y = 0; y < height; y++) {
                p = yi << 2;
                pixels[p + 3] = pa = (a_sum * mul_sum) >> shg_sum;
                if (pa > 0) {
                    pa = 255 / pa;
                    pixels[p] = ((r_sum * mul_sum) >> shg_sum) * pa;
                    pixels[p + 1] = ((g_sum * mul_sum) >> shg_sum) * pa;
                    pixels[p + 2] = ((b_sum * mul_sum) >> shg_sum) * pa;
                } else {
                    pixels[p] = pixels[p + 1] = pixels[p + 2] = 0;
                }

                r_sum -= r_out_sum;
                g_sum -= g_out_sum;
                b_sum -= b_out_sum;
                a_sum -= a_out_sum;

                r_out_sum -= stackIn.r;
                g_out_sum -= stackIn.g;
                b_out_sum -= stackIn.b;
                a_out_sum -= stackIn.a;

                p = (x + (((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) * width)) << 2;

                r_sum += (r_in_sum += (stackIn.r = pixels[p]));
                g_sum += (g_in_sum += (stackIn.g = pixels[p + 1]));
                b_sum += (b_in_sum += (stackIn.b = pixels[p + 2]));
                a_sum += (a_in_sum += (stackIn.a = pixels[p + 3]));

                stackIn = stackIn.next;

                r_out_sum += (pr = stackOut.r);
                g_out_sum += (pg = stackOut.g);
                b_out_sum += (pb = stackOut.b);
                a_out_sum += (pa = stackOut.a);

                r_in_sum -= pr;
                g_in_sum -= pg;
                b_in_sum -= pb;
                a_in_sum -= pa;

                stackOut = stackOut.next;

                yi += width;
            }
        }

        // context.putImageData(imageData, top_x, top_y);
        let id = this._canvas_id
        return new Promise((resolve, reject) => {
            wx.canvasPutImageData({
                canvasId: id,
                x: top_x,
                y: top_y,
                width: width,
                height: height,
                data: pixels,
                success(res) {
                    resolve()
                }
            })
        })



    }

    set_scale(scale) {
        this._ctx.scale(scale, scale)
    }






    async draw(callback) {

        this._ctx.draw(false, () => {

            if (callback)
                callback()
        })
    }
    _errlog(err) {
        console.error(err)
    }
}

export const save_canvas = (path) => {
    return new Promise((resolve, reject) => {
        wx.saveImageToPhotosAlbum({
            filePath: path,
            success: res => {
                wx.showToast({
                    title: '保存成功',
                    icon: 'success',
                })

                // this.preview([path])
                resolve(true)

            },
            fail: err => {
                console.log('授权错误', err)
                wx.showModal({
                    title: '授权提示',
                    content: '连咖啡想要保存图片到您的相册',
                    success: res => {
                        if (res.confirm) {
                            wx.openSetting({
                                success: res => {
                                    if (res.authSetting['scope.writePhotosAlbum']) {
                                        save_canvas(path)
                                    } else {
                                        preview([path])
                                    }
                                }
                            })
                        } else if (res.cancel) {
                            preview([path])
                        }
                    }
                })
                resolve(false)
            }
        })
    })
}

export const getImageInfo = (src) => {
    return new Promise((resolve, reject) => {
        wx.getImageInfo({
            src: src,
            success: res => {
                resolve(res)
            }
        })

    })
}

const preview = (urls) => {
    wx.previewImage({
        urls: urls
    })

}
const mul_table = [
    512, 512, 456, 512, 328, 456, 335, 512, 405, 328, 271, 456, 388, 335, 292, 512,
    454, 405, 364, 328, 298, 271, 496, 456, 420, 388, 360, 335, 312, 292, 273, 512,
    482, 454, 428, 405, 383, 364, 345, 328, 312, 298, 284, 271, 259, 496, 475, 456,
    437, 420, 404, 388, 374, 360, 347, 335, 323, 312, 302, 292, 282, 273, 265, 512,
    497, 482, 468, 454, 441, 428, 417, 405, 394, 383, 373, 364, 354, 345, 337, 328,
    320, 312, 305, 298, 291, 284, 278, 271, 265, 259, 507, 496, 485, 475, 465, 456,
    446, 437, 428, 420, 412, 404, 396, 388, 381, 374, 367, 360, 354, 347, 341, 335,
    329, 323, 318, 312, 307, 302, 297, 292, 287, 282, 278, 273, 269, 265, 261, 512,
    505, 497, 489, 482, 475, 468, 461, 454, 447, 441, 435, 428, 422, 417, 411, 405,
    399, 394, 389, 383, 378, 373, 368, 364, 359, 354, 350, 345, 341, 337, 332, 328,
    324, 320, 316, 312, 309, 305, 301, 298, 294, 291, 287, 284, 281, 278, 274, 271,
    268, 265, 262, 259, 257, 507, 501, 496, 491, 485, 480, 475, 470, 465, 460, 456,
    451, 446, 442, 437, 433, 428, 424, 420, 416, 412, 408, 404, 400, 396, 392, 388,
    385, 381, 377, 374, 370, 367, 363, 360, 357, 354, 350, 347, 344, 341, 338, 335,
    332, 329, 326, 323, 320, 318, 315, 312, 310, 307, 304, 302, 299, 297, 294, 292,
    289, 287, 285, 282, 280, 278, 275, 273, 271, 269, 267, 265, 263, 261, 259];


const shg_table = [
    9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17,
    17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19,
    19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20,
    20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21,
    21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21,
    21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22,
    22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22,
    22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
    24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
    24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
    24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
    24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24];

const getWidth = async () => {
    return new Promise((resolve, reject) => {
        wx.getSystemInfo({
            success: res => {
                resolve(res.screenWidth)
            }
        })
    })
}
const getImageData = async (id, option) => {
    let { path, point, style } = option
    return new Promise((resolve, reject) => {
        wx.canvasGetImageData({
            canvasId: id,
            x: point.x,
            y: point.y,
            width: style.width,
            height: style.height,
            success: (res) => {
                resolve(res.data)
            },
            fail: (err) => {
                reject('fail to get Image data:', err)
            }
        })

    })
}



function BlurStack() {
    this.r = 0;
    this.g = 0;
    this.b = 0;
    this.a = 0;
    this.next = null;
}


export default CBcanvasClass