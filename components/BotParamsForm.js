import React, { useState, useEffect } from 'react';
import { BOT_CONFIG } from '../services/config';

const BotParamsForm = ({ 
  initialParams = {}, 
  onSubmit,
  tokenAddress,
  simulationMode = true
}) => {
  const [params, setParams] = useState({
    totalSolAmount: initialParams.totalSolAmount || 1.0,
    numMakers: initialParams.numMakers || 5,
    minDelay: initialParams.minDelay || 10,
    maxDelay: initialParams.maxDelay || 30,
    boostLevel: initialParams.boostLevel || 'none',
    autoBoost: initialParams.autoBoost || false,
    ...initialParams
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Όταν αλλάζει το tokenAddress, καθαρίζουμε τα σφάλματα
  useEffect(() => {
    setErrors({});
  }, [tokenAddress]);

  const validateParams = () => {
    const newErrors = {};

    // Έλεγχος για totalSolAmount
    if (!params.totalSolAmount || params.totalSolAmount <= 0) {
      newErrors.totalSolAmount = 'Το ποσό SOL πρέπει να είναι μεγαλύτερο από 0';
    } else if (params.totalSolAmount < BOT_CONFIG.MIN_TRANSACTION_AMOUNT_SOL) {
      newErrors.totalSolAmount = `Το ελάχιστο ποσό είναι ${BOT_CONFIG.MIN_TRANSACTION_AMOUNT_SOL} SOL`;
    } else if (params.totalSolAmount > BOT_CONFIG.MAX_TRANSACTION_AMOUNT_SOL) {
      newErrors.totalSolAmount = `Το μέγιστο ποσό είναι ${BOT_CONFIG.MAX_TRANSACTION_AMOUNT_SOL} SOL`;
    }

    // Έλεγχος για numMakers
    if (!params.numMakers || params.numMakers <= 0) {
      newErrors.numMakers = 'Ο αριθμός των makers πρέπει να είναι θετικός';
    } else if (params.numMakers > 20) {
      newErrors.numMakers = 'Ο μέγιστος αριθμός makers είναι 20';
    }

    // Έλεγχος για minDelay και maxDelay
    if (params.minDelay < 0) {
      newErrors.minDelay = 'Η ελάχιστη καθυστέρηση πρέπει να είναι θετική';
    }
    
    if (params.maxDelay < params.minDelay) {
      newErrors.maxDelay = 'Η μέγιστη καθυστέρηση πρέπει να είναι μεγαλύτερη από την ελάχιστη';
    }

    // Έλεγχος για tokenAddress
    if (!tokenAddress) {
      newErrors.tokenAddress = 'Πρέπει να επιλέξετε ένα token';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setParams({
      ...params,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? parseFloat(value) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateParams()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Καλούμε το callback με τις παραμέτρους για έναρξη του bot
      await onSubmit({
        ...params,
        tokenAddress
      });
    } catch (error) {
      console.error('Σφάλμα κατά την εκκίνηση του bot:', error);
      setErrors({ submit: 'Σφάλμα κατά την εκκίνηση του bot. Παρακαλώ δοκιμάστε ξανά.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Ένδειξη λειτουργίας προσομοίωσης */}
      {simulationMode && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
          <div className="flex items-center">
            <div className="py-1">
              <svg className="w-6 h-6 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <p className="font-bold">Λειτουργία προσομοίωσης</p>
              <p className="text-sm">Οι συναλλαγές δεν θα σταλούν στο blockchain.</p>
            </div>
          </div>
        </div>
      )}

      {/* Σφάλμα υποβολής */}
      {errors.submit && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p>{errors.submit}</p>
        </div>
      )}

      {/* Πεδίο επιλεγμένου token */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Επιλεγμένο Token
        </label>
        <div className="bg-gray-100 p-3 rounded">
          {tokenAddress ? (
            <span className="text-gray-800 font-mono">{tokenAddress}</span>
          ) : (
            <span className="text-red-500">Δεν έχει επιλεγεί token</span>
          )}
        </div>
        {errors.tokenAddress && (
          <p className="text-red-500 text-xs mt-1">{errors.tokenAddress}</p>
        )}
      </div>

      {/* Πεδίο συνολικού ποσού SOL */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="totalSolAmount">
          Συνολικό Ποσό SOL
        </label>
        <input
          id="totalSolAmount"
          name="totalSolAmount"
          type="number"
          step="0.01"
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
            errors.totalSolAmount ? 'border-red-500' : ''
          }`}
          value={params.totalSolAmount}
          onChange={handleChange}
          min={BOT_CONFIG.MIN_TRANSACTION_AMOUNT_SOL}
          max={BOT_CONFIG.MAX_TRANSACTION_AMOUNT_SOL}
        />
        {errors.totalSolAmount && (
          <p className="text-red-500 text-xs mt-1">{errors.totalSolAmount}</p>
        )}
      </div>

      {/* Πεδίο αριθμού makers */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="numMakers">
          Αριθμός Makers
        </label>
        <input
          id="numMakers"
          name="numMakers"
          type="number"
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
            errors.numMakers ? 'border-red-500' : ''
          }`}
          value={params.numMakers}
          onChange={handleChange}
          min="1"
          max="20"
        />
        {errors.numMakers && (
          <p className="text-red-500 text-xs mt-1">{errors.numMakers}</p>
        )}
      </div>

      {/* Πεδία καθυστέρησης */}
      <div className="grid grid-cols-2 gap-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="minDelay">
            Ελάχιστη Καθυστέρηση (δευτ.)
          </label>
          <input
            id="minDelay"
            name="minDelay"
            type="number"
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.minDelay ? 'border-red-500' : ''
            }`}
            value={params.minDelay}
            onChange={handleChange}
            min="0"
          />
          {errors.minDelay && (
            <p className="text-red-500 text-xs mt-1">{errors.minDelay}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="maxDelay">
            Μέγιστη Καθυστέρηση (δευτ.)
          </label>
          <input
            id="maxDelay"
            name="maxDelay"
            type="number"
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.maxDelay ? 'border-red-500' : ''
            }`}
            value={params.maxDelay}
            onChange={handleChange}
            min={params.minDelay}
          />
          {errors.maxDelay && (
            <p className="text-red-500 text-xs mt-1">{errors.maxDelay}</p>
          )}
        </div>
      </div>

      {/* Επιλογή επιπέδου boost */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="boostLevel">
          Επίπεδο Boost
        </label>
        <select
          id="boostLevel"
          name="boostLevel"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={params.boostLevel}
          onChange={handleChange}
        >
          <option value="none">Χωρίς Boost</option>
          {BOT_CONFIG.BOOST_LEVELS.map((level, index) => (
            <option key={index} value={level.name}>
              {level.name} ({level.percent}%) - {level.description}
            </option>
          ))}
        </select>
      </div>

      {/* Επιλογή αυτόματου boost */}
      <div className="mb-6 flex items-center">
        <input
          id="autoBoost"
          name="autoBoost"
          type="checkbox"
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          checked={params.autoBoost}
          onChange={handleChange}
        />
        <label htmlFor="autoBoost" className="ml-2 block text-gray-700">
          Αυτόματο Boost (εφαρμόζεται μετά την ολοκλήρωση των makers)
        </label>
      </div>

      {/* Κουμπί υποβολής */}
      <div className="flex items-center justify-between">
        <button
          type="submit"
          className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={isSubmitting || !tokenAddress}
        >
          {isSubmitting ? 'Εκκίνηση...' : 'Εκκίνηση Maker Bot'}
        </button>
      </div>
    </form>
  );
};

export default BotParamsForm; 