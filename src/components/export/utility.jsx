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