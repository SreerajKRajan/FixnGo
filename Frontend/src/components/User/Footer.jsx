import { Link } from "@nextui-org/react";

export default function Footer() {
  return (
    <footer className="bg-black text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between">
          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <h3 className="text-lg font-semibold mb-2">FixnGo</h3>
            <p className="text-sm">Your trusted automobile service platform</p>
          </div>
          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
            <ul className="text-sm">
              <li><Link href="#" className="text-white">About Us</Link></li>
              <li><Link href="#" className="text-white">Contact</Link></li>
              <li><Link href="#" className="text-white">Terms of Service</Link></li>
              <li><Link href="#" className="text-white">Privacy Policy</Link></li>
            </ul>
          </div>
          <div className="w-full md:w-1/3">
            <h3 className="text-lg font-semibold mb-2">Connect With Us</h3>
            <div className="flex space-x-4">
              {/* Add social media icons here */}
              <Link href="#" className="text-white">FB</Link>
              <Link href="#" className="text-white">TW</Link>
              <Link href="#" className="text-white">IG</Link>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} FixnGo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

