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

    // 確認參數
    const { id, voteName, voteGroup, startTime, endTime, onlyOne, candidates } = await readBody(event) as {
        id: number | undefined
        voteName: string
        voteGroup: number | undefined
        startTime: string
        endTime: string
        onlyOne: boolean
        candidates: {
            name: string
        }[]
    }
    
    if(!id || !voteName || typeof voteGroup === 'undefined' || !startTime || !endTime || onlyOne === undefined || !candidates){
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Parameters are not enough.',
        })
    }

    if (onlyOne && candidates.length !== 1) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Candidate length should be 1 when onlyOne is true.',
        })
    }

    if (new Date(startTime) >= new Date(endTime)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'StartTime should be earlier than endTime.',
        })
    }

    const oldVoting = await prisma.voting.findUnique({
        where: {
            id,
        },
        select: {
            id: true,
        },
    })

    if(!oldVoting){
        throw createError({
            statusCode: 404,
            statusMessage: 'Not Found',
            message: 'Voting not found.',
        })
    } 

    const voting = await prisma.voting.update({
        where: {
            id,
        },
        data: {
            name: voteName,
            groupId: voteGroup,
            startTime,
            endTime,
            onlyOne,
        },
        select: { id: true },
    })

    const groups = await prisma.group.findMany({
        select: { id: true },
    })

    await prisma.votingFromGroup.createMany({
        data: groups.map((group) => ({
            votingId: voting.id,
            groupId: group.id,
        })),
    })

    if (onlyOne) {
        await prisma.candidate.createMany({
            data: [
                {
                    name: candidates[0].name,
                    groupId: voteGroup,
                    votingId: voting.id,
                },
                {
                    name: '同意',
                    groupId: voteGroup,
                    votingId: voting.id,
                },
                {
                    name: '不同意',
                    groupId: voteGroup,
                    votingId: voting.id,
                },
                {
                    name: '廢票',
                    groupId: voteGroup,
                    votingId: voting.id,
                },
            ],
        })
    }
    else {
        await prisma.candidate.createMany({
            data: candidates.map((candidate) => ({
                name: candidate.name,
                groupId: voteGroup,
                votingId: voting.id,
            })).concat([{
                name: '廢票',
                groupId: voteGroup,
                votingId: voting.id,
            }]),
        })
    }

    return {}
})