import React from 'react'
import { PenToolIcon as Tool, Car } from 'lucide-react'

export function ServiceHeader() {
  return (
    <header className="text-center">
      <div className="flex justify-center space-x-4 mb-4">
        <Tool className="h-12 w-12 text-primary" />
        <Car className="h-12 w-12 text-primary" />
      </div>
      <h1 className="text-4xl font-bold mb-2">Manage Services</h1>
      <p className="text-xl text-muted-foreground">
        Add and manage the services your workshop provides to customers.
      </p>
    </header>
  )
}

