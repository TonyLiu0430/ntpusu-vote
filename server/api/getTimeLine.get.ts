import prisma from '~/lib/prisma'
import { getServerSession } from '#auth'
export default defineEventHandler(async (event) => {
    return prisma.VotingTimeLine.findMany({
        
    })
})
