
const Footer = () => {
  const currPath = window.location.pathname.split('/')[1];
  return (
    <footer className={`py-4 poppins-light ${currPath === 'whiteboard' ? 'hidden' : ''}`}
    // make transparent glass UI for footer
    style={{
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      backdropFilter: "saturate(180%) blur(20px)",
      // position: "fixed",
      width: "100%",
      // bottom: 0,
    }}
    >
        <div className="container mx-auto text-center">
          <p className="">© 2024 Collaboration Tool by Aditya. All rights reserved.</p>
        </div>
      </footer>
  )
}

export default Footer
