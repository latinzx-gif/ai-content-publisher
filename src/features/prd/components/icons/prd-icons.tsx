'use client';

import type { ComponentType } from 'react';
import { Archive, Bell, Bot, Filter, Settings, UploadCloud } from 'lucide-react';

export function SettingsMenuIcon({ name }: { name: string }) {
  const iconMap: Record<string, ComponentType<{ className?: string }>> = {
    Profile: UsersIcon,
    Preferences: Filter,
    Notifications: Bell,
    'API Tokens': KeyIcon,
    Daemon: Bot,
    Updates: UploadCloud,
    General: Settings,
    Repositories: Archive,
    GitHub: GithubIcon,
    'Codex Local': Bot,
    Integrations: PlugIcon,
    'Google Drive': DriveIcon,
    Facebook: FacebookIcon,
    Labs: FlaskIcon,
    Members: UsersIcon,
  };
  const Icon = iconMap[name] ?? Settings;
  return <Icon className="h-3.5 w-3.5 text-[#5f5f58]" />;
}

export function KeyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="15.5" r="4.5" />
      <path d="m11 12 8-8" />
      <path d="m16 5 3 3" />
      <path d="m14 7 3 3" />
    </svg>
  );
}

export function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.18-3.37-1.18-.45-1.15-1.1-1.46-1.1-1.46-.9-.61.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.9.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.6 9.6 0 0 1 12 6.02c.85 0 1.7.11 2.5.34 1.9-1.29 2.74-1.02 2.74-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.86v2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2z" />
    </svg>
  );
}

export function PlugIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22v-5" />
      <path d="M9 8V2" />
      <path d="M15 8V2" />
      <path d="M6 8h12v4a6 6 0 0 1-12 0V8z" />
    </svg>
  );
}

export function FlaskIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h6" />
      <path d="M10 3v6l-5 9a3 3 0 0 0 2.6 4.5h8.8A3 3 0 0 0 19 18l-5-9V3" />
      <path d="M7.5 15h9" />
    </svg>
  );
}

export function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function DriveIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 4h7l6 10.5-3.5 5.5H6L2.5 14.5 8.5 4z" />
      <path d="M8.5 4 12 10.5l-6 9.5" />
      <path d="M15.5 4 12 10.5l6 9.5" />
      <path d="M2.5 14.5h19" />
    </svg>
  );
}

export function ObsidianIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 3.5 15.5 2l4.5 6.5-2.5 10L9 22l-5-6.5 1.5-8L7 3.5z" />
      <path d="m7 3.5 4.5 5L20 8.5" />
      <path d="m11.5 8.5-2.5 7L9 22" />
      <path d="m9 15.5 8.5 3" />
      <path d="m5.5 7.5 5.5 1" />
    </svg>
  );
}

export function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 8.5V6.9c0-.8.2-1.3 1.4-1.3H17V2.8c-.8-.1-1.7-.2-2.5-.2-2.5 0-4.2 1.5-4.2 4.3v1.6H7.5v3.2h2.8v8.8H14v-8.8h2.8l.4-3.2H14z" />
    </svg>
  );
}

export function OpenAIIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3.2a4.4 4.4 0 0 1 4.1 2.8 4.4 4.4 0 0 1 4 6.5 4.4 4.4 0 0 1-2.2 7.4 4.4 4.4 0 0 1-7.1 1.1 4.4 4.4 0 0 1-6.9-2.8 4.4 4.4 0 0 1-4-6.5 4.4 4.4 0 0 1 2.2-7.4A4.4 4.4 0 0 1 9.2 3.3 4.5 4.5 0 0 1 12 3.2z" />
      <path d="M7.3 8.5 12 5.7l4.7 2.8v5.4L12 16.7 7.3 13.9V8.5z" />
      <path d="M12 5.7v5.4l4.7 2.8" />
      <path d="m7.3 8.5 4.7 2.6v5.6" />
    </svg>
  );
}

export function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5.4 8.6H2.6v12.1h2.8V8.6zM4 3.3a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4zM21.4 14.1c0-3.7-2-5.8-4.7-5.8-2.1 0-3.1 1.2-3.6 2V8.6h-2.8v12.1h2.8v-6.4c0-1.7.8-3.2 2.6-3.2 1.7 0 2.8 1.1 2.8 3.4v6.2h2.9v-6.6z" />
    </svg>
  );
}

export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function BufferIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3 9 5-9 5-9-5 9-5z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 16 9 5 9-5" />
    </svg>
  );
}

export function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="18" height="12" rx="3" />
      <path d="m10 9 5 3-5 3V9z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TiktokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3v11.2a4.2 4.2 0 1 1-4-4.2" />
      <path d="M14 3c.6 3.2 2.4 5 5 5" />
    </svg>
  );
}

export function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 0 20" />
      <path d="M12 2a15.3 15.3 0 0 0 0 20" />
    </svg>
  );
}

export function MousePointerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4l7.5 16 2.2-6.3L20 11.5 4 4z" />
    </svg>
  );
}
