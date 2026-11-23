import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { applyPrefsToDocument } from './lib/prefs';
import { App } from './App';

applyPrefsToDocument();
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
