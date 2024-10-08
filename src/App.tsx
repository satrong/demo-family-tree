import React from 'react'
import FamilyTree from './components/FamilyTree'
import { Users } from 'lucide-react'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4 flex items-center">
        <Users className="mr-2" />
        Family Tree Visualization
      </h1>
      <FamilyTree />
    </div>
  )
}

export default App