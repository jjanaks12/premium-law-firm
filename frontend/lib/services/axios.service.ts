import axios from 'axios'

export const useAxios = () => {
    const axiosInstance = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_URL,
        headers: {
            'Content-Type': 'application/json',
        },
    })

    axiosInstance.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response.status === 401) {
                localStorage.removeItem('token')
                window.location.href = '/login'
            }
            return Promise.reject(error)
        }
    )

    axiosInstance.interceptors.request.use((config) => {
        const token = localStorage.getItem('accessToken')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    })

    return { axios: axiosInstance }
}