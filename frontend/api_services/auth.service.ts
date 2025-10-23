import axios from "axios";
const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL || "";

const login = async (email: string, password: string) => {
    try {
        const resp = await axios.post(
            `${API_ORIGIN}/user/login`,
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
            `${API_ORIGIN}/user/register`,
            { email, password, name },
            { withCredentials: true }
        );
        return resp.data;
    } catch (error) {
        throw error;
    }


}

const validateToken = async () => {
    try {
        const resp = await axios.get(
            `${API_ORIGIN}/user/me`,
            { withCredentials: true }
        );
        return resp.data;
    }
    catch (error) {
        throw error;
    }
}

export { login, register, validateToken };
