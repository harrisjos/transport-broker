// @ts-nocheck
/**
 * M8Freight Branding Configuration
 * Centralized branding settings to avoid hard-coding across the app
 */

export const BRANDING = {
    // App Identity
    appName: 'Fr8 M8s',
    tagline: 'Creating new Freight Mates, Connecting Shippers with Carriers, without the Middleman',

    // Colors
    colors: {
        primary: '#6320A5',     // Purple primary
        secondary: '#fff',      // White secondary
        tertiary: '#000',       // Black tertiary

        // Additional color variants for UI
        primaryHover: '#4f1a84',
        primaryLight: '#8a4cb8',
        primaryDark: '#4a1580',

        // Dark mode colors
        darkBg: '#1a1a1a',
        darkCard: '#2d2d2d',
        darkText: '#e0e0e0',
        darkBorder: '#404040',
    },

    // Branding Assets
    assets: {
        logo: '/images/primary_logo.png',
        favicon: '/images/favicon.ico',
        appleTouchIcon: '/images/primary_logo.png',
    },

    // Typography
    typography: {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
        headingFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    },

    // Theme Settings
    theme: {
        mode: 'dark',
        borderRadius: '8px',
        shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        shadowLg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    },

    // Responsive Breakpoints (Mobile-first approach)
    breakpoints: {
        mobile: '0px',
        tablet: '768px',
        desktop: '1024px',
        wide: '1280px',
    },

    // Component Settings
    components: {
        navbar: {
            height: '64px',
            logoHeight: '40px',
        },
        button: {
            borderRadius: '6px',
            padding: '8px 16px',
        },
        card: {
            borderRadius: '8px',
            padding: '16px',
        },
    },
};

// CSS Custom Properties Generator
export const generateCSSVariables = () => {
    return `
        :root {
            --brand-primary: ${BRANDING.colors.primary};
            --brand-secondary: ${BRANDING.colors.secondary};
            --brand-tertiary: ${BRANDING.colors.tertiary};
            --brand-primary-hover: ${BRANDING.colors.primaryHover};
            --brand-primary-light: ${BRANDING.colors.primaryLight};
            --brand-primary-dark: ${BRANDING.colors.primaryDark};
            --brand-dark-bg: ${BRANDING.colors.darkBg};
            --brand-dark-card: ${BRANDING.colors.darkCard};
            --brand-dark-text: ${BRANDING.colors.darkText};
            --brand-dark-border: ${BRANDING.colors.darkBorder};
            --brand-font-family: ${BRANDING.typography.fontFamily};
            --brand-heading-family: ${BRANDING.typography.headingFamily};
            --brand-border-radius: ${BRANDING.theme.borderRadius};
            --brand-shadow: ${BRANDING.theme.shadow};
            --brand-shadow-lg: ${BRANDING.theme.shadowLg};
            --brand-navbar-height: ${BRANDING.components.navbar.height};
            --brand-logo-height: ${BRANDING.components.navbar.logoHeight};
        }
    `;
};

// Utility functions
export const getBrandColor = (colorName) => {
    return BRANDING.colors[colorName] || BRANDING.colors.primary;
};

export const getAssetPath = (assetName) => {
    return BRANDING.assets[assetName] || '';
};

export const getBreakpoint = (size) => {
    return BRANDING.breakpoints[size] || BRANDING.breakpoints.mobile;
};

export default BRANDING;