export default function handler(req, res) {
  // Generate random token prices
  const solanaPrice = 150 + (Math.random() * 10 - 5);
  const hpepePrice = 0.00001 + (Math.random() * 0.000005);
  
  // Return the prices
  res.status(200).json({
    sol: {
      price: solanaPrice,
      change: (Math.random() * 6 - 3).toFixed(2)
    },
    hpepe: {
      price: hpepePrice,
      change: (Math.random() * 10 - 5).toFixed(2)
    }
  });
} 