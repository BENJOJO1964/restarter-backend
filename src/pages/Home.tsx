import React from 'react'

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">
          Restarter
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your AI Voice Companion
        </p>
        <div className="space-y-4">
          <p className="text-lg text-gray-700">
            Welcome to the future of voice interaction
          </p>
          <p className="text-gray-600">
            Frontend successfully deployed on Vercel! 🚀
          </p>
        </div>
      </div>
    </div>
  )
}

export default Home
