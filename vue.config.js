module.exports = {
  chainWebpack: (config) => {
    // 删除默认的splitChunk
    config.optimization.delete('splitChunks')

    // set svg-sprite-loader
    const svgRule = config.module.rule('svg')
    svgRule.uses.clear()
    svgRule
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]',
        include: ['src/icons/svg']
      })
  }
}
