import React from 'react';

const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M16 11a4 4 0 10-8 0 4 4 0 008 0zM12 15c-3.866 0-7 1.79-7 4v1h14v-1c0-2.21-3.134-4-7-4z" />
    <path d="M20.188 16.035A6.002 6.002 0 0015 13a4 4 0 10-2.668-3.612A5.991 5.991 0 0012 9a6 6 0 00-6.188 7.035C3.593 17.153 2 18.961 2 21h1.088A19.99 19.99 0 0112 17c4.213 0 7.957 1.258 10.912 4H22c0-2.039-1.593-3.847-3.812-4.965zM12 13a2 2 0 110-4 2 2 0 010 4z" />
  </svg>
);
export default UsersIcon;