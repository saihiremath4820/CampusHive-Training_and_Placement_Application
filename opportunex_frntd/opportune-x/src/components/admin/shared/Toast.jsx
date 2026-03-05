import ToastContainer from '../../common/ToastContainer';

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
    <ToastContainer />
  );
}

/**
 * Usage in components:
 * 
 * import toast from '../../common/toastManager';
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
