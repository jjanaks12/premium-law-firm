import axios, { AxiosInstance } from 'axios'
import { useRouter } from '@/src/i18n/routing'
import { useLocale } from 'next-intl'
import { toast } from '@/components/ui/toast'

let axiosInstance: AxiosInstance
let isRefreshing = false
let refreshSubscribers: ((error: any, token: string | null) => void)[] = []

const subscribeTokenRefresh = (cb: (error: any, token: string | null) => void) => {
    refreshSubscribers.push(cb)
}

const onRefreshed = (error: any, token: string | null) => {
    refreshSubscribers.forEach((cb) => cb(error, token))
    refreshSubscribers = []
}

export const useAxios = () => {
    const router = useRouter()
    const locale = useLocale()

    if (axiosInstance)
        return { axios: axiosInstance }

    axiosInstance = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_URL,
        headers: {
            'Content-Type': 'application/json',
        },
    })

    axiosInstance.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config
            const status = error.response?.status
            const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || error.message || 'An unexpected error occurred'
            const isNetworkError = !error.response || error.code === 'ERR_NETWORK' || error.message === 'Network Error'

            const isLoginRequest = originalRequest.url?.includes('/auth/login')

            if (status === 401 && !originalRequest._retry && !isLoginRequest) {
                const remember = localStorage.getItem('remember') === 'true'
                const refreshToken = localStorage.getItem('refreshToken')

                if (remember && refreshToken) {
                    originalRequest._retry = true

                    if (isRefreshing) {
                        return new Promise((resolve, reject) => {
                            subscribeTokenRefresh((err, token) => {
                                if (err) {
                                    reject(err)
                                } else {
                                    originalRequest.headers.Authorization = `Bearer ${token}`
                                    resolve(axiosInstance(originalRequest))
                                }
                            })
                        })
                    }

                    isRefreshing = true
                    try {
                        const { data } = await axios.post(
                            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
                            { refreshToken }
                        )

                        if (data.success && data.data) {
                            const { accessToken, refreshToken: newRefreshToken } = data.data
                            localStorage.setItem('accessToken', accessToken)
                            localStorage.setItem('refreshToken', newRefreshToken)

                            isRefreshing = false
                            onRefreshed(null, accessToken)

                            // Retry original request
                            originalRequest.headers.Authorization = `Bearer ${accessToken}`
                            return axiosInstance(originalRequest)
                        }
                    } catch (refreshError: any) {
                        isRefreshing = false
                        onRefreshed(refreshError, null)
                        if (refreshError.isNetworkError || refreshError.code === 'ERR_NETWORK' || refreshError.message === 'Network Error') {
                            console.warn('[Axios Service] Token refresh failed: Network Error (Backend offline)')
                        } else {
                            console.error('[Axios Service] Token refresh failed:', refreshError)
                        }
                    }
                }

                // If not remember or refresh fails, clear auth & redirect
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')
                localStorage.removeItem('remember')
                toast.add({
                    title: "Session Expired",
                    description: "Please log in again.",
                    type: 'error'
                })
                window.dispatchEvent(new Event('auth-expired'))
                const currentPath = window.location.pathname + window.location.search
                router.push(`/login?redirectUrl=${encodeURIComponent(currentPath)}`)
            }

            if (isNetworkError) {
                toast.add({
                    title: "Network Error",
                    description: errorMessage,
                    type: 'error'
                })
                error.isNetworkError = true
            }

            error.message = errorMessage;
            return Promise.reject(error)
        }
    )

    axiosInstance.interceptors.request.use((config) => {
        const token = localStorage.getItem('accessToken')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        config.headers['Accept-Language'] = locale
        return config
    })

    return { axios: axiosInstance }
}