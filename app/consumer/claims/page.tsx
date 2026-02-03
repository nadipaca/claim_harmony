import { getServerSession } from 'next-auth'
import { authOptions } from '../../lib/auth'
import { redirect } from 'next/navigation'

export default async function ConsumerClaimsPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect('/login')
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow p-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Consumer Dashboard
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Welcome, {session.user.name || session.user.email}!
                    </p>

                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                        <p className="text-sm text-blue-800">
                            <strong>Role:</strong> {session.user.role}
                        </p>
                        <p className="text-sm text-blue-800">
                            <strong>Email:</strong> {session.user.email}
                        </p>
                    </div>

                    <h2 className="text-xl font-semibold text-gray-700 mb-4">
                        My Claims
                    </h2>
                    <p className="text-gray-600">
                        Your insurance claims will appear here.
                    </p>
                </div>
            </div>
        </div>
    )
}
