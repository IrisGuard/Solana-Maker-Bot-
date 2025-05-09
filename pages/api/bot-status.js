export default function handler(req, res) {
  if (req.method === 'GET') {
    // Return the current status
    res.status(200).json({
      status: 'inactive',
      lastActive: null,
      simulationMode: true,
      autoBoost: false,
      maxTransactionsPerDay: 100,
      transactionsToday: 0,
      requiredSol: 0.5,
      requiredHpepe: 100000
    });
  } else if (req.method === 'POST') {
    // Update the status based on the request body
    const { status } = req.body;
    
    if (!status || !['active', 'inactive', 'paused'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status provided' });
    }
    
    // Return the updated status
    res.status(200).json({
      status,
      lastActive: status === 'active' ? Date.now() : null,
      simulationMode: true,
      autoBoost: false,
      maxTransactionsPerDay: 100,
      transactionsToday: 0,
      requiredSol: 0.5,
      requiredHpepe: 100000
    });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 