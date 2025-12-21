export const Footer = () => {
  const footerStyle = {
    marginTop: '60px',
    padding: '40px 20px',
    borderTop: '1px solid #d6b27d',
    backgroundColor: '#041c24',
    color: '#7c8c89',
    textAlign: 'center' as const,
    fontSize: '0.75rem',
    lineHeight: '1.8',
    letterSpacing: '0.5px'
  };

  return (
    <footer style={footerStyle}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Prominent Brokerage & Licensee Information */}
        <p style={{ color: '#d6b27d', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '15px' }}>
          DON GOERTZ | ROYAL LEPAGE LITTLE OAK REALTY
        </p>
        
        {/* Required Royal LePage Disclaimer */}
        <p style={{ marginBottom: '15px' }}>
          All offices are independently owned and operated. 
          Not intended to solicit buyers or sellers currently under contract.
        </p>

        {/* REALTOR® and MLS® Trademark Disclosures */}
        <p style={{ marginBottom: '15px' }}>
          REALTOR®, REALTORS®, and the REALTOR® logo are certification marks that are owned by 
          REALTOR® Canada Inc. and licensed exclusively to The Canadian Real Estate Association (CREA). 
          The MLS® trademark and the MLS® logo are owned by CREA and identify the quality of 
          services provided by real estate professionals who are members of CREA.
        </p>

        {/* Data Disclaimer for the Abbotsford Pulse Tool */}
        <p style={{ fontStyle: 'italic' }}>
          Disclaimer: Market data is provided for informational purposes only. While deemed reliable, 
          it is not guaranteed and should be independently verified. 
          This tool is not intended to provide legal or financial advice.
        </p>

        <p style={{ marginTop: '20px', opacity: 0.5 }}>
          © {new Date().getFullYear()} DGA Personal Development Solutions | SELF | AWARE | EMPOWERED
        </p>
      </div>
    </footer>
  );
};