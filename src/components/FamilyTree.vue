<template>
  <div class="family-tree-container">
    <div class="layout-buttons absolute top-4 right-4 z-10">
      <button
        @click="setLayout('vertical')"
        :class="{ 'bg-blue-500': layout === 'vertical', 'bg-gray-300': layout !== 'vertical' }"
        class="px-3 py-1 rounded-l-md text-white font-semibold transition-colors duration-200"
      >
        Vertical
      </button>
      <button
        @click="setLayout('horizontal')"
        :class="{ 'bg-blue-500': layout === 'horizontal', 'bg-gray-300': layout !== 'horizontal' }"
        class="px-3 py-1 rounded-r-md text-white font-semibold transition-colors duration-200"
      >
        Horizontal
      </button>
    </div>
    <canvas 
      ref="canvasRef" 
      class="family-tree-canvas border border-gray-300 rounded-lg shadow-lg cursor-move" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { flextree } from 'd3-flextree'
import { familyData } from '../config/familyTreeData'
import type { FamilyMember } from '../types/FamilyMember'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const offsetX = ref(0)
const offsetY = ref(0)
const layout = ref<'vertical' | 'horizontal'>('vertical')
let isDragging = false
let lastX = 0
let lastY = 0
let scale = 1

const getLayout = () => {
  return flextree<FamilyMember>()
    .nodeSize(layout.value === 'vertical' ? [120, 100] : [150, 80])
    .spacing(() => 30)
}

const drawNode = (ctx: CanvasRenderingContext2D, node: any) => {
  const nodeWidth = 100
  const nodeHeight = 40
  let x, y

  if (layout.value === 'vertical') {
    x = node.x
    y = node.y
  } else {
    x = node.y
    y = node.x
  }

  // Draw node
  ctx.fillStyle = '#4A5568'
  ctx.fillRect(x, y - nodeHeight / 2, nodeWidth, nodeHeight)
  ctx.fillStyle = '#FFFFFF'
  ctx.font = '12px Arial'
  ctx.textAlign = layout.value === 'vertical' ? 'center' : 'right'
  ctx.textBaseline = 'middle'
  ctx.fillText(node.data.name, layout.value === 'vertical' ? x + nodeWidth / 2 : x + nodeWidth - 5, y)

  // Draw orthogonal lines
  if (node.parent) {
    ctx.strokeStyle = '#718096'
    ctx.lineWidth = 1
    ctx.beginPath()
    if (layout.value === 'vertical') {
      ctx.moveTo(x + nodeWidth / 2, y - nodeHeight / 2)
      ctx.lineTo(x + nodeWidth / 2, (y + node.parent.y) / 2)
      ctx.lineTo(node.parent.x + nodeWidth / 2, (y + node.parent.y) / 2)
      ctx.lineTo(node.parent.x + nodeWidth / 2, node.parent.y + nodeHeight / 2)
    } else {
      ctx.moveTo(x + nodeWidth, y)
      ctx.lineTo(x + nodeWidth + (node.parent.y - x - nodeWidth) / 2, y)
      ctx.lineTo(x + nodeWidth + (node.parent.y - x - nodeWidth) / 2, node.parent.x)
      ctx.lineTo(node.parent.y, node.parent.x)
    }
    ctx.stroke()
  }

  if (node.children) {
    node.children.forEach((child: any) => drawNode(ctx, child))
  }
}

const draw = () => {
  if (!canvasRef.value) return
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const tree = getLayout().hierarchy(familyData)
  getLayout()(tree)

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.save()
  ctx.scale(scale, scale)
  if (layout.value === 'vertical') {
    ctx.translate(canvas.width / (2 * scale) + offsetX.value, 50 + offsetY.value)
  } else {
    ctx.translate(50 + offsetX.value, canvas.height / (2 * scale) + offsetY.value)
  }
  drawNode(ctx, tree)
  ctx.restore()
}

const setLayout = (newLayout: 'vertical' | 'horizontal') => {
  layout.value = newLayout
  resetView()
  draw()
}

const resetView = () => {
  offsetX.value = 0
  offsetY.value = 0
  scale = 1
}

onMounted(() => {
  if (!canvasRef.value) return

  const canvas = canvasRef.value

  const handleResize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    draw()
  }

  const handleStart = (e: MouseEvent | TouchEvent) => {
    isDragging = true
    if (e instanceof MouseEvent) {
      lastX = e.clientX
      lastY = e.clientY
    } else {
      lastX = e.touches[0].clientX
      lastY = e.touches[0].clientY
    }
  }

  const handleMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return
    let clientX, clientY
    if (e instanceof MouseEvent) {
      clientX = e.clientX
      clientY = e.clientY
    } else {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    }
    const dx = (clientX - lastX) / scale
    const dy = (clientY - lastY) / scale
    offsetX.value += dx
    offsetY.value += dy
    lastX = clientX
    lastY = clientY
    draw()
  }

  const handleEnd = () => {
    isDragging = false
  }

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const mouseX = e.clientX
    const mouseY = e.clientY
    
    const canvasRect = canvas.getBoundingClientRect()
    const canvasX = (mouseX - canvasRect.left - canvas.width / 2) / scale
    const canvasY = (mouseY - canvasRect.top - canvas.height / 2) / scale

    scale *= delta
    scale = Math.max(0.1, Math.min(scale, 3))

    offsetX.value = mouseX / scale - canvasX - canvas.width / (2 * scale)
    offsetY.value = mouseY / scale - canvasY - canvas.height / (2 * scale)

    draw()
  }

  window.addEventListener('resize', handleResize)
  canvas.addEventListener('mousedown', handleStart)
  canvas.addEventListener('touchstart', handleStart)
  window.addEventListener('mousemove', handleMove)
  window.addEventListener('touchmove', handleMove, { passive: false })
  window.addEventListener('mouseup', handleEnd)
  window.addEventListener('touchend', handleEnd)
  canvas.addEventListener('wheel', handleWheel)

  handleResize()

  watch(layout, () => {
    draw()
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    canvas.removeEventListener('mousedown', handleStart)
    canvas.removeEventListener('touchstart', handleStart)
    window.removeEventListener('mousemove', handleMove)
    window.removeEventListener('touchmove', handleMove)
    window.removeEventListener('mouseup', handleEnd)
    window.removeEventListener('touchend', handleEnd)
    canvas.removeEventListener('wheel', handleWheel)
  })
})
</script>

<style scoped>
.family-tree-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

.family-tree-canvas {
  width: 100%;
  height: 100%;
  touch-action: none;
}
</style>