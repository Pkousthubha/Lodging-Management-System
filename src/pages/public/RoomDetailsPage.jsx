import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useBooking } from "../../context/BookingContext.jsx";

// Fallback image constant
const FALLBACK_IMAGE = "/images/room-placeholder.jpg";

/**
 * RoomDetailsPage - Dedicated page for displaying full room details
 * Route: /rooms/:id
 */
export default function RoomDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { saveSearchState, bookingState } = useBooking();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchData, setSearchData] = useState(null);

  // Extract room and searchData from location state or booking context
  useEffect(() => {
    // First, try to get from location state (passed from PublicBooking)
    if (location.state?.room) {
      const roomData = location.state.room;
      const searchDataFromState = location.state.searchData;
      
      // Ensure room has all required fields
      const completeRoom = {
        ...roomData,
        nights: roomData.nights || (searchDataFromState?.nights || 1),
        perNightPrice: roomData.perNightPrice || roomData.price || 0,
        totalPrice: roomData.totalPrice || ((roomData.perNightPrice || roomData.price || 0) * (roomData.nights || searchDataFromState?.nights || 1)),
      };
      
      setRoom(completeRoom);
      setSearchData(searchDataFromState);
      setLoading(false);
      return;
    }

    // If not in location state, try to get from booking context
    if (bookingState?.room && bookingState.room.id === parseInt(id)) {
      const restoredRoom = {
        ...bookingState.room,
        price: bookingState.pricePerNight,
        perNightPrice: bookingState.pricePerNight,
        totalPrice: bookingState.totalPrice,
        nights: bookingState.nights,
      };
      setRoom(restoredRoom);
      setSearchData({
        checkIn: bookingState.checkInDate,
        checkOut: bookingState.checkOutDate,
        guests: bookingState.adults,
        nights: bookingState.nights,
      });
      setLoading(false);
      return;
    }

    // If neither available, fetch from API (mock for now)
    const fetchRoomDetails = async (roomId) => {
      setLoading(true);
      setError(null);
      
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock room data - In production, this would be: GET /api/v1/public/rooms/:id
        const mockRooms = {
          1: {
            id: 1,
            name: "Standard Room",
            type: "standard",
            description: "Comfortable room with essential amenities, perfect for a relaxing stay. Features modern decor and all the basics you need for a comfortable experience. The room includes a comfortable bed, workspace area, and modern bathroom facilities.",
            price: 2500,
            maxGuests: 2,
            amenities: ["Wi-Fi", "TV", "AC", "Mini Fridge"],
            imageUrl: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&h=600&fit=crop",
            checkInTime: "2:00 PM",
            checkOutTime: "11:00 AM",
            cancellationPolicy: "Free cancellation up to 24 hours before check-in. After that, one night charge applies.",
          },
          2: {
            id: 2,
            name: "Deluxe Room",
            type: "deluxe",
            description: "Spacious room with premium amenities and stunning views. Enjoy extra space and luxury touches throughout your stay. Features a king-size bed, separate seating area, and premium bathroom with modern fixtures.",
            price: 4500,
            maxGuests: 3,
            amenities: ["Wi-Fi", "TV", "AC", "Mini Bar", "Balcony"],
            imageUrl: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&h=600&fit=crop",
            checkInTime: "2:00 PM",
            checkOutTime: "11:00 AM",
            cancellationPolicy: "Free cancellation up to 48 hours before check-in. After that, one night charge applies.",
          },
          3: {
            id: 3,
            name: "Suite",
            type: "suite",
            description: "Luxurious suite with separate living area, perfect for extended stays. Experience the ultimate in comfort and elegance. Features a spacious bedroom, separate living room, dining area, and premium bathroom with jacuzzi.",
            price: 7500,
            maxGuests: 4,
            amenities: ["Wi-Fi", "TV", "AC", "Mini Bar", "Balcony", "Jacuzzi", "Room Service"],
            imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&h=600&fit=crop",
            checkInTime: "2:00 PM",
            checkOutTime: "11:00 AM",
            cancellationPolicy: "Free cancellation up to 72 hours before check-in. After that, two nights charge applies.",
          },
          4: {
            id: 4,
            name: "Premium Standard",
            type: "standard",
            description: "Enhanced standard room with city view. Upgraded amenities and a beautiful view make this an exceptional choice.",
            price: 3000,
            maxGuests: 2,
            amenities: ["Wi-Fi", "TV", "AC", "Mini Fridge", "City View"],
            imageUrl: FALLBACK_IMAGE,
            checkInTime: "2:00 PM",
            checkOutTime: "11:00 AM",
            cancellationPolicy: "Free cancellation up to 24 hours before check-in. After that, one night charge applies.",
          },
          5: {
            id: 5,
            name: "Executive Deluxe",
            type: "deluxe",
            description: "Business-friendly deluxe room with dedicated workspace. Perfect for business travelers who need comfort and functionality.",
            price: 5000,
            maxGuests: 3,
            amenities: ["Wi-Fi", "TV", "AC", "Mini Bar", "Work Desk", "Balcony"],
            imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&h=600&fit=crop",
            checkInTime: "2:00 PM",
            checkOutTime: "11:00 AM",
            cancellationPolicy: "Free cancellation up to 48 hours before check-in. After that, one night charge applies.",
          },
          6: {
            id: 6,
            name: "Presidential Suite",
            type: "suite",
            description: "Ultimate luxury with panoramic views and premium services. The most exclusive accommodation we offer, designed for discerning guests.",
            price: 12000,
            maxGuests: 6,
            amenities: ["Wi-Fi", "TV", "AC", "Mini Bar", "Balcony", "Jacuzzi", "Room Service", "Butler Service"],
            imageUrl: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&h=600&fit=crop",
            checkInTime: "2:00 PM",
            checkOutTime: "11:00 AM",
            cancellationPolicy: "Free cancellation up to 72 hours before check-in. After that, two nights charge applies.",
          },
        };

        const fetchedRoom = mockRooms[parseInt(roomId)];
        
        if (!fetchedRoom) {
          setError("Room not found");
          setLoading(false);
          return;
        }

        // Calculate nights and total price (default to 1 night if no search data)
        let nights = 1;
        let totalPrice = fetchedRoom.price;

        setRoom({
          ...fetchedRoom,
          nights,
          perNightPrice: fetchedRoom.price,
          totalPrice,
        });
        
        setLoading(false);
      } catch (err) {
        setError("Failed to load room details. Please try again.");
        setLoading(false);
      }
    };

    fetchRoomDetails(id);
  }, [id, location.state, bookingState]);


  const handleBookNow = () => {
    if (!room) return;

    // Prepare search data for booking
    const bookingSearchData = searchData || {
      checkIn: bookingState?.checkInDate || "",
      checkOut: bookingState?.checkOutDate || "",
      guests: bookingState?.adults || 2,
      nights: room.nights || 1,
    };

    // Save booking state before navigating
    if (bookingSearchData.checkIn && bookingSearchData.checkOut) {
      saveSearchState({
        checkInDate: bookingSearchData.checkIn,
        checkOutDate: bookingSearchData.checkOut,
        adults: bookingSearchData.guests || 2,
        children: 0,
        room: {
          id: room.id,
          name: room.name,
          imageUrl: room.imageUrl,
          amenities: room.amenities || [],
          type: room.type,
          description: room.description,
        },
        pricePerNight: room.perNightPrice || room.price,
        totalPrice: room.totalPrice || (room.price * (room.nights || 1)),
        nights: room.nights || 1,
      });
    }

    // Navigate to booking page
    navigate("/public/booking", {
      state: {
        room,
        searchData: bookingSearchData,
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f7fa] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d97706] mx-auto mb-4"></div>
          <p className="text-[#64748b]">Loading room details...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-[#f6f7fa] flex items-center justify-center px-4">
        <div className="text-center max-w-md bg-white rounded-2xl shadow-[0px_4px_12px_rgba(0,0,0,0.06)] p-8 border border-gray-100">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-[#1e293b] mb-2">Room Not Found</h1>
          <p className="text-[#64748b] mb-6">{error || "The room you're looking for doesn't exist."}</p>
          <button
            onClick={() => navigate("/public/booking")}
            className="px-6 py-3 bg-gradient-to-r from-[#d97706] to-[#b45309] text-white rounded-xl hover:from-[#b45309] hover:to-[#92400e] transition-all font-semibold shadow-md hover:shadow-lg"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  const nights = room.nights || 1;
  const perNightPrice = room.perNightPrice || room.price || 0;
  const totalPrice = room.totalPrice || (perNightPrice * nights);
  const checkInTime = room.checkInTime || "2:00 PM";
  const checkOutTime = room.checkOutTime || "11:00 AM";
  const cancellationPolicy = room.cancellationPolicy || "Free cancellation up to 24 hours before check-in. After that, one night charge applies.";

  return (
    <div className="min-h-screen bg-[#f6f7fa]">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-[#64748b] hover:text-[#1e293b] transition-colors font-medium"
            >
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span>Back</span>
            </button>
            <h1 className="text-xl font-bold text-[#1e293b]">Hotel Lodging</h1>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Room Image */}
        <div className="mb-8 rounded-2xl overflow-hidden shadow-[0px_4px_12px_rgba(0,0,0,0.06)] border border-gray-100">
          <img
            src={room.imageUrl || FALLBACK_IMAGE}
            alt={room.name}
            className="w-full h-[400px] md:h-[500px] lg:h-[600px] object-cover"
            onError={(e) => {
              if (e.target.src !== FALLBACK_IMAGE) {
                e.target.src = FALLBACK_IMAGE;
              }
            }}
          />
        </div>

        {/* Room Details */}
        <div className="bg-white rounded-2xl shadow-[0px_4px_12px_rgba(0,0,0,0.06)] p-6 md:p-8 lg:p-10 mb-8 border border-gray-100">
          {/* Room Name */}
          <h1 className="text-3xl md:text-4xl font-bold text-[#1e293b] mb-4 tracking-tight">
            {room.name}
          </h1>

          {/* Description */}
          <p className="text-[#64748b] text-lg leading-relaxed mb-8">
            {room.description}
          </p>

          {/* Amenities */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#1e293b] mb-4">Amenities</h2>
            <div className="flex flex-wrap gap-3">
              {room.amenities && room.amenities.length > 0 ? (
                room.amenities.map((amenity, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-amber-50 text-amber-800 text-sm font-medium rounded-full border border-amber-200"
                  >
                    {amenity}
                  </span>
                ))
              ) : (
                <p className="text-[#64748b]">No amenities listed</p>
              )}
            </div>
          </div>

          {/* Pricing Section */}
          <div className="border-t border-gray-200 pt-8 mb-8">
            <h2 className="text-xl font-semibold text-[#1e293b] mb-6">Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <p className="text-sm text-[#64748b] mb-2">Price Per Night</p>
                <p className="text-3xl font-bold text-[#1e293b]">
                  ₹{perNightPrice.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-amber-200">
                <p className="text-sm text-[#64748b] mb-2">
                  Total ({nights} {nights === 1 ? "night" : "nights"})
                </p>
                <p className="text-3xl font-bold text-[#d97706]">
                  ₹{totalPrice.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>

          {/* Policies */}
          <div className="border-t border-gray-200 pt-8 mb-8">
            <h2 className="text-xl font-semibold text-[#1e293b] mb-6">Policies</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-[#d97706] text-sm">✓</span>
                </div>
                <div>
                  <p className="font-semibold text-[#1e293b] mb-1">Check-in</p>
                  <p className="text-[#64748b]">{checkInTime}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-[#d97706] text-sm">✓</span>
                </div>
                <div>
                  <p className="font-semibold text-[#1e293b] mb-1">Check-out</p>
                  <p className="text-[#64748b]">{checkOutTime}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-[#d97706] text-sm">✓</span>
                </div>
                <div>
                  <p className="font-semibold text-[#1e293b] mb-1">Cancellation Policy</p>
                  <p className="text-[#64748b]">{cancellationPolicy}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Book Now Button */}
          <div className="border-t border-gray-200 pt-8">
            <button
              onClick={handleBookNow}
              className="w-full py-4 px-6 bg-gradient-to-r from-[#d97706] to-[#b45309] text-white font-semibold text-lg rounded-xl shadow-md hover:shadow-lg hover:from-[#b45309] hover:to-[#92400e] transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Book Now
            </button>
            {!isAuthenticated && (
              <p className="text-sm text-[#64748b] text-center mt-3">
                You'll be asked to log in to complete your booking
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-[#64748b] text-sm">
            © 2025 Hotel Lodging & Boarding. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

