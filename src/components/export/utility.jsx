export const setCookie = (name, value, days) => {
        let expires = "";

        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }

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

export const normalizeRole = (role) => {
    const compactRole = String(role || '').replace(/[\s_-]/g, '').toLowerCase();

    if (compactRole === 'schoolfaculty' || compactRole === 'teacherfaculty' || compactRole === 'schooladmin') return 'schoolFaculty';
    if (compactRole === 'studentofficer') return 'studentOfficer';
    if (compactRole === 'systemadmin') return 'systemAdmin';

    return role || '';
}

export const normalizeUser = (user) => {
    if (!user) return null;

    return {
        ...user,
        role: normalizeRole(user.role),
    };
}

export const getStoredUser = () => {
    try {
        return normalizeUser(JSON.parse(getCookie("user") || 'null'));
    } catch {
        return null;
    }
}

export const setUserSession = (user, token, days = 1) => {
    setCookie('user', JSON.stringify(normalizeUser(user)), days);
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
        'ngrok-skip-browser-warning': 'true',
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
        'ngrok-skip-browser-warning': 'true',
        ...(options.headers || {}),
    };

    return fetch(apiUrl(url), {
        ...options,
        headers,
    });
}

export const subscribeToRealtimeSnapshots = ({ onSnapshot, onError }) => {
    if (typeof EventSource === 'undefined') {
        onError?.(new Error('Realtime updates are not supported in this browser.'));
        return () => {};
    }

    const token = getAuthToken();
    if (!token) {
        onError?.(new Error('Missing authentication token for realtime updates.'));
        return () => {};
    }

    const source = new EventSource(apiUrl(`/realtime/stream?token=${encodeURIComponent(token)}`));
    let lastErrorFallbackAt = 0;

    const handleSnapshot = (event) => {
        try {
            onSnapshot?.(JSON.parse(event.data));
        } catch (error) {
            console.error('Realtime snapshot parse error:', error);
            onError?.(error);
        }
    };

    const handleError = (event) => {
        const now = Date.now();
        if (now - lastErrorFallbackAt < 5000) return;

        lastErrorFallbackAt = now;
        onError?.(event);
    };

    source.addEventListener('snapshot', handleSnapshot);
    source.addEventListener('error', handleError);

    return () => {
        source.removeEventListener('snapshot', handleSnapshot);
        source.removeEventListener('error', handleError);
        source.close();
    };
}

export const COURSE_LABELS = {
    CpE: "BS Computer Engineering",
    ME: "BS Mechanical Engineering",
    CE: "BS Civil Engineering",
    IE: "BS Industrial Engineering",
    EE: "BS Electrical Engineering",
    ECE: "BS Electronics Engineering",
}

export const POSITION_LABELS = {
    president: "President",
    vicePresident: "Vice President",
    secretary: "Secretary",
    treasurer: "Treasurer",
}

export const getCourseLabel = (course) => {
    return COURSE_LABELS[course] ?? course ?? '';
}

export const getPositionLabel = (position) => {
    return POSITION_LABELS[position] ?? position ?? '';
}

export const formatYearLevel = (year) => {
    if (!year) return '';

    const numericYear = Number(year);
    if (!Number.isNaN(numericYear)) {
        const suffix = ['st', 'nd', 'rd'][numericYear - 1] || 'th';
        return `${numericYear}${suffix} Year`;
    }

    return String(year);
}

export const formatSectionLabel = (section) => {
    const trimmedSection = String(section ?? '').trim();
    if (!trimmedSection) return '';

    return /^section\b/i.test(trimmedSection) ? trimmedSection : `Section ${trimmedSection}`;
}

export const buildRequesterDetails = (user) => {
    return [
        getCourseLabel(user?.course),
        formatYearLevel(user?.year),
        formatSectionLabel(user?.section),
        getPositionLabel(user?.position),
    ].filter(Boolean).join(' - ');
}

export const getRequesterDetails = (record) => {
    if (record?.requesterDetails) return record.requesterDetails;

    const details = [
        getCourseLabel(record?.requesterCourse),
        formatYearLevel(record?.requesterYear),
        formatSectionLabel(record?.requesterSection),
        getPositionLabel(record?.requesterPosition),
    ].filter(Boolean).join(' - ');

    return details || '-';
}

export const getRequesterSection = (record) => {
    const directSection = formatSectionLabel(record?.requesterSection);
    if (directSection) return directSection;

    const sectionFromDetails = record?.requesterDetails?.match(/\bSection\s+([^-]+)/i)?.[1]?.trim();
    return formatSectionLabel(sectionFromDetails) || '-';
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

export const formatTime = (time) => {
    if (!time || String(time).toLowerCase() === 'n/a') return '-';

    const timeText = String(time).trim();
    const existingAmPm = timeText.match(/^(\d{1,2})(?::(\d{2}))?(?::\d{2})?\s*([ap]m)$/i);

    if (existingAmPm) {
        const hour = Number(existingAmPm[1]);
        const minutes = existingAmPm[2] || '00';
        const period = existingAmPm[3].toUpperCase();
        return `${hour}:${minutes} ${period}`;
    }

    const timeParts = timeText.match(/^(\d{1,2})(?::(\d{2}))?(?::\d{2})?$/);
    if (!timeParts) return timeText;

    const hour = Number(timeParts[1]);
    const minutes = timeParts[2] || '00';
    if (Number.isNaN(hour) || hour < 0 || hour > 23) return timeText;

    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
}

export const formatTimeRange = (startTime, endTime) => {
    if (!startTime && !endTime) return '-';
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
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
