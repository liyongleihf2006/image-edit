<template>
  <div>
    <!-- <el-image :src="src" :preview-src-list="srcList"></el-image> -->
    <button @click="changeOpen">改变open</button>
    <button @click="changeSrc">改变src</button>
    <image-editor
      businessId="1465642620448337922"
      :businessType="1"
      position="zi_ding_yi_de_zhi"
      :open.sync="open"
      :src.sync="src"
    />
    <img :src="src" />
  </div>
</template>

<script>
import ImageEditor from './index.vue'
export default {
  components: {
    ImageEditor
  },
  data() {
    return {
      src: 'https://picsum.photos/seed/1200/2000',
      srcList: ['https://picsum.photos/seed/1200/2000', 'https://picsum.photos/seed/200/300'],
      open: false,
      imageIndex: 0
    }
  },
  methods: {
    changeOpen() {
      this.open = !this.open
    },
    changeSrc() {
      this.imageIndex = (this.imageIndex + 1) % 2
      this.src = this.srcList[this.imageIndex]
    }
  }
}
</script>

<style></style>
