import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useBooking } from "../../context/BookingContext.jsx";

// Fallback image constant
const FALLBACK_IMAGE = "/images/room-placeholder.jpg";

// Razorpay configuration (Replace with your actual Razorpay key)
const RAZORPAY_KEY_ID = "rzp_test_1DP5mmOlF5G5ag"; // Replace with your Razorpay key

// Mock room data
const MOCK_ROOMS = [
  {
    id: 1,
    name: "Standard Room",
    type: "standard",
    description: "Comfortable room with essential amenities, perfect for a relaxing stay. Features modern decor and all the basics you need for a comfortable experience.",
    price: 2500,
    maxGuests: 2,
    amenities: ["Wi-Fi", "TV", "AC", "Mini Fridge"],
    available: true,
    image: "🏨",
    imageUrl: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop"
  },
  {
    id: 2,
    name: "Deluxe Room",
    type: "deluxe",
    description: "Spacious room with premium amenities and stunning views. Enjoy extra space and luxury touches throughout your stay.",
    price: 4500,
    maxGuests: 3,
    amenities: ["Wi-Fi", "TV", "AC", "Mini Bar", "Balcony"],
    available: true,
    image: "🏩",
    imageUrl: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&h=400&fit=crop"
  },
  {
    id: 3,
    name: "Suite",
    type: "suite",
    description: "Luxurious suite with separate living area, perfect for extended stays. Experience the ultimate in comfort and elegance.",
    price: 7500,
    maxGuests: 4,
    amenities: ["Wi-Fi", "TV", "AC", "Mini Bar", "Balcony", "Jacuzzi", "Room Service"],
    available: true,
    image: "🏰",
    imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop"
  },
  {
    id: 4,
    name: "Premium Standard",
    type: "standard",
    description: "Enhanced standard room with city view. Upgraded amenities and a beautiful view make this an exceptional choice.",
    price: 3000,
    maxGuests: 2,
    amenities: ["Wi-Fi", "TV", "AC", "Mini Fridge", "City View"],
    available: true,
    image: "🏨",
    imageUrl: null // Test fallback
  },
  {
    id: 5,
    name: "Executive Deluxe",
    type: "deluxe",
    description: "Business-friendly deluxe room with dedicated workspace. Perfect for business travelers who need comfort and functionality.",
    price: 5000,
    maxGuests: 3,
    amenities: ["Wi-Fi", "TV", "AC", "Mini Bar", "Work Desk", "Balcony"],
    available: true,
    image: "🏩",
    imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&h=400&fit=crop"
  },
  {
    id: 6,
    name: "Presidential Suite",
    type: "suite",
    description: "Ultimate luxury with panoramic views and premium services. The most exclusive accommodation we offer, designed for discerning guests.",
    price: 12000,
    maxGuests: 6,
    amenities: ["Wi-Fi", "TV", "AC", "Mini Bar", "Balcony", "Jacuzzi", "Room Service", "Butler Service"],
    available: true,
    image: "🏰",
    imageUrl: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&h=400&fit=crop"
  }
];

// Mock API function to search rooms
const mockSearchRooms = async (checkIn, checkOut, roomType, guests) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  let filteredRooms = MOCK_ROOMS.filter(room => {
    // Filter by room type if specified
    if (roomType && room.type !== roomType) return false;
    
    // Filter by guest capacity
    if (room.maxGuests < guests) return false;
    
    // Filter available rooms
    return room.available;
  });
  
  // Calculate nights
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  
  // Add calculated total price
  filteredRooms = filteredRooms.map(room => ({
    ...room,
    nights,
    totalPrice: room.price * nights,
    perNightPrice: room.price
  }));
  
  return filteredRooms;
};

// Mock API function to create Razorpay order
const mockCreateRazorpayOrder = async (amount, currency = "INR") => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In production, this would call your backend API to create an order
  // For mock, we'll generate a fake order ID
  return {
    id: `order_${Date.now()}`,
    amount: amount * 100, // Razorpay expects amount in paise
    currency: currency,
    receipt: `receipt_${Date.now()}`
  };
};

// Mock API function to book room (called after payment success)
const mockBookRoom = async (roomId, checkIn, checkOut, guests, guestInfo, paymentId, orderId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate mock booking confirmation
  const bookingId = `BK-${Date.now()}`;
  const room = MOCK_ROOMS.find(r => r.id === roomId);
  
  return {
    success: true,
    bookingId,
    room,
    checkIn,
    checkOut,
    guests,
    guestInfo,
    paymentId,
    orderId,
    totalAmount: room.price * Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)),
    status: "confirmed"
  };
};

export default function PublicBooking() {
  const { isAuthenticated, user, logout } = useAuth();
  const { saveSearchState, loadSearchState, clearSearchState, bookingState } = useBooking();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [roomType, setRoomType] = useState("");
  const [guests, setGuests] = useState(2);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [guestInfo, setGuestInfo] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const hasRestoredRef = useRef(false);

  // Restore booking state on mount (after login redirect)
  useEffect(() => {
    if (hasRestoredRef.current) return; // Only restore once
    
    const savedState = loadSearchState();
    if (savedState) {
      // Restore search parameters
      setCheckIn(savedState.checkInDate || "");
      setCheckOut(savedState.checkOutDate || "");
      setGuests(savedState.adults || savedState.guests || 2);
      setRoomType(savedState.room?.type || "");
      
      // If room data exists, restore search results and select the room
      if (savedState.room) {
        // Recreate the room object with all necessary data
        const restoredRoom = {
          ...savedState.room,
          price: savedState.pricePerNight,
          perNightPrice: savedState.pricePerNight,
          totalPrice: savedState.totalPrice,
          nights: savedState.nights,
        };
        
        // Set search results with the restored room
        setSearchResults([restoredRoom]);
        setShowResults(true);
        setSelectedRoom(restoredRoom);
        
        // If user is authenticated, open booking modal automatically
        if (isAuthenticated) {
          setGuestInfo({
            name: user?.name || "",
            email: user?.email || "",
            phone: ""
          });
          // Small delay to ensure UI is ready
          setTimeout(() => {
            setBookingModalOpen(true);
          }, 100);
        }
      }
      
      hasRestoredRef.current = true;
    } else {
      hasRestoredRef.current = true;
    }
  }, [loadSearchState, isAuthenticated, user]);

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpay = () => {
      if (window.Razorpay) {
        setRazorpayLoaded(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        setRazorpayLoaded(true);
      };
      script.onerror = () => {
        console.error("Failed to load Razorpay script");
        alert("Payment gateway failed to load. Please refresh the page.");
      };
      document.body.appendChild(script);

      return () => {
        // Cleanup if component unmounts
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    };

    loadRazorpay();
  }, []);

  // Set minimum date to today
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      alert("Please select check-in and check-out dates");
      return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      alert("Check-out date must be after check-in date");
      return;
    }

    setLoading(true);
    setShowResults(false);
    
    try {
      const results = await mockSearchRooms(checkIn, checkOut, roomType, guests);
      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      alert("Failed to search rooms. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookRoom = (room) => {
    if (!isAuthenticated) {
      // Save booking state before redirecting to login
      const nights = Math.ceil(
        (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
      );
      
      saveSearchState({
        checkInDate: checkIn,
        checkOutDate: checkOut,
        adults: guests,
        children: 0, // You can add children field to the form if needed
        room: {
          id: room.id,
          name: room.name,
          imageUrl: room.imageUrl,
          amenities: room.amenities || [],
          type: room.type,
          description: room.description,
        },
        pricePerNight: room.perNightPrice || room.price,
        totalPrice: room.totalPrice || (room.price * nights),
        nights: room.nights || nights,
      });
      
      // Redirect to login with redirect parameter
      navigate("/public/login?redirect=/public/booking");
      return;
    }
    setSelectedRoom(room);
    setGuestInfo({
      name: user?.name || "",
      email: user?.email || "",
      phone: ""
    });
    setBookingModalOpen(true);
  };

  const handleRazorpayPayment = async (amount, orderId) => {
    return new Promise((resolve, reject) => {
      if (!window.Razorpay) {
        reject(new Error("Razorpay not loaded"));
        return;
      }

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: amount * 100, // Amount in paise
        currency: "INR",
        name: "Hotel Lodging",
        description: `Booking for ${selectedRoom.name}`,
        order_id: orderId,
        handler: function (response) {
          resolve(response);
        },
        prefill: {
          name: guestInfo.name,
          email: guestInfo.email,
          contact: guestInfo.phone,
        },
        theme: {
          color: "#F59E0B", // Amber color matching the site theme
        },
        modal: {
          ondismiss: function () {
            reject(new Error("Payment cancelled by user"));
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", function (response) {
        reject(new Error(response.error.description || "Payment failed"));
      });
      razorpay.open();
    });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!guestInfo.name || !guestInfo.email || !guestInfo.phone) {
      alert("Please fill in all guest information");
      return;
    }

    if (!razorpayLoaded) {
      alert("Payment gateway is loading. Please wait a moment and try again.");
      return;
    }

    setBookingLoading(true);
    try {
      const totalAmount = selectedRoom.totalPrice;
      
      // Step 1: Create Razorpay order (in production, call your backend API)
      const order = await mockCreateRazorpayOrder(totalAmount);
      
      // Step 2: Open Razorpay payment gateway
      const paymentResponse = await handleRazorpayPayment(totalAmount, order.id);
      
      // Step 3: After successful payment, complete the booking
      const booking = await mockBookRoom(
        selectedRoom.id,
        checkIn,
        checkOut,
        guests,
        guestInfo,
        paymentResponse.razorpay_payment_id,
        paymentResponse.razorpay_order_id
      );
      
      // Step 4: Show success message
      alert(
        `Booking confirmed!\n\n` +
        `Booking ID: ${booking.bookingId}\n` +
        `Payment ID: ${paymentResponse.razorpay_payment_id}\n` +
        `Total Amount: ₹${booking.totalAmount}\n\n` +
        `Thank you for your booking!`
      );
      
      // Clear saved booking state after successful booking
      clearSearchState();
      
      // Reset form
      setBookingModalOpen(false);
      setShowResults(false);
      setSelectedRoom(null);
      setCheckIn("");
      setCheckOut("");
      setRoomType("");
      setGuests(2);
      hasRestoredRef.current = false;
    } catch (error) {
      if (error.message === "Payment cancelled by user") {
        alert("Payment was cancelled. Please try again to complete your booking.");
      } else {
        alert(`Payment failed: ${error.message || "Please try again."}`);
      }
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7fa]">
      {/* Header - Professional Navbar */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[#1e293b] tracking-tight">Hotel Lodging</h1>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-[#64748b]">
                    Welcome, {user?.name || user?.email}
                  </span>
                  <button
                    onClick={() => {
                      logout();
                      navigate("/public/login");
                    }}
                    className="text-sm text-[#64748b] hover:text-[#1e293b] font-medium transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/public/login"
                    className="text-sm text-[#64748b] hover:text-[#1e293b] font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/public/register"
                    className="px-5 py-2.5 bg-gradient-to-r from-[#d97706] to-[#b45309] text-white rounded-lg hover:from-[#b45309] hover:to-[#92400e] transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section with Soft Gradient */}
        <div className="relative bg-gradient-to-br from-[#f6f7fa] via-[#e8eef7] to-[#f0f4f8] rounded-3xl p-12 mb-12 mt-8 shadow-[0px_4px_12px_rgba(0,0,0,0.06)]">
          <div className="text-center relative z-10">
            <h2 className="text-5xl font-bold text-[#1e293b] mb-4 tracking-tight">
              Book Your Perfect Stay
            </h2>
            <p className="text-lg text-[#64748b] max-w-2xl mx-auto">
              Find and book the best rooms at the best prices. Experience comfort and luxury.
            </p>
          </div>
        </div>

        {/* Booking Form - Rounded Search Box */}
        <div className="bg-white rounded-[20px] shadow-[0px_4px_12px_rgba(0,0,0,0.06)] p-8 mb-12 border border-gray-100">
          <h3 className="text-2xl font-semibold text-[#1e293b] mb-6">
            Search for Available Rooms
          </h3>
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1e293b] mb-2">
                Check-in Date
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📅</span>
                <input
                  type="date"
                  min={today}
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#d97706] focus:border-transparent bg-white text-[#1e293b] transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1e293b] mb-2">
                Check-out Date
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📅</span>
                <input
                  type="date"
                  min={checkIn || tomorrow}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#d97706] focus:border-transparent bg-white text-[#1e293b] transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1e293b] mb-2">
                Room Type
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🏨</span>
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#d97706] focus:border-transparent bg-white text-[#1e293b] appearance-none transition-all"
                >
                  <option value="">Any</option>
                  <option value="standard">Standard</option>
                  <option value="deluxe">Deluxe</option>
                  <option value="suite">Suite</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1e293b] mb-2">
                Number of Guests
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">👥</span>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#d97706] focus:border-transparent bg-white text-[#1e293b] transition-all"
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-[#d97706] to-[#b45309] text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:from-[#b45309] hover:to-[#92400e] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base"
              >
                {loading ? "Searching..." : "Search Rooms"}
              </button>
            </div>
          </form>
        </div>

        {/* Search Results */}
        {showResults && (
          <div className="bg-white rounded-2xl shadow-[0px_4px_12px_rgba(0,0,0,0.06)] p-8 mb-8 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-[#1e293b]">
                Available Rooms ({searchResults.length})
              </h3>
              <button
                onClick={() => setShowResults(false)}
                className="text-sm text-[#64748b] hover:text-[#1e293b] font-medium transition-colors"
              >
                Clear Results
              </button>
            </div>
            
            {searchResults.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#64748b] mb-4">No rooms available for the selected criteria.</p>
                <p className="text-sm text-[#64748b]">Please try different dates or room type.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((room) => (
                  <div
                    key={room.id}
                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-[0px_4px_12px_rgba(0,0,0,0.06)] hover:shadow-[0px_8px_20px_rgba(0,0,0,0.1)] transition-all duration-300 flex flex-col"
                  >
                    {/* Room Image */}
                    <div className="relative w-full h-48 overflow-hidden bg-gray-200 cursor-pointer group">
                      <img
                        src={room.imageUrl || FALLBACK_IMAGE}
                        alt={room.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          if (e.target.src !== FALLBACK_IMAGE) {
                            e.target.src = FALLBACK_IMAGE;
                          }
                        }}
                        onClick={() => {
                          // Navigate to room details page with room and search data
                          navigate(`/rooms/${room.id}`, {
                            state: {
                              room: {
                                ...room,
                                nights: room.nights || Math.ceil(
                                  (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
                                ),
                              },
                              searchData: {
                                checkIn,
                                checkOut,
                                guests,
                                nights: room.nights || Math.ceil(
                                  (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
                                ),
                              },
                            },
                          });
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            navigate(`/rooms/${room.id}`, {
                              state: {
                                room: {
                                  ...room,
                                  nights: room.nights || Math.ceil(
                                    (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
                                  ),
                                },
                                searchData: {
                                  checkIn,
                                  checkOut,
                                  guests,
                                  nights: room.nights || Math.ceil(
                                    (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
                                  ),
                                },
                              },
                            });
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300 flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium">
                          View Details
                        </span>
                      </div>
                    </div>

                    {/* Room Content */}
                    <div className="p-6 flex flex-col flex-1">
                      {/* Room Name */}
                      <h4 className="text-xl font-semibold text-[#1e293b] mb-2">
                        {room.name}
                      </h4>

                      {/* Room Description */}
                      <p className="text-[#64748b] text-sm mb-4 line-clamp-2 flex-1 leading-relaxed">
                        {room.description}
                      </p>

                      {/* Amenities */}
                      <div className="mb-4">
                        <p className="text-xs font-medium text-[#64748b] mb-2 uppercase tracking-wide">
                          Amenities
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {room.amenities.map((amenity, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-gray-50 text-[#64748b] text-xs font-medium rounded-full border border-gray-200"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Price Section */}
                      <div className="border-t border-gray-200 pt-4 mt-auto">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                          <div>
                            <p className="text-xs text-[#64748b] mb-1">Per Night</p>
                            <p className="text-2xl font-bold text-[#1e293b]">
                              ₹{room.perNightPrice.toLocaleString('en-IN')}
                            </p>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="text-xs text-[#64748b] mb-1">
                              Total ({room.nights} {room.nights === 1 ? 'night' : 'nights'})
                            </p>
                            <p className="text-xl font-bold text-[#d97706]">
                              ₹{room.totalPrice.toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>

                        {/* Book Now Button */}
                        <button
                          onClick={() => handleBookRoom(room)}
                          className="w-full py-3.5 px-4 bg-gradient-to-r from-[#d97706] to-[#b45309] text-white font-semibold rounded-xl hover:from-[#b45309] hover:to-[#92400e] transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Feature Cards - Professional Styling */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-[0px_4px_12px_rgba(0,0,0,0.06)] p-8 border border-gray-100 hover:shadow-[0px_8px_20px_rgba(0,0,0,0.1)] transition-all duration-300">
            <div className="text-4xl mb-4">🏨</div>
            <h4 className="text-lg font-semibold text-[#1e293b] mb-2">
              Best Prices
            </h4>
            <p className="text-[#64748b] text-sm leading-relaxed">
              We guarantee the best rates for your stay. Book directly with us.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-[0px_4px_12px_rgba(0,0,0,0.06)] p-8 border border-gray-100 hover:shadow-[0px_8px_20px_rgba(0,0,0,0.1)] transition-all duration-300">
            <div className="text-4xl mb-4">🔒</div>
            <h4 className="text-lg font-semibold text-[#1e293b] mb-2">
              Secure Booking
            </h4>
            <p className="text-[#64748b] text-sm leading-relaxed">
              Your information is safe with us. Secure payment processing.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-[0px_4px_12px_rgba(0,0,0,0.06)] p-8 border border-gray-100 hover:shadow-[0px_8px_20px_rgba(0,0,0,0.1)] transition-all duration-300">
            <div className="text-4xl mb-4">✨</div>
            <h4 className="text-lg font-semibold text-[#1e293b] mb-2">
              Easy Cancellation
            </h4>
            <p className="text-[#64748b] text-sm leading-relaxed">
              Flexible cancellation policies. Cancel or modify your booking easily.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        {!isAuthenticated && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-8 text-center shadow-[0px_4px_12px_rgba(0,0,0,0.06)]">
            <p className="text-[#1e293b] mb-4 text-base">
              Create an account to save your preferences and view booking history.
            </p>
            <Link
              to="/public/register"
              className="inline-block px-6 py-3.5 bg-gradient-to-r from-[#d97706] to-[#b45309] text-white rounded-xl hover:from-[#b45309] hover:to-[#92400e] transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
            >
              Sign Up Now
            </Link>
          </div>
        )}

        {/* Booking Modal */}
        {bookingModalOpen && selectedRoom && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-[#1e293b]">Complete Your Booking</h3>
                  <button
                    onClick={() => setBookingModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleBookingSubmit} className="p-6">
                <div className="mb-6 p-5 bg-gray-50 rounded-xl border border-gray-200">
                  <h4 className="font-semibold text-[#1e293b] mb-3 text-lg">{selectedRoom.name}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-[#64748b] mb-1">Check-in</p>
                      <p className="font-medium text-[#1e293b]">{new Date(checkIn).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-[#64748b] mb-1">Check-out</p>
                      <p className="font-medium text-[#1e293b]">{new Date(checkOut).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-[#64748b] mb-1">Guests</p>
                      <p className="font-medium text-[#1e293b]">{guests}</p>
                    </div>
                    <div>
                      <p className="text-[#64748b] mb-1">Total Amount</p>
                      <p className="font-bold text-[#d97706] text-lg">₹{selectedRoom.totalPrice.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-[#1e293b] mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={guestInfo.name}
                      onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#d97706] focus:border-transparent bg-white text-[#1e293b] transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#1e293b] mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={guestInfo.email}
                      onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#d97706] focus:border-transparent bg-white text-[#1e293b] transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#1e293b] mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={guestInfo.phone}
                      onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#d97706] focus:border-transparent bg-white text-[#1e293b] transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setBookingModalOpen(false)}
                    className="flex-1 py-3 px-4 border border-[#e2e8f0] text-[#64748b] font-semibold rounded-xl hover:bg-gray-50 hover:text-[#1e293b] transition-all"
                    disabled={bookingLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-[#d97706] to-[#b45309] text-white font-semibold rounded-xl hover:from-[#b45309] hover:to-[#92400e] transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                    disabled={bookingLoading || !razorpayLoaded}
                  >
                    {bookingLoading ? "Processing Payment..." : razorpayLoaded ? "Proceed to Payment" : "Loading Payment Gateway..."}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-[#64748b] text-sm">
            © 2025 Hotel Lodging & Boarding. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}

