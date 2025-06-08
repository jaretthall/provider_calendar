import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const isProduction = mode === 'production';
  
  return {
    // Environment variables
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    
    // Path resolution
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    
    // Build configuration
    build: {
      // Output directory
      outDir: 'dist',
      
      // Generate source maps for production debugging (optional)
      sourcemap: isProduction ? false : true,
      
      // Minification
      minify: isProduction ? 'esbuild' : false,
      
      // Target modern browsers for better optimization
      target: 'esnext',
      
      // Chunk size warning limit
      chunkSizeWarningLimit: 1000,
      
      // Rollup specific options
      rollupOptions: {
        output: {
          // Manual chunk splitting for better caching
          manualChunks: {
            // Vendor chunk for React and related libraries
            react: ['react', 'react-dom'],
            
            // Drag and drop functionality
            dnd: ['@dnd-kit/core', '@dnd-kit/utilities'],
            
            // PDF generation libraries
            pdf: ['jspdf', 'html2canvas'],
            
            // Utilities
            utils: ['uuid']
          },
          
          // Naming patterns for assets
          chunkFileNames: isProduction ? 'assets/js/[name]-[hash].js' : 'assets/js/[name].js',
          entryFileNames: isProduction ? 'assets/js/[name]-[hash].js' : 'assets/js/[name].js',
          assetFileNames: isProduction ? 'assets/[ext]/[name]-[hash].[ext]' : 'assets/[ext]/[name].[ext]'
        }
      },
      
      // Asset optimization
      assetsInlineLimit: 4096, // Inline assets smaller than 4kb
    },
    
    // Development server configuration
    server: {
      port: 5173,
      host: true,
      open: false
    },
    
    // Preview server configuration
    preview: {
      port: 4173,
      host: true,
      open: false
    },
    
    // Optimization
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        '@dnd-kit/core',
        '@dnd-kit/utilities',
        'uuid'
      ],
      exclude: ['jspdf', 'html2canvas'] // These can be loaded dynamically
    },
    
    // CSS configuration
    css: {
      // PostCSS configuration would go here if needed
      devSourcemap: !isProduction
    }
  };
});
