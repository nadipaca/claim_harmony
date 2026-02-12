import { PrismaClient, Role, ClaimType, ClaimStatus, ClaimEventType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting seed...')

    // Clear existing data (in reverse order of dependencies)
    await prisma.claimDocument.deleteMany()
    await prisma.claimEvent.deleteMany()
    await prisma.claim.deleteMany()
    await prisma.user.deleteMany()
    await prisma.insuranceCompany.deleteMany()

    console.log('✅ Cleared existing data')

    // Hash password for all test users
    const passwordHash = await bcrypt.hash('Password123!', 10)

    // Create Insurance Companies
    const citizens = await prisma.insuranceCompany.create({
        data: {
            key: 'citizens',
            name: 'Citizens',
            claimsPortalUrl: 'https://www.citizensfla.com/mypolicy',
        },
    })

    const universal = await prisma.insuranceCompany.create({
        data: {
            key: 'universal',
            name: 'Universal',
            claimsPortalUrl: 'https://claimpath.universalproperty.com/',
        },
    })

    await prisma.insuranceCompany.create({
        data: {
            key: 'statefarm',
            name: 'State Farm',
            claimsPortalUrl: 'https://www.statefarm.com/claims',
        },
    })

    console.log('✅ Created 3 insurance companies')

    // Create Users
    const consumer = await prisma.user.create({
        data: {
            email: 'consumer@test.com',
            name: 'Test Consumer',
            passwordHash,
            role: Role.CONSUMER,
        },
    })

    const contractor = await prisma.user.create({
        data: {
            email: 'contractor@test.com',
            name: 'Test Contractor',
            passwordHash,
            role: Role.CONTRACTOR,
        },
    })

    await prisma.user.create({
        data: {
            email: 'admin@test.com',
            name: 'Test Admin',
            passwordHash,
            role: Role.ADMIN,
        },
    })

    console.log('✅ Created 3 test users (password: Password123!)')

    // Create Claims
    const newClaim = await prisma.claim.create({
        data: {
            claimNumber: 'CLM-000001',
            address: '123 Main St, Miami, FL 33101',
            type: ClaimType.ROOF,
            description: 'Roof damage from recent hurricane. Multiple shingles missing and water intrusion detected.',
            status: ClaimStatus.NEW,
            consumerId: consumer.id,
            insuranceCompanyId: citizens.id,
        },
    })

    const acceptedClaim = await prisma.claim.create({
        data: {
            claimNumber: 'CLM-000002',
            address: '456 Oak Ave, Tampa, FL 33602',
            type: ClaimType.WATER,
            description: 'Water damage in kitchen from pipe burst. Flooring and cabinets affected.',
            status: ClaimStatus.ACCEPTED,
            consumerId: consumer.id,
            insuranceCompanyId: universal.id,
            acceptedByContractorId: contractor.id,
        },
    })

    console.log('✅ Created 2 example claims')

    // Create ClaimEvents for the NEW claim
    await prisma.claimEvent.create({
        data: {
            claimId: newClaim.id,
            eventType: ClaimEventType.CLAIM_CREATED,
            actorRole: Role.CONSUMER,
            actorUserId: consumer.id,
            meta: {
                message: 'Claim created by consumer',
            },
        },
    })

    // Create ClaimEvents for the ACCEPTED claim
    await prisma.claimEvent.create({
        data: {
            claimId: acceptedClaim.id,
            eventType: ClaimEventType.CLAIM_CREATED,
            actorRole: Role.CONSUMER,
            actorUserId: consumer.id,
            meta: {
                message: 'Claim created by consumer',
            },
        },
    })

    await prisma.claimEvent.create({
        data: {
            claimId: acceptedClaim.id,
            eventType: ClaimEventType.CONTRACTOR_ACCEPTED,
            actorRole: Role.CONTRACTOR,
            actorUserId: contractor.id,
            meta: {
                message: 'Claim accepted by contractor',
            },
        },
    })

    console.log('✅ Created claim events')

    console.log('\n🎉 Seed completed successfully!\n')
    console.log('📊 Summary:')
    console.log('  - 3 Insurance Companies (Citizens, Universal, State Farm)')
    console.log('  - 3 Users (consumer@test.com, contractor@test.com, admin@test.com)')
    console.log('  - 2 Claims (1 NEW, 1 ACCEPTED)')
    console.log('  - 3 Claim Events')
    console.log('\n🔑 Login credentials:')
    console.log('  Email: consumer@test.com | contractor@test.com | admin@test.com')
    console.log('  Password: Password123!')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error('❌ Seed failed:', e)
        await prisma.$disconnect()
        process.exit(1)
    })
