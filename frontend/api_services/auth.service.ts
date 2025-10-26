import axios from "axios";
const API_PREFIX = `${process.env.NEXT_PUBLIC_API_URL_FRONTEND}/api`;

const login = async (email: string, password: string) => {
    try {
        const resp = await axios.post(
            `${API_PREFIX}/user/login`,
            { email, password },
            { withCredentials: true }
        );
        return resp.data;
    } catch (error) {
        throw error;
    }

}


const register = async (email: string, password: string, name: string) => {
    try {
        const resp = await axios.post(
            `${API_PREFIX}/user/register`,
            { email, password, name },
            { withCredentials: true }
        );
        return resp.data;
    } catch (error) {
        throw error;
    }


}

const loginGoogle = async (email: string, name: string) => {
    try {
        const resp = await axios.post(
            `${API_PREFIX}/user/login/google`,
            { email, name },
            { withCredentials: true }
        );
        return resp.data;
    } catch (error) {
        throw error;
    }
}


const logout = async () => {
    try {
        const resp = await axios.post(
            `${API_PREFIX}/user/logout`,
            { withCredentials: true }
        );
        return resp.data;
    } catch (error) {
        throw error;
    }


}


const validateToken = async () => {
    try {
        console.log("Validating token...");
        const resp = await axios.get(`${API_PREFIX}/user/me`, { withCredentials: true });
        console.log("Token valid:", resp.data);
        return resp.data;
    }
    catch (error) {
        throw error;
    }
}

export { login, register, validateToken, logout, loginGoogle };
