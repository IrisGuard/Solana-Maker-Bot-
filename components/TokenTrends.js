import React, { useState, useEffect } from 'react';

// Υποθετική συνάρτηση για τη λήψη δεδομένων τάσης
const fetchTokenTrend = async (tokenAddress) => {
  // Σε πραγματική εφαρμογή, θα ανακτούσαμε τα δεδομένα από το API
  // Για τώρα, επιστρέφουμε δεδομένα προσομοίωσης
  
  // Τυχαία τάση (αύξηση ή μείωση)
  const randomTrend = Math.random() > 0.5 ? 'up' : 'down';
  
  // Τυχαίο ποσοστό μεταξύ 0.1% και 5%
  const randomPercent = (Math.random() * 4.9 + 0.1).toFixed(2);
  
  // Τυχαίος όγκος συναλλαγών
  const randomVolume = Math.floor(Math.random() * 1000000);
  
  return {
    trend: randomTrend,
    percentage: randomPercent,
    volume: randomVolume,
    timestamp: new Date()
  };
};

const TokenTrends = ({ tokens = [] }) => {
  const [trendsData, setTrendsData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrends = async () => {
      if (tokens.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      
      try {
        const trends = {};
        
        // Φετς των δεδομένων τάσης για κάθε token
        for (const token of tokens) {
          const tokenAddress = token.tokenAddress || token.address;
          if (tokenAddress) {
            trends[tokenAddress] = await fetchTokenTrend(tokenAddress);
          }
        }
        
        setTrendsData(trends);
      } catch (error) {
        console.error('Σφάλμα κατά τη φόρτωση τάσεων:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTrends();
    
    // Ενημέρωση των τάσεων κάθε 5 λεπτά
    const interval = setInterval(loadTrends, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [tokens]);

  if (loading) {
    return <div className="text-center py-4">Φόρτωση τάσεων...</div>;
  }

  if (tokens.length === 0) {
    return <div className="text-center py-4">Δεν υπάρχουν διαθέσιμα tokens για ανάλυση τάσεων.</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Τάσεις Αγοράς</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="text-left pb-3">Token</th>
              <th className="text-center pb-3">Τάση 24h</th>
              <th className="text-right pb-3">Ποσοστό</th>
              <th className="text-right pb-3">Όγκος</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((token, index) => {
              const tokenAddress = token.tokenAddress || token.address;
              const trend = trendsData[tokenAddress];
              
              if (!trend) return null;
              
              return (
                <tr key={index} className="border-t">
                  <td className="py-3">
                    <div className="flex items-center">
                      <span className="truncate max-w-xs">
                        {token.symbol || tokenAddress.substring(0, 8) + '...'}
                      </span>
                    </div>
                  </td>
                  <td className="text-center py-3">
                    {trend.trend === 'up' ? (
                      <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded">
                        ▲ Άνοδος
                      </span>
                    ) : (
                      <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded">
                        ▼ Πτώση
                      </span>
                    )}
                  </td>
                  <td className="text-right py-3">
                    <span className={trend.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                      {trend.trend === 'up' ? '+' : '-'}{trend.percentage}%
                    </span>
                  </td>
                  <td className="text-right py-3">
                    {new Intl.NumberFormat('el-GR').format(trend.volume)} SOL
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="text-xs text-gray-500 mt-4 text-right">
        Τελευταία ενημέρωση: {new Date().toLocaleTimeString('el-GR')}
      </div>
    </div>
  );
};

export default TokenTrends; 