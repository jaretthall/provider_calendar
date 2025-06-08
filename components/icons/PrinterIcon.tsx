import React from 'react';

const PrinterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M7.5 7.5h9V3a.75.75 0 00-.75-.75h-7.5A.75.75 0 007.5 3v4.5zm0 0V10.5a.75.75 0 00.75.75h7.5a.75.75 0 00.75-.75V7.5h2.625A2.625 2.625 0 0121 10.125v6.75A2.625 2.625 0 0118.375 19.5H5.625A2.625 2.625 0 013 16.875v-6.75A2.625 2.625 0 015.625 7.5H7.5zM5.625 9a1.125 1.125 0 00-1.125 1.125v6.75c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-6.75A1.125 1.125 0 0018.375 9H5.625zM6 15.75a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H6.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
    <path d="M9.172 11.172a.75.75 0 011.06 0l1.5 1.5a.75.75 0 01-1.06 1.06l-1.5-1.5a.75.75 0 010-1.06z" />
  </svg>
);

export default PrinterIcon;