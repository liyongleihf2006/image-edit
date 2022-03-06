<template>
  <div class="image-editor-dialog">
    <div class="image-editor-dialog-main">
      <crop
        ref="cropRef"
        :cropArea.sync="cropArea"
        :cropHidden.sync="cropHidden"
        :getCanvasRef="getCanvasRef"
        @doComplete="doComplete"
      />
      <canvas ref="canvasRef" width="0" height="0"></canvas>
    </div>
    <div class="image-editor-toolbar" :style="{ height: toolbarHeight + 'px' }">
      <div class="image-editor-toolbar-content">
        <div @click="useCircle" class="image-editor-btn" :class="imageEditorBtnActive('circle')">
          <svg-icon icon-class="image-editor-circle" />
        </div>
        <div
          @click="useTriangle"
          class="image-editor-btn"
          :class="imageEditorBtnActive('triangle')"
        >
          <svg-icon icon-class="image-editor-triangle" />
        </div>
        <div @click="useRect" class="image-editor-btn" :class="imageEditorBtnActive('rect')">
          <svg-icon icon-class="image-editor-rect" />
        </div>
        <div class="image-editor-toolbar-split"></div>
        <div @click="useText" class="image-editor-btn" :class="imageEditorBtnActive('text')">
          <svg-icon icon-class="image-editor-text" />
        </div>
        <div @click="useArrow" class="image-editor-btn" :class="imageEditorBtnActive('arrow')">
          <svg-icon icon-class="image-editor-arrow" />
        </div>
        <!-- <div
          @click="useRemark"
          class="image-editor-btn"
          :class="imageEditorBtnActive('remarkGroup')"
        >
          <svg-icon icon-class="image-editor-remark" />
        </div> -->
        <div @click="usePaint" class="image-editor-btn" :class="imageEditorBtnActive('paint')">
          <svg-icon icon-class="image-editor-paint" />
        </div>
        <div @click="usepath" class="image-editor-btn" :class="imageEditorBtnActive('path')">
          <svg-icon icon-class="image-editor-pencil" />
        </div>
        <div class="image-editor-toolbar-split"></div>
        <div @click="doRemoveAll" class="image-editor-btn">
          <svg-icon icon-class="image-editor-delete" />
        </div>
        <div @click="doCrop" class="image-editor-btn">
          <svg-icon icon-class="image-editor-crop" />
        </div>
        <div class="image-editor-toolbar-split"></div>
        <div
          @click="doReset"
          class="image-editor-btn"
          :class="{ 'image-editor-btn-disabled': resetCount + 1 >= history.length }"
        >
          <svg-icon icon-class="image-editor-reset" />
        </div>
        <div @click="doComplete(void 0)" class="image-editor-btn">
          <svg-icon icon-class="image-editor-ok" />
        </div>
        <div @click="doCancel" class="image-editor-btn">
          <svg-icon icon-class="image-editor-cancel" />
        </div>
      </div>
      <div
        ref="toolbarSecondRef"
        class="image-editor-toolbar-content-second"
        :shape="shouldActiveShapeType"
        :hidden="toolbarSecondHidden"
      >
        <div
          v-if="shouldActiveShapeType !== 'paint'"
          class="image-editor-toolbar-content-second-start"
        >
          <template v-if="shouldActiveShapeType === 'remarkGroup'">
            <input
              style="width: 20px"
              v-model="remark"
              @input="changeRemark($event.target.value)"
            />
          </template>
          <template v-else-if="shouldActiveShapeType !== 'text'">
            <div
              class="image-editor-size-btn image-editor-size-btn-small"
              :class="sizeBtnActive(StrokeWidths.LIGHTER)"
              @click="changeSize(StrokeWidths.LIGHTER)"
            ></div>
            <div
              class="image-editor-size-btn image-editor-size-btn-normal"
              :class="sizeBtnActive(StrokeWidths.NORMAL)"
              @click="changeSize(StrokeWidths.NORMAL)"
            ></div>
            <div
              class="image-editor-size-btn image-editor-size-btn-large"
              :class="sizeBtnActive(StrokeWidths.BOLDER)"
              @click="changeSize(StrokeWidths.BOLDER)"
            ></div>
          </template>
        </div>
        <div
          v-if="shouldActiveShapeType === 'paint' || shouldActiveShapeType === 'remarkGroup'"
          class="image-editor-toolbar-content-second-end"
        >
          <div
            class="image-editor-color-btn image-editor-color-btn-red"
            :class="paintBtnActive(Fills.RED)"
            :style="{ '--backgroundColor': Strokes.RED }"
            @click="changeFill(Fills.RED)"
          ></div>
          <div
            class="image-editor-color-btn image-editor-color-btn-yellow"
            :class="paintBtnActive(Fills.YELLOW)"
            :style="{ '--backgroundColor': Strokes.YELLOW }"
            @click="changeFill(Fills.YELLOW)"
          ></div>
          <div
            class="image-editor-color-btn image-editor-color-btn-green"
            :class="paintBtnActive(Fills.GREEN)"
            :style="{ '--backgroundColor': Strokes.GREEN }"
            @click="changeFill(Fills.GREEN)"
          ></div>
          <div
            class="image-editor-color-btn image-editor-color-btn-blue"
            :class="paintBtnActive(Fills.BLUE)"
            :style="{ '--backgroundColor': Strokes.BLUE }"
            @click="changeFill(Fills.BLUE)"
          ></div>
          <div
            class="image-editor-color-btn image-editor-color-btn-gray"
            :class="paintBtnActive(Fills.GRAY)"
            :style="{ '--backgroundColor': Strokes.GRAY }"
            @click="changeFill(Fills.GRAY)"
          ></div>
          <div class="image-editor-toolbar-split"></div>
          <span style="display: flex">
            <input
              type="text"
              :value="alpha * 100"
              @input="changeAlpha($event.target.value)"
              style="width: 24px; border: none; text-align: right; font-size: 12px"
            />
            %
          </span>
        </div>
        <div
          v-else-if="shouldActiveShapeType !== 'remarkGroup'"
          class="image-editor-toolbar-content-second-end"
        >
          <div
            class="image-editor-color-btn image-editor-color-btn-red"
            :class="colorBtnActive(Strokes.RED)"
            :style="{ '--backgroundColor': Strokes.RED }"
            @click="changeStroke(Strokes.RED)"
          ></div>
          <div
            class="image-editor-color-btn image-editor-color-btn-yellow"
            :class="colorBtnActive(Strokes.YELLOW)"
            :style="{ '--backgroundColor': Strokes.YELLOW }"
            @click="changeStroke(Strokes.YELLOW)"
          ></div>
          <div
            class="image-editor-color-btn image-editor-color-btn-green"
            :class="colorBtnActive(Strokes.GREEN)"
            :style="{ '--backgroundColor': Strokes.GREEN }"
            @click="changeStroke(Strokes.GREEN)"
          ></div>
          <div
            class="image-editor-color-btn image-editor-color-btn-blue"
            :class="colorBtnActive(Strokes.BLUE)"
            :style="{ '--backgroundColor': Strokes.BLUE }"
            @click="changeStroke(Strokes.BLUE)"
          ></div>
          <div
            class="image-editor-color-btn image-editor-color-btn-gray"
            :class="colorBtnActive(Strokes.GRAY)"
            :style="{ '--backgroundColor': Strokes.GRAY }"
            @click="changeStroke(Strokes.GRAY)"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export const Strokes = {
  RED: 'rgba(204,47,38,1)',
  YELLOW: 'rgba(204,163,0,1)',
  BLUE: 'rgba(0,117,255,1)',
  GREEN: 'rgba(42,159,71,1)',
  GRAY: 'rgba(173,173,173,1)',
  WHITE: 'rgba(255,255,255,1)'
}
export const StrokeRevert = {
  [Strokes.RED]: [Strokes.GREEN],
  [Strokes.YELLOW]: [Strokes.GREEN],
  [Strokes.BLUE]: [Strokes.RED],
  [Strokes.GREEN]: [Strokes.RED],
  [Strokes.GRAY]: [Strokes.WHITE],
  [Strokes.WHITE]: [Strokes.GRAY]
}
export const Fills = {
  RED: {
    r: 204,
    g: 47,
    b: 38
  },
  YELLOW: {
    r: 204,
    g: 163,
    b: 0
  },
  BLUE: {
    r: 0,
    g: 117,
    b: 255
  },
  GREEN: {
    r: 42,
    g: 159,
    b: 71
  },
  GRAY: {
    r: 173,
    g: 173,
    b: 173
  },
  WHITE: {
    r: 255,
    g: 255,
    b: 255,
    a: 1
  }
}
export const StrokeWidths = {
  LIGHTER: 2,
  NORMAL: 6,
  BOLDER: 10
}
export const FontSizes = {
  SMALLER: 24,
  NORMALER: 36,
  LARGER: 48
}
export const Alphas = [
  {
    value: 1,
    text: '100%'
  },
  {
    value: 0.9,
    text: '90%'
  },
  {
    value: 0.8,
    text: '80%'
  },
  {
    value: 0.7,
    text: '70%'
  },
  {
    value: 0.6,
    text: '60%'
  },
  {
    value: 0.5,
    text: '50%'
  },
  {
    value: 0.4,
    text: '40%'
  },
  {
    value: 0.3,
    text: '30%'
  },
  {
    value: 0.2,
    text: '20%'
  },
  {
    value: 0.1,
    text: '10%'
  },
  {
    value: 0,
    text: '0%'
  }
]
import { debounce } from 'lodash'
import { fabric } from 'fabric'
import Crop from './Crop.vue'
import SvgIcon from './SvgIcon.vue'
export default {
  name: 'App',
  components: {
    Crop,
    SvgIcon
  },
  props: {
    src: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      Strokes,
      Fills,
      StrokeWidths,
      Alphas,
      canvas: undefined,
      // 布局属性
      leftMinPadding: 10,
      rightMinPadding: 10,
      topMinPadding: 10,
      bottomMinPadding: 10,
      toolbarHeight: 100,
      // 画图属性
      behavior: '', // 画图行为
      shouldActiveShapeType: '', // 当前激活或将要激活的图形
      position: { top: 0, left: 0 },
      rect: {
        stroke: Strokes.RED,
        strokeWidth: StrokeWidths.LIGHTER,
        fill: 'transparent',
        index: 2
      },
      circle: {
        stroke: Strokes.RED,
        strokeWidth: StrokeWidths.LIGHTER,
        fill: 'transparent',
        index: 0
      },
      triangle: {
        stroke: Strokes.RED,
        strokeWidth: StrokeWidths.LIGHTER,
        fill: 'transparent',
        index: 1
      },
      arrow: {
        stroke: Strokes.RED,
        strokeWidth: StrokeWidths.LIGHTER,
        index: 4
      },
      path: {
        stroke: Strokes.RED,
        strokeWidth: StrokeWidths.LIGHTER,
        fill: 'transparent',
        index: 6
      },
      text: {
        stroke: Strokes.RED,
        fontSize: FontSizes.SMALLER,
        index: 3
      },
      remarkGroup: {
        index: 5
      },
      paint: {
        index: 5
      },
      target: null,
      history: [],
      prevHistory: [], // 上一次保存成功时候的历史
      manualActive: false, // 手动激活某个图形
      historyLock: false, // 撤销和向前操作需要将history存入行为锁住
      resetCount: 0, // 回退的次数
      prevResetCount: 0, // 上一次保存成功时候的历史指针
      clipboard: null, // 剪贴板
      remark: '1',
      cropArea: {
        top: 0,
        left: 0,
        height: 0,
        width: 0
      },
      prevCropArea: {
        top: 0,
        left: 0,
        height: 0,
        width: 0
      },
      alpha: 1, // 透明度
      cropHidden: true,
      prevCropHidden: true
    }
  },
  computed: {
    stroke: {
      get() {
        const activeObject = this.canvas.getActiveObject()
        if (activeObject) {
          return activeObject.stroke
        }
        return ''
      },
      set(stroke) {
        if (this.shouldActiveShapeType) {
          this[this.shouldActiveShapeType].stroke = stroke
        }
        if (this.behavior === 'path') {
          this.drawpath()
        }
        const activeObject = this.canvas.getActiveObject()
        if (
          activeObject &&
          this.shouldActiveShapeType === 'path' &&
          (!activeObject.shape || activeObject.shape === 'path')
        ) {
          activeObject.set('stroke', stroke)
          this.canvas.requestRenderAll()
        } else if (activeObject && activeObject.shape === this.shouldActiveShapeType) {
          switch (activeObject.shape) {
            case 'rect':
            case 'circle':
              activeObject.set('stroke', stroke)
              break
            case 'arrow':
            case 'text':
              activeObject.set({ stroke: stroke, fill: stroke })
              break
            case 'remarkGroup':
              activeObject.children.forEach((obj) => {
                switch (obj.shape) {
                  case 'rect':
                  case 'circle':
                    obj.set('stroke', stroke)
                    break
                  case 'arrow':
                    obj.set({ stroke: stroke, fill: stroke })
                    break
                  default:
                    obj.set('stroke', stroke)
                }
              })
              break
            default:
              activeObject.set('stroke', stroke)
          }
          this.canvas.requestRenderAll()
        }
      }
    },
    strokeWidth: {
      get() {
        const activeObject = this.canvas.getActiveObject()
        if (activeObject) {
          return activeObject.strokeWidth
        }
        return ''
      },
      set(strokeWidth) {
        if (this.shouldActiveShapeType) {
          this[this.shouldActiveShapeType].strokeWidth = strokeWidth
        }
        if (this.behavior === 'path') {
          this.drawpath()
        }
        const activeObject = this.canvas.getActiveObject()
        if (
          activeObject &&
          this.shouldActiveShapeType === 'path' &&
          (!activeObject.shape || activeObject.shape === 'path')
        ) {
          activeObject.set('strokeWidth', strokeWidth)
          this.canvas.requestRenderAll()
        } else if (activeObject && activeObject.shape === this.shouldActiveShapeType) {
          activeObject.set('strokeWidth', strokeWidth)
          this.canvas.requestRenderAll()
        }
      }
    },
    fill: {
      get() {
        const activeObject = this.canvas.getActiveObject()
        if (activeObject) {
          if (activeObject.shape === 'remarkGroup') {
            const textCircle = activeObject._objects[1]._objects[0]
            return textCircle.fill
          } else {
            return activeObject.fill
          }
        }
        return ''
      },
      set(fill) {
        const activeObject = this.canvas.getActiveObject()
        if (activeObject) {
          if (activeObject.shape === 'remarkGroup') {
            const textCircle = activeObject._objects[1]._objects[0]
            textCircle.set({
              fill: `rgba(${fill.r},${fill.g},${fill.b},${this.alpha || 1})`,
              fillWidthoutAlpha: JSON.stringify(fill)
            })
          } else if (activeObject._objects) {
            const _objects = activeObject._objects
            _objects.forEach((object) => {
              if (['circle', 'triangle', 'rect', 'path', undefined].includes(object.shape)) {
                object.set({
                  fill: `rgba(${fill.r},${fill.g},${fill.b},${this.alpha || 1})`,
                  fillWidthoutAlpha: JSON.stringify(fill)
                })
              }
            })
          } else {
            activeObject.set({
              fill: `rgba(${fill.r},${fill.g},${fill.b},${this.alpha || 1})`,
              fillWidthoutAlpha: JSON.stringify(fill)
            })
          }

          this.canvas.requestRenderAll()
        }
      }
    },
    isDrawingMode() {
      return this.behavior === 'path'
    },
    toolbarSecondHidden() {
      return ![
        'circle',
        'triangle',
        'rect',
        'text',
        'arrow',
        'path',
        'text',
        'remarkGroup',
        'paint'
      ].includes(this.shouldActiveShapeType)
    }
  },
  watch: {
    behavior: {
      handler(behavior) {
        this.canvas.isDrawingMode = behavior === 'path'
      }
    },
    shouldActiveShapeType(shape) {
      this.changeArrowLeft(shape)
    },
    alpha(alpha) {
      const activeObject = this.canvas.getActiveObject()
      if (activeObject) {
        if (activeObject.shape === 'remarkGroup') {
          const textCircle = activeObject._objects[1]._objects[0]
          if (textCircle.fillWidthoutAlpha) {
            const fillWidthoutAlpha = JSON.parse(textCircle.fillWidthoutAlpha)
            textCircle.set({
              fill: `rgba(${fillWidthoutAlpha.r},${fillWidthoutAlpha.g},${fillWidthoutAlpha.b},${alpha})`,
              alpha
            })
          } else {
            textCircle.set({
              alpha: alpha || 1
            })
          }
        } else {
          if (activeObject._objects) {
            const _objects = activeObject._objects
            _objects.forEach((object) => {
              if (['circle', 'triangle', 'rect', 'path', undefined].includes(object.shape)) {
                if (object.fillWidthoutAlpha) {
                  const fillWidthoutAlpha = JSON.parse(object.fillWidthoutAlpha)
                  object.set({
                    fill: `rgba(${fillWidthoutAlpha.r},${fillWidthoutAlpha.g},${fillWidthoutAlpha.b},${alpha})`,
                    alpha
                  })
                } else {
                  object.set({
                    alpha: alpha || 1
                  })
                }
              }
            })
          } else if (activeObject.fillWidthoutAlpha) {
            const fillWidthoutAlpha = JSON.parse(activeObject.fillWidthoutAlpha)
            activeObject.set({
              fill: `rgba(${fillWidthoutAlpha.r},${fillWidthoutAlpha.g},${fillWidthoutAlpha.b},${alpha})`,
              alpha
            })
          } else {
            activeObject.set({
              alpha: alpha || 1
            })
          }
        }
        this.canvas.requestRenderAll()
      }
    }
  },
  mounted() {
    this.debounceAfterRender = debounce(this.afterRender, 100)
    this.init()
  },
  methods: {
    bindHotkey(e) {
      const { ctrlKey, shiftKey, code } = e
      if (ctrlKey) {
        switch (code) {
          case 'KeyZ':
            if (shiftKey) {
              this.doForward()
            } else {
              this.doReset()
            }
            break
          case 'KeyC':
            this.doCopy()
            break
          case 'KeyV':
            this.doPaste()
            break
          case 'KeyX':
            this.doRemove()
            break
        }
      } else if (code === 'Escape') {
        this.cropHidden = true
      } else if (code === 'Delete') {
        this.doRemove()
      }
    },
    pushHistory() {
      const c = this.canvas.toJSON(['shape', 'fillWidthoutAlpha', 'alpha'])
      const len = this.history.length
      this.history.length = len - this.resetCount
      this.resetCount = 0
      this.history.push(c)
      if (!this.prevHistory.length) {
        this.prevHistory = [...this.history]
      }
    },
    imageEditorBtnActive(behavior) {
      let cls = {
        'image-editor-btn-active': behavior === this.shouldActiveShapeType
      }
      if (behavior === 'paint' && this.canvas) {
        const activeObject = this.canvas.getActiveObject()
        if (!activeObject) {
          cls = { 'image-editor-btn-disabled': true }
        } else if (['arrow', 'text', 'remarkGroup'].includes(activeObject.shape)) {
          cls = { 'image-editor-btn-disabled': true }
        }
      }
      return cls
    },
    sizeBtnActive(size) {
      if (!this.shouldActiveShapeType) {
        return {}
      }
      return {
        'image-editor-size-btn-active': size === this[this.shouldActiveShapeType].strokeWidth
      }
    },
    colorBtnActive(stroke) {
      if (!this.shouldActiveShapeType) {
        return {}
      }
      return {
        'image-editor-stroke-btn-active': stroke === this[this.shouldActiveShapeType].stroke
      }
    },
    paintBtnActive(fill) {
      const activeObject = this.canvas.getActiveObject()
      if (activeObject) {
        let fillWidthoutAlpha = ''
        if (activeObject.shape === 'remarkGroup') {
          const textCircle = activeObject._objects[1]._objects[0]
          fillWidthoutAlpha = textCircle.fillWidthoutAlpha
        } else {
          fillWidthoutAlpha = activeObject.fillWidthoutAlpha
        }
        return {
          'image-editor-stroke-btn-active': fillWidthoutAlpha === JSON.stringify(fill)
        }
      }
    },
    changeArrowLeft(shape) {
      const index = this[shape]?.index || 0
      const toolbarSecondRef = this.$refs.toolbarSecondRef
      toolbarSecondRef.style.setProperty('--arrow-left', `${(2 * index + 0.5) * 15}px`)
    },
    init() {
      const canvasRef = this.getCanvasRef()
      const id = this.generateCanvasId(canvasRef)
      this.generateEditCanvas(id)
      this.loadImage()
      this.$refs.cropRef.bindCropEvents()
    },
    // 裁剪以后重新初始化
    reInit() {
      this.canvas.clear()
      this.reState()
      this.loadImage().then(() => {
        this.reState()
      })
    },
    reState() {
      this.history = []
      this.prevHistory = []
      this.resetCount = 0
      this.prevResetCount = 0
      this.cropHidden = true
    },
    getCanvasRef() {
      return this.$refs.canvasRef
    },
    generateCanvasId(dom) {
      const id = `_canvas_id_${Date.now()}_${Math.floor(Math.random() * 10000)}`
      dom.id = id
      return id
    },
    afterRender() {
      if (!this.historyLock) {
        this.pushHistory()
      }
      this.historyLock = false
      this.manualActive = false
    },
    generateEditCanvas(id) {
      var canvas = (this.canvas = new fabric.Canvas(id))
      canvas.on('mouse:down', (e) => {
        this.mouseDownPointer = e.pointer
      })
      canvas.on('mouse:up', (e) => {
        if (!e.target && !this.behavior) {
          this.shouldActiveShapeType = ''
        } else if (
          !e.target ||
          (e.target &&
            e.target.shape !== this.behavior &&
            ['rect', 'circle', 'arrow', 'text', 'triangle'].includes(this.behavior))
        ) {
          const { x: left, y: top } = e.pointer
          // 鼠标按下和松开若是坐标不同,那么不要执行生成行为
          if (left === this.mouseDownPointer.x && top === this.mouseDownPointer.y) {
            this.position = { top, left }
            this.doDrawShape()
          } else {
            if (!this.canvas.isDrawingMode) {
              this.shouldActiveShapeType = ''
            }
          }
        } else if (e.target) {
          const shape = e.target.shape
          this.shouldActiveShapeType = shape || 'path' // 画笔上面没有type
          if (!this.canvas.isDrawingMode) {
            this.behavior = ''
          }
          if (this.shouldActiveShapeType === 'text') {
            this.text.fontSize = e.target.fontSize
          }
          if (e.target.shape === 'remarkGroup') {
            if (e.target._objects) {
              const markerGroup = e.target._objects
              if (markerGroup && markerGroup[1]) {
                const textCircle = e.target._objects[1]._objects[0]
                this.alpha = textCircle.alpha || 1
              }
            }
          } else {
            this.alpha = e.target.alpha || 1
          }
        } else {
          if (!this.canvas.isDrawingMode) {
            this.shouldActiveShapeType = ''
          }
        }
      })
      canvas.on('selection:created', () => {
        if (!this.manualActive) {
          // this.historyLock = true
        }
      })
      canvas.on('after:render', () => {
        this.debounceAfterRender()
      })
    },
    getRealDimensions(originImageWidth, originImageHeight) {
      const canvasRef = this.getCanvasRef()
      const editorMask = canvasRef.closest('.image-editor-mask')
      const { clientHeight, clientWidth } = editorMask
      const maxHeight =
        clientHeight - this.topMinPadding - this.bottomMinPadding - this.toolbarHeight
      const maxWidth = clientWidth - this.leftMinPadding - this.rightMinPadding
      if (maxHeight >= originImageHeight && maxWidth >= originImageWidth) {
        return { width: originImageWidth, height: originImageHeight }
      } else if (maxHeight <= originImageHeight && maxWidth <= originImageWidth) {
        if (originImageWidth / originImageHeight > maxWidth / maxHeight) {
          return this.useWidthDimensions(originImageWidth, originImageHeight, maxWidth)
        } else {
          return this.useHeightDimensions(originImageWidth, originImageHeight, maxHeight)
        }
      } else if (maxHeight < originImageHeight) {
        return this.useHeightDimensions(originImageWidth, originImageHeight, maxHeight)
      } else {
        return this.useWidthDimensions(originImageWidth, originImageHeight, maxWidth)
      }
    },
    useHeightDimensions(originImageWidth, originImageHeight, maxHeight) {
      const height = maxHeight
      const width = (maxHeight / originImageHeight) * originImageWidth
      return { width, height }
    },
    useWidthDimensions(originImageWidth, originImageHeight, maxWidth) {
      const width = maxWidth
      const height = (maxWidth / originImageWidth) * originImageHeight
      return { width, height }
    },
    loadImage() {
      return new Promise((resolve) => {
        const originImage = new Image()
        originImage.src = this.src
        originImage.crossOrigin = 'anonymous'
        originImage.addEventListener('load', () => {
          const { width: originImageWidth, height: originImageHeight } = originImage
          const { width, height } = this.getRealDimensions(originImageWidth, originImageHeight)
          const image = new fabric.Image(originImage)
          image.scaleToHeight(height)
          image.scaleToWidth(width)
          this.canvas.setDimensions({
            width,
            height
          })
          this.canvas.setBackgroundImage(image)
          document.body.removeChild(originImage)
          this.$refs.cropRef.resetCrop()
          resolve()
        })
        document.body.appendChild(originImage)
      })
    },
    toggleUseShape(behavior) {
      const activeObject = this.canvas.getActiveObject()
      if (activeObject) {
        this.historyLock = true
        this.canvas.discardActiveObject()
        this.canvas.requestRenderAll()
      }
      if (this.behavior === behavior || behavior === this.shouldActiveShapeType) {
        this.behavior = ''
        this.shouldActiveShapeType = ''
      } else {
        this.behavior = behavior
        this.shouldActiveShapeType = behavior
      }
    },
    useCircle() {
      this.toggleUseShape('circle')
    },
    useTriangle() {
      this.toggleUseShape('triangle')
    },
    useRect() {
      this.toggleUseShape('rect')
    },
    useText() {
      this.toggleUseShape('text')
    },
    useArrow() {
      this.toggleUseShape('arrow')
    },
    useRemark() {
      if (this.behavior === 'remarkGroup') {
        this.behavior = ''
      } else {
        this.behavior = 'remarkGroup'
        const activeObject = this.canvas.getActiveObject()
        if (activeObject && activeObject.shape === 'remarkGroup') {
          const remarkText = activeObject._objects[1]._objects[1]
          this.remark = remarkText.text
        }
      }
      this.addRemark()
    },
    usePaint() {
      const activeObject = this.canvas.getActiveObject()
      if (!activeObject || ['arrow', 'text', 'remarkGroup'].includes(activeObject.shape)) {
        return
      }
      if (this.behavior !== 'paint') {
        this.behavior = 'paint'
        this.shouldActiveShapeType = 'paint'
      } else {
        this.behavior = ''
        this.shouldActiveShapeType = ''
      }
    },
    usepath() {
      this.toggleUseShape('path')
      this.drawpath()
    },
    doReset() {
      try {
        const len = this.history.length
        if (this.resetCount + 1 < len) {
          this.resetCount++
          const snapshot = this.history[len - 1 - this.resetCount]
          this.historyLock = true
          this.canvas.loadFromJSON(snapshot)
          this.canvas.requestRenderAll()
        }
      } catch (error) {
        console.log(error)
        // this.doReset()
      }
    },
    doForward() {
      if (this.resetCount <= 0) {
        return
      }
      this.resetCount--
      const len = this.history.length
      const snapshot = this.history[len - 1 - this.resetCount]
      this.historyLock = true
      this.canvas.loadFromJSON(snapshot)
    },
    doCopy() {
      const activeObject = this.canvas.getActiveObject()
      if (activeObject) {
        activeObject.clone((cloned) => {
          this.clipboard = cloned
        })
      }
    },
    doPaste() {
      const canvas = this.canvas
      const clipboard = this.clipboard
      clipboard &&
        clipboard.clone((clonedObj) => {
          canvas.discardActiveObject()
          clonedObj.set({
            left: clonedObj.left + 10,
            top: clonedObj.top + 10,
            evented: true
          })
          if (clonedObj.type === 'activeSelection') {
            // active selection needs a reference to the canvas.
            clonedObj.canvas = canvas
            clonedObj.forEachObject(function (obj) {
              canvas.add(obj)
            })
            // this should solve the unselectability
            clonedObj.setCoords()
          } else {
            canvas.add(clonedObj)
          }
          clipboard.top += 10
          clipboard.left += 10
          this.manualActive = true
          canvas.setActiveObject(clonedObj)
          canvas.requestRenderAll()
        })
    },
    doRemoveAll() {
      this.canvas._objects.forEach((klass) => {
        this.canvas.remove(klass)
      })
      const _objects = this.canvas._objects
      const len = _objects.length
      for (let i = len - 1; i >= 0; i--) {
        const klass = _objects[i]
        this.canvas.remove(klass)
      }
    },
    doRemove() {
      const activeObject = this.canvas.getActiveObject()
      if (activeObject) {
        if (!activeObject.shape && activeObject._objects) {
          activeObject._objects.forEach((klass) => {
            this.canvas.remove(klass)
          })
        } else {
          this.canvas.remove(activeObject)
        }
      }
    },
    addRemark() {
      const canvas = this.canvas
      const activeObject = this.canvas.getActiveObject()
      if (activeObject) {
        const { left, top } = activeObject
        let realShape
        let additional = {}
        if (activeObject.type === 'group') {
          const children = activeObject._objects
          realShape = children[0]
          const { scaleX, scaleY, zoomX, zoomY } = activeObject
          additional = {
            scaleX,
            scaleY,
            zoomX,
            zoomY
          }
        } else {
          realShape = activeObject
        }
        const textbox = new fabric.Textbox(this.remark, {
          shape: 'remarkText',
          fontSize: 18,
          fill: Strokes.WHITE,
          fontFamily: '"PingFang SC","Microsoft YaHei",sans-serif'
        })
        const width = textbox.width
        textbox.set('top', 2)
        textbox.set('left', 6)
        const textCircle = new fabric.Ellipse({
          rx: width / 2 + 6,
          ry: 12,
          fill:
            this.fill !== 'transparent'
              ? this.fill
              : `rgba(${Fills.RED.r},${Fills.RED.g},${Fills.RED.b},${this.alpha || 1})`,
          fillWidthoutAlpha: JSON.stringify(Fills.RED),
          alpha: 1,
          hasControls: false,
          strokeUniform: true
        })
        const textGroup = new fabric.Group([textCircle, textbox], {
          shape: 'remarkGroup'
        })
        delete realShape.left
        delete realShape.top
        var group = new fabric.Group([realShape, textGroup], {
          shape: 'remarkGroup',
          left,
          top,
          children: [realShape, textGroup],
          ...additional
        })
        canvas.remove(activeObject)
        canvas.add(group)
        canvas.setActiveObject(group)
      }
    },
    doCrop() {
      this.$refs.cropRef.doCrop()
    },
    doCancel() {
      this.$emit('doCancel')
    },
    doComplete(isCrop) {
      let cropArea = this.cropArea
      const url = this.canvas.toDataURL(cropArea)
      this.$emit('doComplete', url, isCrop)
    },
    doDrawShape() {
      let shape
      const canvas = this.canvas
      const { top, left } = this.position
      switch (this.behavior) {
        case 'rect':
          shape = this.drawRect()
          break
        case 'circle':
          shape = this.drawCircle()
          break
        case 'arrow':
          shape = this.drawArrow()
          break
        case 'text':
          shape = this.drawText()
          break
        case 'triangle':
          shape = this.drawTriangle()
          break
      }
      if (shape) {
        shape.set({
          shape: this.behavior,
          left,
          top
        })
        canvas.add(shape)
        canvas.setActiveObject(shape)
        canvas.requestRenderAll()
        this.shouldActiveShapeType = this.behavior
        this.behavior = ''
      }
    },
    drawRect() {
      // create a rectangle object
      return new fabric.Rect({
        fill: 'transparent',
        alpha: 1,
        width: 100,
        height: 100,
        rx: 10,
        ry: 10,
        hasControls: true,
        strokeUniform: true,
        ...this.rect
      })
    },
    drawCircle() {
      return new fabric.Circle({
        radius: 50,
        fill: 'transparent',
        alpha: 1,
        hasControls: true,
        strokeUniform: true,
        ...this.circle
      })
    },
    drawTriangle() {
      return new fabric.Triangle({
        fill: 'transparent',
        alpha: 1,
        hasControls: true,
        strokeUniform: true,
        ...this.triangle
      })
    },
    drawArrow() {
      var arrow = new fabric.Path(
        'M102.051 13.0051C102.643 12.4248 102.651 11.4751 102.071 10.8839L92.6148 1.24915C92.0346 0.657914 91.0848 0.649038 90.4936 1.22932C89.9024 1.80961 89.8935 2.75932 90.4738 3.35055L98.8794 11.9148L90.3152 20.3204C89.724 20.9007 89.7151 21.8504 90.2954 22.4416C90.8757 23.0328 91.8254 23.0417 92.4166 22.4614L102.051 13.0051ZM0.985982 12.4999L100.987 13.4345L101.015 10.4347L1.01402 9.50007L0.985982 12.4999Z'
      )
      const stroke = this.arrow.stroke
      arrow.set({
        fill: stroke,
        stroke: stroke,
        strokeWidth: 1
      })
      return arrow
    },
    drawpath() {
      const canvas = this.canvas
      var path = canvas.freeDrawingBrush
      path.color = this.path.stroke
      path.width = this.path.strokeWidth
    },
    drawText() {
      const stroke = this.text.stroke
      return new fabric.Textbox('', {
        width: 100,
        fill: stroke,
        ...this.text
      })
    },
    changeSize(strokeWidth) {
      this.strokeWidth = strokeWidth
    },
    changeStroke(stroke) {
      this.stroke = stroke
    },
    changeFill(fill) {
      this.fill = fill
    },
    changeAlpha(alpha) {
      alpha = alpha.replace(/[^\d]/g, '')
      alpha = alpha.replace(/^0+/, '')
      if (alpha >= 100) {
        alpha = 100
      } else if (!alpha) {
        alpha = 0
      }
      this.alpha = alpha / 100
      this.$nextTick(() => {
        this.$forceUpdate()
      })
    },
    changeRemark(value) {
      this.remark = value
      this.addRemark()
    }
  }
}
</script>
<style>
.image-editor-dialog {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.image-editor-dialog [hidden] {
  display: none !important;
}
.image-editor-dialog-main {
  border: 15px solid #fff;
  box-shadow: 0 0 10000px 10000px rgba(0, 0, 0, 0.4);
}
.image-editor-toolbar-content {
  display: flex;
  align-items: center;
  margin-top: 15px;
  background: rgba(255, 255, 255, 1);
  border-radius: 2px;
}
.image-editor-btn.image-editor-btn {
  display: inline-flex;
  width: 24px;
  height: 24px;
  justify-content: center;
  align-items: center;
  margin: 3px;
  border-radius: 4px;
  cursor: pointer;
  box-sizing: border-box;
  border: solid 1px transparent;
}
.image-editor-btn:hover {
  border-color: rgba(0, 0, 0, 0.4);
}
.image-editor-btn-active {
  background: #f5f5f5;
}
.image-editor-btn.image-editor-btn:active {
  background: #f8f8f8;
}
.image-editor-btn.image-editor-btn.image-editor-btn-disabled {
  border-color: transparent;
  background: transparent;
  color: #c1c1c1;
  cursor: not-allowed;
}
.image-editor-toolbar-split {
  display: inline-block;
  border-left: 1px solid rgba(163, 6, 6, 0.04);
  height: 30px;
}
.image-editor-toolbar-content-second {
  position: relative;
  display: flex;
  align-items: center;
  margin-top: 6px;
  background: rgba(255, 255, 255, 1);
  border-radius: 2px;
  justify-content: space-between;
  width: 241px;
}
.image-editor-toolbar-content-second[shape='text'] {
  width: 160px; 
}
.image-editor-toolbar-content-second[shape='text'] .image-editor-toolbar-content-second-start {
  display: none;
}
.image-editor-toolbar-content-second[shape='text'] .image-editor-toolbar-content-second-end {
  flex-basis: 100%;
}
.image-editor-toolbar-content-second[shape='remarkGroup'] {
    width: 200px;
}
.image-editor-toolbar-content-second[shape='remarkGroup'] .image-editor-toolbar-content-second-start {
  flex-basis: 20%;
}
.image-editor-toolbar-content-second[shape='remarkGroup'] .image-editor-toolbar-content-second-end {
  flex-basis: 80%;
}
.image-editor-toolbar-content-second[shape='paint'] {
  width: 200px;
}
.image-editor-toolbar-content-second[shape='paint'] .image-editor-toolbar-content-second-end {
  flex-basis: 100%;
}
.image-editor-toolbar-content-second::before {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
  border: 3px solid;
  top: -6px;
  left: calc(var(--arrow-left) + 3px);
  border-color: transparent transparent #fff transparent;
}
.image-editor-toolbar-content-second-start,
.image-editor-toolbar-content-second-end {
  display: flex;
  align-items: center;
}
.image-editor-toolbar-content-second-start {
  flex-basis: 40%;
  justify-content: space-evenly;
}
.image-editor-toolbar-content-second-end {
  flex-basis: 60%;
}
.image-editor-size-btn {
  width: 12px;
  height: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
.image-editor-size-btn::before {
  content: '';
  box-sizing: border-box;
  background: #c1c1c1;
  display: block;
  border-radius: 100%;
}
.image-editor-size-btn-small::before {
  width: 4px;
  height: 4px;
}
.image-editor-size-btn-normal::before {
  width: 8px;
  height: 8px;
}
.image-editor-size-btn-large::before {
  width: 12px;
  height: 12px;
}
.image-editor-color-btn {
  box-sizing: border-box;
  cursor: pointer;
  height: 24px;
  width: 24px;
  margin: 3px;
  border-color: transparent;
  border-radius: 4px;
  padding: 6px;
}
.image-editor-color-btn::before {
  content: '';
  display: block;
  height: 12px;
  width: 12px;
  background: var(--backgroundColor);
}

.image-editor-size-btn-active::before {
  background: rgb(42, 159, 71);
}
.image-editor-stroke-btn-active {
  background: #f5f5f5;
}
</style>
