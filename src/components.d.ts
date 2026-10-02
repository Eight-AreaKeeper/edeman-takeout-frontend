export {}

declare module 'vue' {
  interface GlobalComponents {
    VChart: (typeof import('vue-echarts'))['default']
  }
}
