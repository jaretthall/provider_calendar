import React from 'react';

// Icon for a group of users (e.g., Medical Assistants)
const UsersGroupIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M16 11a4 4 0 10-8 0 4 4 0 008 0zM12 15c-3.866 0-7 1.79-7 4v1h14v-1c0-2.21-3.134-4-7-4z" />
    <path d="M21.774 20.235A10.015 10.015 0 0022 20v-1c0-2.21-3.134-4-7-4s-7 1.79-7 4v1c0 .381.044.753.128 1.11A5.002 5.002 0 0112 13a5 5 0 014.872 6.11A10.06 10.06 0 0021.774 20.235zM12 3a1 1 0 011 1v1.787A5.001 5.001 0 0114 10.5V12h-4v-1.5a5.001 5.001 0 011-3.713V4a1 1 0 011-1z" />
    <path d="M7 10.5A3.5 3.5 0 117 3.5V4a3.488 3.488 0 01-1.707 3.031A3.5 3.5 0 017 10.5zM17 10.5a3.5 3.5 0 100-7V4a3.488 3.488 0 001.707 3.031A3.5 3.5 0 0017 10.5z" />
  </svg>
);

export default UsersGroupIcon;