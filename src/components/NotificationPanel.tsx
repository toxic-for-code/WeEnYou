'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface Notification {
  _id: string;
  type: string;
  message: string;
  createdAt: string;
  read: boolean;
  link?: string;
}

interface NotificationPanelProps {
  notifications: Notification[];
  loading: boolean;
  onMarkAsRead: (id: string) => void;
  onClose: () => void;
  isMobile: boolean;
}

export default function NotificationPanel({ 
  notifications, 
  loading, 
  onMarkAsRead, 
  onClose,
  isMobile 
}: NotificationPanelProps) {
  const router = useRouter();

  const handleNotificationClick = (n: Notification) => {
    onMarkAsRead(n._id);
    if (n.link) {
      router.push(n.link);
    } else if (n.type === 'booking') {
      router.push('/profile');
    } else if (n.type === 'message') {
      router.push('/messages');
    }
    onClose();
  };

  const panelClasses = isMobile
    ? "fixed inset-x-0 bottom-0 z-[100] bg-white rounded-t-3xl shadow-2xl flex flex-col transition-transform duration-300 transform translate-y-0 h-[70vh] max-h-[70vh]"
    : "absolute right-0 top-full mt-4 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden flex flex-col max-h-[500px]";

  const backdropClasses = isMobile
    ? "fixed inset-0 bg-black/40 z-[90] backdrop-blur-sm transition-opacity"
    : "fixed inset-0 z-40 lg:hidden"; // Desktop might not need backdrop if we use focus/blur, but good for mobile/small desktop

  return (
    <>
      <div className={backdropClasses} onClick={onClose} />
      <div className={panelClasses}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 flex-shrink-0">
          <h3 className="text-xl font-black text-gray-900">Notifications</h3>
          {isMobile && (
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
              <div className="animate-spin h-6 w-6 border-2 border-[#C89B3C] border-t-transparent rounded-full"></div>
              <span className="text-xs font-bold uppercase tracking-widest">Syncing updates...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-300 gap-4">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">No new updates</span>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  className={`relative p-5 cursor-pointer transition-all hover:bg-gray-50 group ${
                    !n.read ? 'bg-[#C89B3C]/5' : ''
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-start">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                        n.type === 'booking' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {n.type}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400">
                        {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className={`text-sm leading-snug mt-1 ${n.read ? 'text-gray-600' : 'text-gray-900 font-bold'}`}>
                      {n.message}
                    </p>
                  </div>
                  {!n.read && (
                    <div className="absolute top-6 left-1.5 w-1.5 h-1.5 bg-[#C89B3C] rounded-full shadow-sm shadow-[#C89B3C]/50" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-50 bg-gray-50/50 flex-shrink-0">
          <button 
            onClick={() => { router.push('/profile'); onClose(); }}
            className="w-full py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:border-[#C89B3C] hover:text-[#C89B3C] transition-all shadow-sm"
          >
            Manage All Notifications
          </button>
        </div>
      </div>
    </>
  );
}
