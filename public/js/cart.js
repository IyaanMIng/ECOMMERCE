const payBtn = document.querySelector('.btn-buy');

payBtn.addEventListener('click', () => {
    const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://ecommerce-elxx.vercel.app';

    fetch(`${baseUrl}/stripe-checkout`, {
        method: 'POST',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
            items: JSON.parse(localStorage.getItem('cartItems')),
        }),
    })
    .then((res) => res.json())
    .then((data) => {
        // Assuming the server returns a URL
        if (data.url) {
            location.href = data.url;
            clearCart();  
        } else {
            console.error('No URL returned from the server');
        }
    })
    .catch((err) => console.log(err));
});
