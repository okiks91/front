const API_BASE_URL = 'https://unsystematical-elene-unnucleated.ngrok-free.dev';

export const apiUrl = (path) => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${normalizedPath}`;
};
