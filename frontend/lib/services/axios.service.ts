import axios from 'axios'
import { useRouter } from '@/src/i18n/routing'
import { toast } from '@/components/ui/toast'

export const useAxios = () => {
    const router = useRouter()
    const axiosInstance = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_URL,
        headers: {
            'Content-Type': 'application/json',
        },
    })

    axiosInstance.interceptors.response.use(
        (response) => response,
        (error) => {
            const status = error.response?.status
            const errorMessage = error.response?.data?.error?.message || error.message || 'An unexpected error occurred'

            if (status === 401) {
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')
                toast.add({
                    title: "Error",
                    description: errorMessage,
                    type: 'error'
                })
                router.push('/login')
            }
            return Promise.reject(error.response?.data?.error || { message: errorMessage })
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