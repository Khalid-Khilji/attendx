import { NavLink, Link } from 'react-router-dom'
import { GraduationCap, Mail, Phone, MapPin } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ]

  return (
    <footer className="border-t border-zinc-200 bg-white transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 pt-8 pb-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          
          <div className="flex flex-col items-center md:items-start">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-violet-600 p-1.5 rounded-lg text-white">
                <GraduationCap size={22} />
              </div>
              <span className="text-xl font-bold dark:text-white uppercase tracking-tight">
                Attend<span className="text-violet-600">x</span>
              </span>
            </Link>
            <p className="mt-4 text-center md:text-left text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 max-w-xs">
              Next-gen attendance management system to track, manage, and optimize student presence effortlessly.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white mb-4">
              Quick Links
            </h3>
            <nav className="flex flex-col items-center gap-3">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) => 
                    `text-sm font-medium transition-all duration-200 ${
                      isActive 
                      ? "text-violet-600 dark:text-violet-400 scale-110" 
                      : "text-zinc-500 hover:text-violet-600 dark:text-zinc-400"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex flex-col items-center md:items-end">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white mb-4">
              Get in Touch
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400 justify-center md:justify-end">
                <span>support@attendx.com</span>
                <Mail size={16} className="text-violet-600" />
              </li>
              <li className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400 justify-center md:justify-end">
                <span>+91 98765 43210</span>
                <Phone size={16} className="text-violet-600" />
              </li>
              <li className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400 justify-center md:justify-end">
                <span>Mumbai, India</span>
                <MapPin size={16} className="text-violet-600" />
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-8 border-t border-zinc-100 pt-4 dark:border-zinc-800 text-center">
          <p className="text-sm font-medium text-zinc-500">
            © {currentYear} Attendx. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer