<template>
  <div
    :class="{ 'image-editor-mask-hidden': !open }"
    class="image-editor-mask"
    @keyup="bindHotkey"
    tabindex="-1"
  >
    <editor-dialog
      v-on="$listeners"
      ref="editorDialogRef"
      v-if="isInit"
      :src="currentSrc"
      @doComplete="doComplete"
      @doCancel="doCancel"
    />
  </div>
</template>

<script>
import EditorDialog from './EditorDialog.vue'
export default {
  name: 'ImageEditor',
  props: {
    open: {
      type: Boolean,
      default: false
    },
    src: {
      type: String,
      default: ''
    },
    businessId: {
      // 决策点ID/决策依据ID
      type: [String, Number],
      required: true
    },
    businessType: {
      // 0 决策点，1 决策依据
      type: [String, Number],
      default: 0,
      required: true
    },
    position: {
      // 文件位置
      type: [String, Number],
      default: ''
    },
    sequence: {
      // 文件顺序
      type: [String, Number],
      default: ''
    },
    obj: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  components: {
    EditorDialog
  },
  data() {
    return {
      isInit: false,
      currentSrc: '',
      originSrc: ''
    }
  },
  watch: {
    src: {
      handler() {
        this.pretreatment()
        if (this.originSrc && this.originSrc !== this.src) {
          this.$nextTick(() => {
            const editorDialogRef = this.$refs.editorDialogRef
            editorDialogRef.reInit()
          })
        }
        this.originSrc = this.src
        this.currentSrc = this.src
      },
      immediate: true
    }
  },
  created() {
    this.pretreatment()
  },
  mounted() {
    this.doInit()
  },
  methods: {
    bindHotkey(e) {
      this.$refs.editorDialogRef.bindHotkey(e)
    },
    pretreatment() {
      const originImage = new Image()
      originImage.crossOrigin = 'anonymous'
      originImage.src = this.src
    },
    doInit() {
      this.$watch(
        'open',
        (v) => {
          console.log('open')
          if (v) {
            this.isInit = true
          }
        },
        {
          immediate: true
        }
      )
    },
    doCancel() {
      const editorDialogRef = this.$refs.editorDialogRef
      this.currentSrc = this.src
      this.$nextTick(() => {
        editorDialogRef.reInit()
        this.$emit('update:open', false)
      })
    },
    doComplete(base64, isCrop) {
      const editorDialogRef = this.$refs.editorDialogRef
      if (isCrop) {
        this.currentSrc = base64
        this.$nextTick(() => {
          editorDialogRef.reInit()
        })
      } else {
        this.$nextTick(() => {
          if (!isCrop) {
            editorDialogRef.reInit()
            this.$emit('update:open', false)
          }
        })
      }
    }
  }
}
</script>
<style>
.image-editor-mask {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 99999999;

  display: flex;
  justify-content: center;
  align-items: center;
}
.image-editor-mask[hidden] {
    display: none !important;
  }
.image-editor-mask-hidden {
  visibility: hidden;
}
</style>
