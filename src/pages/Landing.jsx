import { useState } from 'react';
import { Link } from "react-router-dom";

export default function Landing() {
  const [activeNav, setActiveNav] = useState('home');

  const navItems = [
    { id: 'home', label: 'Home', href: '/' },
    { id: 'students', label: 'Students', href: '/students' },
    { id: 'subjects', label: 'Subjects', href: '/subjects' },
    { id: 'grades', label: 'Grades', href: '/grades' }
  ];

  return (
    <div className="min-h-screen bg-black text-gray-100">
      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg shadow-lg shadow-cyan-500/50"></div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent">
                IT Dashboard
              </span>
            </div>
            <div className="flex space-x-1">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveNav(item.id);
                  }}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                    activeNav === item.id
                      ? 'bg-cyan-500/20 text-cyan-400 shadow-lg shadow-cyan-500/20'
                      : 'text-gray-400 hover:text-cyan-300 hover:bg-gray-800/50'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Profile Section */}
          <div className="space-y-6">
            <div className="relative inline-block">
              <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-700 shadow-2xl shadow-cyan-500/30 overflow-hidden border-2 border-cyan-400/50">
                <img 
                  src="./public/profile.jpg" 
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-cyan-500 rounded-full blur-xl opacity-50"></div>
              <div className="absolute -top-2 -left-2 w-12 h-12 bg-cyan-400 rounded-full blur-lg opacity-40"></div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-500 bg-clip-text text-transparent">
                Junard Bendoy
              </h1>
              <p className="text-xl text-gray-400">Information Technology Student</p>
            </div>

            {/* Quick Stats */}
          </div>

          {/* Journey Story */}
          <div className="bg-gray-900/30 border border-gray-800 rounded-2xl p-8 backdrop-blur-sm hover:border-cyan-500/30 transition-all duration-500 shadow-xl">
            <h2 className="text-3xl font-bold mb-6 text-cyan-400 flex items-center">
              <span className="w-2 h-8 bg-gradient-to-b from-cyan-400 to-cyan-600 rounded-full mr-3"></span>
              My IT Journey
            </h2>
            
            <div className="space-y-6 text-gray-300 leading-relaxed">
              <div className="pl-5 border-l-2 border-cyan-500/30">
                <h3 className="text-lg font-semibold text-cyan-300 mb-2">First Year: The Foundation</h3>
                <p className="text-gray-400">
                  My journey in Information Technology began with curiosity and excitement. I dove into programming fundamentals, learning Python and Java while discovering the vast possibilities of technology. Late-night coding sessions became my norm as I built my first console applications.
                </p>
              </div>

              <div className="pl-5 border-l-2 border-cyan-500/30">
                <h3 className="text-lg font-semibold text-cyan-300 mb-2">Second Year: Building Skills</h3>
                <p className="text-gray-400">
                  I explored web development, database management, and data structures. Creating my first full-stack application was a breakthrough moment. I joined coding competitions and hackathons, learning that collaboration and problem-solving go hand in hand.
                </p>
              </div>

              <div className="pl-5 border-l-2 border-cyan-500/30">
                <h3 className="text-lg font-semibold text-cyan-300 mb-2">Third Year: Specialization</h3>
                <p className="text-gray-400">
                  I focused on modern frameworks like React and Node.js, diving deep into cloud technologies and DevOps practices. My internship experience taught me the importance of clean code, testing, and agile methodologies in real-world projects.
                </p>
              </div>
            </div>
          </div>
        </div> 
      </div>

      {/* Decorative Elements */}
      <div className="fixed top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>
    </div>
  );
}