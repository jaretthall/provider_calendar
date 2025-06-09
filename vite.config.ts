import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const isProduction = mode === 'production';
  const isDevelopment = mode === 'development';
  
  return {
    // Base path for GitHub Pages (repository name)
    base: isProduction ? '/Calendar/' : '/',
    // Environment variables
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      __DEV__: isDevelopment,
      __PROD__: isProduction,
    },
    
    // Path resolution
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        '@components': path.resolve(__dirname, './components'),
        '@utils': path.resolve(__dirname, './utils'),
        '@hooks': path.resolve(__dirname, './hooks'),
        '@types': path.resolve(__dirname, './types'),
      }
    },
    
    // Build configuration
    build: {
      // Output directory
      outDir: 'dist',
      
      // Clean dist before build
      emptyOutDir: true,
      
      // Generate source maps for production debugging (disabled for better performance)
      sourcemap: isDevelopment,
      
      // Minification
      minify: isProduction ? 'esbuild' : false,
      
      // Target modern browsers for better optimization
      target: ['es2020', 'chrome80', 'firefox78', 'safari14', 'edge88'],
      
      // Chunk size warning limit (increased for healthcare app)
      chunkSizeWarningLimit: 1500,
      
      // CSS code splitting
      cssCodeSplit: true,
      
      // Rollup specific options
      rollupOptions: {
        output: {
          // Manual chunk splitting for better caching
          manualChunks: {
            // Vendor chunk for React and related libraries
            'vendor-react': ['react', 'react-dom'],
            
            // Supabase and authentication
            'vendor-supabase': ['@supabase/supabase-js'],
            
            // Drag and drop functionality
            'vendor-dnd': ['@dnd-kit/core', '@dnd-kit/utilities'],
            
            // PDF generation libraries (separate chunk due to size)
            'vendor-pdf': ['jspdf', 'html2canvas'],
            
            // Utilities
            'vendor-utils': ['uuid']
          },
          
          // Naming patterns for assets
          chunkFileNames: isProduction ? 'assets/js/[name]-[hash].js' : 'assets/js/[name].js',
          entryFileNames: isProduction ? 'assets/js/[name]-[hash].js' : 'assets/js/[name].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name?.split('.') || [];
            const ext = info[info.length - 1];
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return isProduction ? 'assets/images/[name]-[hash].[ext]' : 'assets/images/[name].[ext]';
            }
            if (/css/i.test(ext)) {
              return isProduction ? 'assets/css/[name]-[hash].[ext]' : 'assets/css/[name].[ext]';
            }
            return isProduction ? 'assets/[ext]/[name]-[hash].[ext]' : 'assets/[ext]/[name].[ext]';
          }
        },
        
        // External dependencies (if needed for specific deployments)
        external: [],
        
        // Tree shaking
        treeshake: isProduction
      },
      
      // Asset optimization
      assetsInlineLimit: 4096, // Inline assets smaller than 4kb
      
      // Report compressed file sizes
      reportCompressedSize: true,
      
      // Terser options for better minification
      terserOptions: isProduction ? {
        compress: {
          drop_console: true, // Remove console.log in production
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug'],
        },
        mangle: {
          safari10: true
        }
      } : undefined
    },
    
    // Development server configuration
    server: {
      port: 5173,
      host: true,
      open: false,
      cors: true,
      hmr: {
        overlay: true
      }
    },
    
    // Preview server configuration
    preview: {
      port: 4173,
      host: true,
      open: false,
      cors: true
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
      exclude: ['jspdf', 'html2canvas'] // These can be loaded dynamically for better performance
    },
    
    // CSS configuration
    css: {
      devSourcemap: isDevelopment,
      postcss: './postcss.config.js'
    },
    
    // Performance and caching
    esbuild: {
      // Remove debug statements in production
      drop: isProduction ? ['console', 'debugger'] : [],
      
      // Legal comments handling
      legalComments: 'none'
    }
  };
});
