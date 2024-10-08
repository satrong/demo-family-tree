import React, { useEffect, useRef } from 'react'
import { flextree } from 'd3-flextree'

interface FamilyMember {
  name: string
  children?: FamilyMember[]
}

const familyData: FamilyMember = {
  name: 'Grandparent',
  children: [
    {
      name: 'Parent 1',
      children: [
        { name: 'Child 1' },
        { name: 'Child 2' },
      ],
    },
    {
      name: 'Parent 2',
      children: [
        { name: 'Child 3' },
        { name: 'Child 4' },
      ],
    },
  ],
}

const FamilyTree: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const layout = flextree<FamilyMember>()
      .nodeSize((node) => [100, 50])
      .spacing(() => 20)

    const tree = layout.hierarchy(familyData)
    layout(tree)

    const drawNode = (node: any) => {
      const x = node.x + canvas.width / 2
      const y = node.y + 50

      ctx.fillStyle = '#4A5568'
      ctx.fillRect(x - 40, y - 15, 80, 30)
      ctx.fillStyle = '#FFFFFF'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(node.data.name, x, y + 5)

      if (node.parent) {
        ctx.strokeStyle = '#718096'
        ctx.beginPath()
        ctx.moveTo(x, y - 15)
        ctx.lineTo(x, y - 25)
        ctx.lineTo(node.parent.x + canvas.width / 2, node.parent.y + 65)
        ctx.stroke()
      }

      if (node.children) {
        node.children.forEach(drawNode)
      }
    }

    canvas.width = 800
    canvas.height = 400
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawNode(tree)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="border border-gray-300 rounded-lg shadow-lg"
      width={800}
      height={400}
    />
  )
}

export default FamilyTree