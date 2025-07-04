import TripForm from '../../components/TripForm'

export default function NewTripPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">Plan Your Trip</h1>
        <p className="mt-2 text-sm text-gray-600">
          Fill out the details below to create your new trip.
        </p>
        <TripForm />
      </div>
    </div>
  )
} 