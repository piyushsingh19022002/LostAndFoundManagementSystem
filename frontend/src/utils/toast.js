import toast from 'react-hot-toast';

export const showSuccess = (message) => {
  return toast.success(message);
};

export const showError = (message) => {
  return toast.error(message || 'An unexpected error occurred. Please try again.');
};

export const showWarning = (message) => {
  return toast(message, {
    icon: '⚠️',
    duration: 4000,
    style: {
      border: '1px solid rgba(234, 179, 8, 0.3)',
      background: 'rgba(15, 23, 42, 0.95)',
      color: '#fef08a',
    },
  });
};

export const showLoading = (message) => {
  return toast.loading(message);
};

export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

export const showPromise = (promise, { loading = 'Processing...', success = 'Action completed successfully!', error = 'Operation failed.' }) => {
  return toast.promise(
    promise,
    {
      loading,
      success: (data) => {
        // If success is a function, call it, otherwise return static string
        return typeof success === 'function' ? success(data) : success;
      },
      error: (err) => {
        // Extract server response error message if available
        const errMsg = err.response?.data?.message || err.message || error;
        return typeof error === 'function' ? error(err) : errMsg;
      },
    }
  );
};

const toastUtil = {
  success: showSuccess,
  error: showError,
  warning: showWarning,
  loading: showLoading,
  dismiss: dismissToast,
  promise: showPromise,
};

export default toastUtil;
