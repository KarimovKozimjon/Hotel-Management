import api from './api';

const paymentGatewayService = {
  // Initiate payment with gateway
  initiatePayment: async (bookingId, amount, gateway, returnUrl = null) => {
    const response = await api.post('/payment/initiate', {
      booking_id: bookingId,
      amount: amount,
      gateway: gateway, // 'click' or 'payme'
      return_url: returnUrl,
    });
    return response.data;
  },

  // Check payment status
  checkPaymentStatus: async (bookingId) => {
    const response = await api.get('/payment/status', {
      params: { booking_id: bookingId },
    });
    return response.data;
  },
};

export default paymentGatewayService;
