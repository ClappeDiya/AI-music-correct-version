import ReactGA from 'react-ga4';

export const initGA = () => {
  ReactGA.initialize(process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX');
};

export const logPageView = () => {
  ReactGA.send({ hitType: 'pageview', page: window.location.pathname });
};

export const logEvent = (category: string, action: string, label?: string) => {
  ReactGA.event({ category, action, label });
};
