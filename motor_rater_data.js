// This file contains the rate data for the Motor Insurance Rater.
// Separating this data improves performance on slow connections.

const NCD_RATES = {
    private: { 
        comprehensive: [0, 0.25, 0.35, 0.45, 0.60], 
        'third-party': [0, 0.15, 0.20, 0.25, 0.35] 
    },
    platinum: { 
        comprehensive: [0, 0.25, 0.35, 0.45, 0.60] 
    },
    commercial: { 
        comprehensive: [0, 0.15, 0.20, 0.25, 0.35], 
        'third-party': [0, 0.15, 0.20, 0.25, 0.35] 
    }
};

const SPECIAL_DISCOUNTS = { 
    'CSR / Agent': 'csr', 
    'Underwriter': 'underwriter', 
    'Manager Special': 'manager', 
    'Fleet Discount': 'fleet' 
};

const WINDSCREEN_RATES = {
    private: {
        comprehensive: {
            rate: 0.10,
            free_limit: 5000,
            max_value: null // No maximum value
        },
        'third-party': {
            rate: 0.10,
            free_limit: 0, // No free limit
            max_value: 7000
        }
    },
    platinum: {
        comprehensive: {
            rate: 0.10,
            free_limit: 20000,
            max_value: null // No maximum value
        }
    }
};
