<template>
  <div
    ref="cropContainer"
    class="image-crop-container"
    :hidden="cropHidden"
    :style="cropContainerDimensionsPX"
  >
    <div ref="cropContent" class="image-crop-content" :style="cropAreaWidthPX">
      <div class="crop-handler crop-top"></div>
      <div class="crop-handler crop-bottom"></div>
      <div class="crop-handler crop-left"></div>
      <div class="crop-handler crop-right"></div>

      <div class="crop-handler crop-top-left"></div>
      <div class="crop-handler crop-top-right"></div>
      <div class="crop-handler crop-bottom-left"></div>
      <div class="crop-handler crop-bottom-right"></div>
      <div class="crop-toolbar" :style="cropToolbarStyle">
        <div class="image-editor-btn" @click="handlerCancelCropFixed">
          <svg-icon icon-class="image-editor-reset" />
        </div>
        <div class="image-editor-btn" @click="handlerCropFixed">
          <svg-icon icon-class="image-editor-ok" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SvgIcon from './SvgIcon.vue'
export const CropHandlers = {
  CONTENT: 'content',
  TOP: 'top',
  BOTTOM: 'bottom',
  LEFT: 'left',
  RIGHT: 'right',
  TOPLEFT: 'topleft',
  TOPRIGHT: 'topright',
  BOTTOMLEFT: 'bottomleft',
  BOTTOMRIGHT: 'bottomright'
}
export default {
  name: 'ImageCrop',
  components: {
    SvgIcon
  },
  props: {
    getCanvasRef: {
      type: Function,
      default() {
        return null
      }
    },
    cropArea: {
      type: Object,
      default() {
        return {
          top: 0,
          left: 0,
          height: 0,
          width: 0
        }
      }
    },
    cropHidden: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      cropResizeHandler: CropHandlers.CONTENT, // 剪切把手
      mousedown: false, // 是否按下裁剪的把手
      prevClientX: 0, // 鼠标当前的位置
      prevClientY: 0, // 鼠标当前的位置
      cropContainerDimensions: {
        width: 0,
        height: 0
      }
    }
  },
  computed: {
    cropContainerDimensionsPX() {
      const { width, height } = this.cropContainerDimensions
      return {
        height: `${height}px`,
        width: `${width}px`
      }
    },
    cropAreaWidthPX() {
      const { top, left, height, width } = this.cropArea
      return {
        top: `${top}px`,
        left: `${left}px`,
        height: `${height}px`,
        width: `${width}px`
      }
    },
    cropToolbarStyle() {
      const { height: containerHeight } = this.cropContainerDimensions
      const { top, height } = this.cropArea
      if (top + height > containerHeight - 42) {
        return {
          bottom: '12px'
        }
      }
      return {
        bottom: '-42px'
      }
    }
  },
  methods: {
    handlerCancelCropFixed() {
      this.resetCrop()
      this.$emit('update:cropHidden', true)
    },
    handlerCropFixed() {
      this.$emit('doComplete', true)
    },
    bindCropEvents() {
      const cropContent = this.$refs.cropContent
      cropContent.addEventListener('mousedown', (e) => {
        const target = e.target
        if (target.closest('.crop-top')) {
          this.cropResizeHandler = CropHandlers.TOP
        } else if (target.closest('.crop-bottom')) {
          this.cropResizeHandler = CropHandlers.BOTTOM
        } else if (target.closest('.crop-left')) {
          this.cropResizeHandler = CropHandlers.LEFT
        } else if (target.closest('.crop-right')) {
          this.cropResizeHandler = CropHandlers.RIGHT
        } else if (target.closest('.crop-top-left')) {
          this.cropResizeHandler = CropHandlers.TOPLEFT
        } else if (target.closest('.crop-bottom-left')) {
          this.cropResizeHandler = CropHandlers.BOTTOMLEFT
        } else if (target.closest('.crop-top-right')) {
          this.cropResizeHandler = CropHandlers.TOPRIGHT
        } else if (target.closest('.crop-bottom-right')) {
          this.cropResizeHandler = CropHandlers.BOTTOMRIGHT
        } else {
          this.cropResizeHandler = CropHandlers.CONTENT
        }
        if (e.touches) {
          const { clientX, clientY } = e.touches[0]
          this.prevClientX = clientX
          this.prevClientY = clientY
        } else {
          this.prevClientX = e.pageX
          this.prevClientY = e.pageY
        }
        this.mousedown = true
      })
      window.addEventListener('mouseup', this.handlerMouseup)
      window.addEventListener('touchend', this.handlerMouseup)
      window.addEventListener('mousemove', this.handlerMousemove)
      window.addEventListener('touchmove', this.handlerMousemove)
      this.$once('hook:beforeDestroy', () => {
        window.removeEventListener('mouseup', this.handlerMouseup)
        window.removeEventListener('touchend', this.handlerMouseup)
        window.removeEventListener('mousemove', this.handlerMousemove)
        window.removeEventListener('touchmove', this.handlerMousemove)
      })
    },
    handlerMouseup() {
      this.mousedown = false
    },
    handlerMousemove(e) {
      if (this.mousedown) {
        let movementX = 0
        let movementY = 0
        if (e.touches) {
          const { clientX, clientY } = e.touches[0]
          movementX = clientX - this.prevClientX
          movementY = clientY - this.prevClientY
          this.prevClientX = clientX
          this.prevClientY = clientY
        } else {
          const pageX = e.pageX
          const pageY = e.pageY
          movementX = pageX - this.prevClientX
          movementY = pageY - this.prevClientY
          this.prevClientX = pageX
          this.prevClientY = pageY
        }
        const { width: containerWidth, height: containerHeight } = this.cropContainerDimensions
        const { top, left, height, width } = this.cropArea
        let targetHeight = 0
        let targetTop = 0
        let targetWidth = 0
        let targetLeft = 0
        const minSize = 65
        switch (this.cropResizeHandler) {
          case CropHandlers.CONTENT:
            this.$emit('update:cropArea', {
              ...this.cropArea,
              top: Math.min(Math.max(top + movementY, 0), containerHeight - height),
              left: Math.min(Math.max(left + movementX, 0), containerWidth - width)
            })
            break
          case CropHandlers.TOP:
            targetHeight = height - movementY
            targetTop = top + movementY
            if (targetTop >= 0 && targetHeight >= minSize) {
              this.$emit('update:cropArea', {
                ...this.cropArea,
                top: targetTop,
                height: targetHeight
              })
            }
            break
          case CropHandlers.BOTTOM:
            targetHeight = height + movementY
            if (targetHeight >= minSize) {
              this.$emit('update:cropArea', {
                ...this.cropArea,
                height: Math.min(targetHeight, containerHeight - top)
              })
            }
            break
          case CropHandlers.LEFT:
            targetWidth = width - movementX
            targetLeft = left + movementX
            if (targetLeft >= 0 && targetWidth >= minSize) {
              this.$emit('update:cropArea', {
                ...this.cropArea,
                left: targetLeft,
                width: targetWidth
              })
            }
            break
          case CropHandlers.RIGHT:
            targetWidth = width + movementX
            if (targetWidth >= minSize) {
              this.$emit('update:cropArea', {
                ...this.cropArea,
                width: Math.min(targetWidth, containerWidth - left)
              })
            }
            break
          case CropHandlers.TOPLEFT:
            targetHeight = height - movementY
            targetTop = top + movementY
            targetWidth = width - movementX
            targetLeft = left + movementX
            if (
              targetTop >= 0 &&
              targetHeight >= minSize &&
              targetLeft >= 0 &&
              targetWidth >= minSize
            ) {
              this.$emit('update:cropArea', {
                ...this.cropArea,
                top: targetTop,
                height: targetHeight,
                left: targetLeft,
                width: targetWidth
              })
            }
            break
          case CropHandlers.TOPRIGHT:
            targetHeight = height - movementY
            targetTop = top + movementY
            targetWidth = width + movementX
            if (targetTop >= 0 && targetHeight >= minSize && targetWidth >= minSize) {
              this.$emit('update:cropArea', {
                ...this.cropArea,
                top: targetTop,
                height: targetHeight,
                width: Math.min(targetWidth, containerWidth - left)
              })
            }
            break
          case CropHandlers.BOTTOMLEFT:
            targetHeight = height + movementY
            targetWidth = width - movementX
            targetLeft = left + movementX
            if (targetHeight >= minSize && targetLeft >= 0 && targetWidth >= minSize) {
              this.$emit('update:cropArea', {
                ...this.cropArea,
                height: Math.min(targetHeight, containerHeight - top),
                left: targetLeft,
                width: targetWidth
              })
            }
            break
          case CropHandlers.BOTTOMRIGHT:
            targetHeight = height + movementY
            targetWidth = width + movementX
            if (targetHeight >= minSize && targetWidth >= minSize) {
              this.$emit('update:cropArea', {
                ...this.cropArea,
                height: Math.min(targetHeight, containerHeight - top),
                width: Math.min(targetWidth, containerWidth - left)
              })
            }
            break
        }
      }
    },
    doCrop() {
      if (this.cropHidden) {
        const canvasRef = this.getCanvasRef()
        const { width, height } = canvasRef.getBoundingClientRect()
        this.cropContainerDimensions = {
          width,
          height
        }
        this.$emit('update:cropArea', {
          top: height / 4,
          left: width / 4,
          height: height / 2,
          width: width / 2
        })
        this.$emit('update:cropHidden', false)
      } else {
        this.resetCrop()
      }
    },
    resetCrop() {
      const canvasRef = this.getCanvasRef()
      const { width, height } = canvasRef.getBoundingClientRect()
      this.$emit('update:cropArea', {
        top: 0,
        left: 0,
        height: height,
        width: width
      })
      this.$emit('update:cropHidden', true)
    }
  }
}
</script>

<style>
.image-crop-container {
  position: absolute;
  z-index: 1;
  overflow: hidden;
}
.image-crop-container[hidden] {
  display: none !important;
}
.image-crop-content {
  box-sizing: border-box;
  position: absolute;
  box-shadow: 0 0 10000px 10000px rgba(0, 0, 0, 0.4);
  cursor: move;
  border: 1px solid #007af5;
}
.crop-handler {
  position: absolute;
  background: #007af5;
  width: 8px;
  height: 8px;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
}
.crop-top {
  bottom: auto;
  cursor: ns-resize;
}
.crop-bottom {
  top: auto;
  cursor: ns-resize;
}
.crop-left {
  right: auto;
  cursor: ew-resize;
}
.crop-right {
  left: auto;
  cursor: ew-resize;
}
.crop-top-left {
  bottom: auto;
  right: auto;
  cursor: nwse-resize;
}
.crop-top-right {
  bottom: auto;
  left: auto;
  cursor: nesw-resize;
}
.crop-bottom-left {
  top: auto;
  right: auto;
  cursor: nesw-resize;
}
.crop-bottom-right {
  top: auto;
  left: auto;
  cursor: nwse-resize;
}
.crop-toolbar {
  position: absolute;
  right: 0;
  background: #fff;
}
.image-crop-fixed {
  box-shadow: 0 0 10000px 10000px #fff;
  border-color: transparent;
  cursor: default;
}
.image-crop-fixed .crop-handler {
  display: none;
}
</style>
