import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, User, MapPin, CheckCircle, Search, X } from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  location: string;
  availableDates: string[];
  image: string;
}

const doctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Chen',
    specialty: 'Cardiologist',
    location: 'Medical Center, Floor 3',
    availableDates: ['2025-03-20', '2025-03-21', '2025-03-22'],
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: '2',
    name: 'Dr. Michael Park',
    specialty: 'Neurologist',
    location: 'Neurology Wing, Floor 2',
    availableDates: ['2025-03-19', '2025-03-20', '2025-03-23'],
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    specialty: 'Pulmonologist',
    location: 'West Wing, Floor 4',
    availableDates: ['2025-03-21', '2025-03-22', '2025-03-24'],
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200&h=200'
  }
];

export const AppointmentBooking = () => {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM',
    '02:00 PM', '03:00 PM', '04:00 PM'
  ];

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConfirm = () => {
    setIsConfirmed(true);
    setTimeout(() => {
      setIsConfirmed(false);
      setSelectedDoctor(null);
      setSelectedDate('');
      setSelectedTime('');
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Calendar className="w-8 h-8 text-blue-600" />
          Book an Appointment
        </h2>

        {!selectedDoctor ? (
          <div>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search doctors by name or specialty..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDoctors.map((doctor) => (
                <motion.div
                  key={doctor.id}
                  className="border rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedDoctor(doctor)}
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-lg">{doctor.name}</h3>
                      <p className="text-blue-600">{doctor.specialty}</p>
                      <p className="text-gray-500 text-sm flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {doctor.location}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <img
                  src={selectedDoctor.image}
                  alt={selectedDoctor.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-lg">{selectedDoctor.name}</h3>
                  <p className="text-blue-600">{selectedDoctor.specialty}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDoctor(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Select Date</h4>
                <div className="space-y-2">
                  {selectedDoctor.availableDates.map((date) => (
                    <motion.button
                      key={date}
                      className={`w-full p-3 rounded-lg border ${
                        selectedDate === date
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-500'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedDate(date)}
                    >
                      {new Date(date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </motion.button>
                  ))}
                </div>
              </div>

              {selectedDate && (
                <div>
                  <h4 className="font-semibold mb-3">Select Time</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlots.map((time) => (
                      <motion.button
                        key={time}
                        className={`p-3 rounded-lg border ${
                          selectedTime === time
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-500'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {selectedDate && selectedTime && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <button
                  onClick={handleConfirm}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Confirm Appointment
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {isConfirmed && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          >
            <div className="bg-white rounded-xl p-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mb-4 text-green-500"
              >
                <CheckCircle className="w-16 h-16 mx-auto" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-2">Appointment Confirmed!</h3>
              <p className="text-gray-600">
                {selectedDoctor.name} on {new Date(selectedDate).toLocaleDateString()} at {selectedTime}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};