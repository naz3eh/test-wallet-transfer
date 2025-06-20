interface EnvVars {
    VITE_SENDERS_PVT_KEY: string;
    VITE_RECIEVERS_PVT_KEY: string;
  }
  
  function getEnvVars(): EnvVars {
    // Check if we're in a Vite environment
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return {
        VITE_SENDERS_PVT_KEY: import.meta.env.VITE_SENDERS_PVT_KEY,
        VITE_RECIEVERS_PVT_KEY: import.meta.env.VITE_RECIEVERS_PVT_KEY,
      };
    }
    
    // Fallback to process.env for Node.js environments
    return {
      VITE_SENDERS_PVT_KEY: process.env.VITE_SENDERS_PVT_KEY || '',
      VITE_RECIEVERS_PVT_KEY: process.env.VITE_RECIEVERS_PVT_KEY || '',
    };
  }
  
  export const env = getEnvVars();