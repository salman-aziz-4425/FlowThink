import React, { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import axios from "axios";

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const { data } = await axios.post("http://localhost:5000/create-payment-intent", {
        amount: 1000,
      });

      const { paymentIntent, error: stripeError } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: "John Doe",
            },
          },
        }
      );

      if (paymentIntent) {
        setMessage("Payment successful! Thank you for your purchase.");
      } else if (stripeError) {
        setError(stripeError.message);
      }
    } catch (err) {
      setError("An error occurred while processing your payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <CardElement />
        <button 
          type="submit" 
          disabled={!stripe || loading}
          onClick={() => console.log('Stripe available:', !!stripe, 'Loading:', loading)}
        >
          {loading ? "Processing..." : "Pay"}
        </button>
        <div style={{ fontSize: '12px', marginTop: '5px', color: '#666' }}>
          {!stripe ? "Initializing payment system..." : ""}
        </div>
      </form>
      {message && <div style={{ color: "green", marginTop: "10px" }}>{message}</div>}
      {error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>}
    </div>
  );
};

export default PaymentForm;
