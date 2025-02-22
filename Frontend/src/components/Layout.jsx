import React from "react"
// import ChatComponent from "./ChatComponent" // Import the ChatComponent component
import LinkedInMessages from "./Chat/LinkedInMessages"

const Layout = ({ children }) => {
  return (
    <div style={{ position: "relative", zIndex: 2 }}> {/* Add zIndex here */}
      {/* Render the children (page content) */}
      {children}

      {/* Include the ChatComponent component */}
      <LinkedInMessages />
    </div>
  )
}

export default Layout