import React from 'react';

interface Props {
  ratio: number;
  type: string;
}

export const NegotiationInsight: React.FC<Props> = ({ ratio, type }) => {
  const getStatus = () => {
    // FVREB Official Thresholds: Seller's >= 20%, Buyer's < 12%
    if (ratio >= 20) return {
      label: "Seller's Market",
      color: "#ff4d4d",
      strategy: `Demand for Abbotsford ${type}s is very high. Multiple offers are common. Buyers should lead with their strongest offer to remain competitive.`
    };
    if (ratio >= 12) return {
      label: "Balanced Market",
      color: "#d6b27d",
      strategy: `The ${type} market is in equilibrium. Successful transactions require realistic pricing from sellers and informed negotiations from buyers.`
    };
    return {
      label: "Buyer's Market",
      color: "#4dff88",
      strategy: `Inventory for ${type}s is high relative to demand. Buyers have significant leverage. Sellers should expect longer market times and be prepared to negotiate.`
    };
  };

  const status = getStatus();

  return (
    <div style={{ marginTop: '10px' }}>
      <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: status.color, textTransform: 'uppercase', margin: '0 0 10px 0' }}>
        {status.label} ({ratio}%)
      </p>
      <p style={{ fontSize: '1rem', lineHeight: '1.6', color: '#ffffff', opacity: 0.9, margin: 0 }}>
        {status.strategy}
      </p>
    </div>
  );
};