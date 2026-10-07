import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-brand-navy text-white pt-16 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Logo & Info */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex flex-col select-none">
              <span className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-1.5">
                <span className="w-8 h-8 rounded-lg bg-brand-orange flex items-center justify-center text-white text-lg font-black">H</span>
                HomeHive
              </span>
              <span className="text-[10px] tracking-[0.2em] font-bold text-white/55 uppercase -mt-1 ml-9">
                Trusted Services
              </span>
            </Link>
            <p className="text-sm text-gray-400 mt-2 leading-relaxed">
              Connecting you with verified and trusted local professionals for cleaning, plumbing, electrical, and other home utility services.
            </p>
            <div className="flex gap-4 mt-2">
              <a href="#" className="p-2 rounded-full bg-gray-800 hover:bg-brand-orange transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/></svg>
              </a>
              <a href="#" className="p-2 rounded-full bg-gray-800 hover:bg-brand-orange transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </a>
              <a href="#" className="p-2 rounded-full bg-gray-800 hover:bg-brand-orange transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="#" className="p-2 rounded-full bg-gray-800 hover:bg-brand-orange transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-md font-bold text-white mb-6 uppercase tracking-wider text-xs text-brand-orange">Company</h4>
            <ul className="flex flex-col gap-3 text-sm text-gray-400">
              <li><Link to="/#how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Press & Media</a></li>
            </ul>
          </div>

          {/* Popular Services */}
          <div>
            <h4 className="text-md font-bold text-white mb-6 uppercase tracking-wider text-xs text-brand-orange">Popular Services</h4>
            <ul className="flex flex-col gap-3 text-sm text-gray-400">
              <li><Link to="/services?category=Plumbing" className="hover:text-white transition-colors">Plumbing Service</Link></li>
              <li><Link to="/services?category=Electrical" className="hover:text-white transition-colors">Electrical Repairs</Link></li>
              <li><Link to="/services?category=Cleaning" className="hover:text-white transition-colors">Deep Cleaning</Link></li>
              <li><Link to="/services?category=AC Repair" className="hover:text-white transition-colors">Air Conditioner Fixing</Link></li>
              <li><Link to="/services?category=Carpentry" className="hover:text-white transition-colors">Carpenter Work</Link></li>
            </ul>
          </div>

          {/* Office Contact Info */}
          <div>
            <h4 className="text-md font-bold text-white mb-6 uppercase tracking-wider text-xs text-brand-orange">Get in Touch</h4>
            <ul className="flex flex-col gap-4 text-sm text-gray-400">
              <li className="flex gap-3 items-start">
                <MapPin size={18} className="text-brand-orange flex-shrink-0 mt-0.5" />
                <span>102, Sigma Tech Park, Whitefield, Bengaluru, Karnataka - 560066</span>
              </li>
              <li className="flex gap-3 items-center">
                <Phone size={16} className="text-brand-orange flex-shrink-0" />
                <span>+91 80 4455 6677</span>
              </li>
              <li className="flex gap-3 items-center">
                <Mail size={16} className="text-brand-orange flex-shrink-0" />
                <span>support@homehive.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright & terms */}
        <div className="border-t border-gray-800 pt-8 mt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400 gap-4">
          <p>© {new Date().getFullYear()} HomeHive. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
