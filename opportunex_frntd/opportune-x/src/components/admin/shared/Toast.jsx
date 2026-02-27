import { Toaster } from 'react-hot-toast';

/**
 * Toast Notification Provider
 * 
 * Usage in App.jsx or main.tsx:
 * import Toast from './components/admin/shared/Toast';
 * 
 * <Toast />
 * <YourApp />
 */

export default function Toast() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerStyle={{
        top: 20,
        right: 20,
      }}
      toastOptions={{
        // Default options
        duration: 4000,
        
        // Success style
        success: {
          duration: 3000,
          style: {
            background: '#10b981',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#10b981',
          },
        },
        
        // Error style
        error: {
          duration: 5000,
          style: {
            background: '#ef4444',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#ef4444',
          },
        },
        
        // Loading style
        loading: {
          style: {
            background: '#3b82f6',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
          },
        },
        
        // Custom style (works in dark mode too)
        style: {
          background: '#1f2937',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
          fontSize: '14px',
        },
      }}
    />
  );
}

/**
 * Usage in components:
 * 
 * import toast from 'react-hot-toast';
 * 
 * // Success
 * toast.success('Recruiter added successfully!');
 * 
 * // Error
 * toast.error('Failed to delete recruiter');
 * 
 * // Loading
 * const loadingToast = toast.loading('Saving changes...');
 * // Later dismiss it:
 * toast.dismiss(loadingToast);
 * 
 * // Custom with promise
 * toast.promise(
 *   saveData(),
 *   {
 *     loading: 'Saving...',
 *     success: 'Saved successfully!',
 *     error: 'Failed to save',
 *   }
 * );
 */
