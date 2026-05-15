export const setCookie = (name, value, days) => {
        let expires = "";

        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }

        const val = typeof value === "object"
            ? JSON.stringify(value)
            : value;
            
        document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/";
    }

export const getCookie = (name) => {
        const cookies = document.cookie.split("; ");

        for (let i = 0; i < cookies.length; i++) {
            const [key, value] = cookies[i].split("=");

            if (key === name) {
                return decodeURIComponent(value);
            }
        }

        return null;
    }

export const deleteCookie = (name) => {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

export const setUserSession = (user, token, days = 1) => {
    setCookie('user', JSON.stringify(user), days);
    setCookie('authToken', token, days);
}

export const getAuthToken = () => {
    return getCookie('authToken');
}

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://unsystematical-elene-unnucleated.ngrok-free.dev').replace(/\/$/, '');

export const apiUrl = (path) => {
    if (/^https?:\/\//i.test(path)) return path;
    return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export const authFetch = (url, options = {}) => {
    const token = getAuthToken();
    const headers = {
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    return fetch(apiUrl(url), {
        ...options,
        headers,
    });
}

export const apiFetch = (url, options = {}) => {
    const headers = {
        ...(options.headers || {}),
    };

    return fetch(apiUrl(url), {
        ...options,
        headers,
    });
}

export const getLocalDateString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export const getCurrentTimeString = (date = new Date()) => {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export const parseLocalDateTime = (dateString, timeString) => {
    if (!dateString || !timeString) return null;

    const [year, month, day] = dateString.split('-').map(Number);
    const [hour, minute] = timeString.split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute, 0, 0);
}

export const getBookingEndDateTime = (booking) => {
    return parseLocalDateTime(booking.endDate || booking.date, booking.endTime);
}

export const isBookingPastEnd = (booking, now = new Date()) => {
    const endDateTime = getBookingEndDateTime(booking);
    return endDateTime ? now > endDateTime : false;
}
