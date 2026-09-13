document.getElementById("book-now-btn").addEventListener("click", async () => {
  const errorBox = document.getElementById("booking-error");
  errorBox.textContent = "";

  const checkIn = document.getElementById("checkIn").value;
  const checkOut = document.getElementById("checkOut").value;

  if (!checkIn || !checkOut) {
    errorBox.textContent = "Please pick both dates.";
    return;
  }

  try {
    let orderRes = await fetch(`/listings/${listing._id}/bookings/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checkIn, checkOut }),
    });
    let orderData = await orderRes.json();

    if (!orderRes.ok) {
      errorBox.textContent = orderData.error || "Could not start checkout.";
      return;
    }

    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: "INR",
      name: "WanderLust",
      description: `${orderData.nights} night(s) at ${orderData.listingTitle}`,
      order_id: orderData.orderId,
      handler: async function (response) {
        let verifyRes = await fetch(
          `/listings/${listing._id}/bookings/verify`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              checkIn,
              checkOut,
            }),
          },
        );
        let verifyData = await verifyRes.json();

        if (!verifyRes.ok) {
          errorBox.textContent =
            verifyData.error || "Payment verification failed.";
          return;
        }

        window.location.href = verifyData.redirect;
      },
      theme: { color: "#fe424d" },
    };

    const razorpayCheckout = new Razorpay(options);
    razorpayCheckout.open();
  } catch (err) {
    errorBox.textContent = "Something went wrong. Please try again.";
  }
});