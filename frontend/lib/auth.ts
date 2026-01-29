import useSWR, { mutate } from 'swr'
import { useRouter } from 'next/navigation'

interface User {
    username: string
}

interface AuthState {
    user: User | null
    loading: boolean
    isLoggedIn: boolean
}

const fetcher = (url: string) => fetch(url).then((res) => {
    if (res.status === 401) throw new Error('Unauthorized')
    return res.json()
})

export function useAuth(): AuthState {
    const { data, error, isLoading } = useSWR<User>('/api/admin/me', fetcher, {
        shouldRetryOnError: false,
        revalidateOnFocus: false,
    })

    return {
        user: data || null,
        loading: isLoading,
        isLoggedIn: !error && !!data
    }
}

export async function login(username: string, password: string, captchaId: string, captchaCode: string): Promise<{ success: boolean; message: string }> {
    try {
        const res = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                password,
                captcha_id: captchaId,
                captcha_code: captchaCode
            }),
        })

        if (res.ok) {
            await mutate('/api/admin/me')
            return { success: true, message: 'Login successful' }
        }

        const data = await res.json()
        return { success: false, message: data.detail || 'Login failed' }
    } catch (error) {
        return { success: false, message: 'Network error' }
    }
}

export async function logout(): Promise<void> {
    await fetch('/api/admin/logout', { method: 'POST' })
    window.location.href = '/admin/login'
}
