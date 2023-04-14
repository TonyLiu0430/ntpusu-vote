export default defineNuxtRouteMiddleware(async (to, from) => {
    const { data } = useSession()

    if (!data) {
        return await navigateTo('/404')
    }

    const email = data.value?.user?.email

    if (!email) {
        return await navigateTo('/404')
    }

    const id = email.substring(1, 10)
    const admin = await $fetch('/api/checkAdmin', {
        method: 'POST',
        body: JSON.stringify({ id })
    })

    if (!admin) {
        return await navigateTo('/404')
    }
})