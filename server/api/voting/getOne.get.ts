import prisma from '~/lib/prisma'
export default defineEventHandler(async (event) => {
    // 確認權限
    if (!event.context.session) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
            message: '未登入',
        })
    }

    if (!event.context.isAdmin) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden',
            message: '不是管理員',
        })
    }

    const {id: votingIdStr} = await getQuery(event) as {id : string}

    const votingId = parseInt(votingIdStr)

    if(isNaN(votingId)){
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'id 必須為數字',
        })
    }

    return await prisma.voting.findUniqueOrThrow({
        where: {
            id: votingId,
        },
        select: {
            id: true,
            name: true,
            startTime: true,
            endTime: true,
            archive: true,
            groupId: true,
            onlyOne: true,
            candidates: true,
        },
    })
})