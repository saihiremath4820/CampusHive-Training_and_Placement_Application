if (!window.__toastListeners) {
    window.__toastListeners = [];
}
let idCounter = 0;

const emit = (toast) => {
    console.log('Toast emitting:', toast, 'Listeners count:', window.__toastListeners.length);
    window.__toastListeners.forEach(listener => listener(toast));
};

const subscribe = (listener) => {
    window.__toastListeners.push(listener);
    console.log('Toast subscribed. Total listeners:', window.__toastListeners.length);
    return () => {
        window.__toastListeners = window.__toastListeners.filter(l => l !== listener);
        console.log('Toast unsubscribed. Remaining listeners:', window.__toastListeners.length);
    };
};

const createToast = (type, title, message, duration, options = {}) => {
    if (options.id) {
        toast.dismiss(options.id);
    }
    const id = options.id || ++idCounter;
    emit({ id, type, title, message, duration });
    return id;
};

const toast = (message, options = {}) => {
    return createToast('info', options.title || 'Notification', message, options.duration || 4000, options);
};

toast.success = (message, options = {}) => {
    return createToast('success', options.title || 'Success', message, options.duration || 4000, options);
};

toast.error = (message, options = {}) => {
    return createToast('error', options.title || 'Error', message, options.duration || 6000, options);
};

toast.warning = (message, options = {}) => {
    return createToast('warning', options.title || 'Warning', message, options.duration || 5000, options);
};

toast.info = (message, options = {}) => {
    return createToast('info', options.title || 'Info', message, options.duration || 4000, options);
};

toast.loading = (message, options = {}) => {
    // Treat loading as info but with no auto-dismiss (duration 0)
    return createToast('info', options.title || 'Loading...', message, 0);
};

toast.dismiss = (id) => {
    // We can't easily dismiss from here without a more complex system, 
    // but we can emit a dismiss event that ToastContainer listens to.
    emit({ id, type: 'dismiss' });
};

toast.promise = async (promise, { loading, success, error }, options = {}) => {
    const id = toast.loading(loading, options);
    try {
        const result = await promise;
        toast.dismiss(id);
        toast.success(typeof success === 'function' ? success(result) : success, options);
        return result;
    } catch (err) {
        toast.dismiss(id);
        toast.error(typeof error === 'function' ? error(err) : error, options);
        throw err;
    }
};

toast.subscribe = subscribe;

export default toast;
