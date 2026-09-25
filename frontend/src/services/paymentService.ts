
export async function createCheckout({ planId, email }: { planId: string; email: string }) {

    const response = await fetch(`${import.meta.env.VITE_API_URL}/create-checkout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId, email }),
    });

    if (!response.ok) {
        throw new Error('Failed to create checkout');
    }

    return response.json();
}