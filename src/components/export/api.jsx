const API_BASE_URL = 'https://unsystematical-elene-unnucleated.ngrok-free.dev/api';

export const apiUrl = (path) => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${normalizedPath}`;
};
