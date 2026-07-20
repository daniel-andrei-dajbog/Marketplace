const API_URL = "http://127.0.0.1:5000/api/bookings";

const getHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${localStorage.getItem("token")}`
});

export const bookingService = {
  createBooking: async (serviceId, bookingData) => {
    const response = await fetch(`${API_URL}/create/${serviceId}`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(bookingData)
    });
    return response.json();
  },

  getClientBookings: async () => {
    const response = await fetch(`${API_URL}/my-bookings`, { headers: getHeaders() });
    return response.json();
  },

  getProviderBookings: async () => {
    const response = await fetch(`${API_URL}/provider-bookings`, { headers: getHeaders() });
    return response.json();
  },

  updateBookingStatus: async (bookingId, status) => {
    const response = await fetch(`${API_URL}/${bookingId}/status`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    return response.json();
  },

  getProviderServices: async () => {
    const response = await fetch("http://127.0.0.1:5000/api/services/me", {
      method: "GET",
      headers: getHeaders()
    });
    return response.json();
  }
};