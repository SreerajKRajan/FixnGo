import React from 'react'
import { Button } from './ui/button'

export function Navbar() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-semibold">Admin Dashboard</span>
            </div>
          </div>
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => console.log('Logout clicked')}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

