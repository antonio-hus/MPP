/////////////////////
// IMPORTS SECTION //
/////////////////////


//////////////////////////
// COMPONENT DEFINITION //
//////////////////////////
export default function Footer() {

  // JSX SECTION //
  return (
    <footer className="bg-[#333] text-white p-4 text-sm">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between">
          <div>
            <h3 className="font-bold mb-2">BOOKNOW</h3>
            <p>Sample booking application created for MPP Class by Antonio Hus 924/1.</p>
          </div>
          <div className="mt-4 md:mt-0 px-12 text-right">
            <h3 className="font-bold mb-2">USEFUL LINKS</h3>
            <ul>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Help & Support</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}

