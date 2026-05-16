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
