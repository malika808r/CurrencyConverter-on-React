import React, { useState, useEffect } from 'react';
import './CurrencyConverter.css';

const API_KEY = 'fca_live_cluqvwMYeGacQ0kPfQaGguC5o0LCqYwDCvXHj474';
const API_BASE = 'https://api.freecurrencyapi.com/v1/latest';
const HISTORY_KEY = 'conversionHistory';

const CurrencyConverter = () => {
  const [amount, setAmount] = useState(1);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [result, setResult] = useState(null);
  const [rate, setRate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistoryInMobile, setShowHistoryInMobile] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.body.classList.add('dark');
    }
    const savedHistory = localStorage.getItem(HISTORY_KEY);
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  const fetchRate = async (base, target) => {
    if (base === target) {
      setResult(Number(amount));
      setRate(1);
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}?apikey=${API_KEY}&base_currency=${base}&currencies=${target}`);
      if (!res.ok) throw new Error('Error fetching data');
      const data = await res.json();
      const currentRate = data.data[target];
      setRate(currentRate);
      const converted = amount * currentRate;
      setResult(converted);
      
      const newEntry = {
        id: Date.now(),
        ts: Date.now(),
        from: base,
        to: target,
        amount: Number(amount),
        result: converted,
        rate: currentRate
      };
      setHistory(prev => [newEntry, ...prev].slice(0, 5));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConvert = () => {
    if (amount > 0) fetchRate(fromCurrency, toCurrency);
  };

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR', 'RUB'];

  return (
    <>
      <header>
        <div className="header-controls">
          <button className="btn" onClick={() => setIsHistoryOpen(!isHistoryOpen)}>History</button>
          <button className="btn" onClick={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? 'Light mode' : 'Dark mode'}
          </button>
          <button id="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span className="hamburger-bars">
              <span className="bar"></span><span className="bar"></span><span className="bar"></span>
            </span>
          </button>
        </div>

        <div className="history-panel" aria-hidden={!isHistoryOpen}>
          <div className="history-header">
            <strong>History</strong>
            <button className="btn small" onClick={() => setHistory([])}>Clear</button>
          </div>
          {history.length === 0 ? <div className="history-empty">Empty</div> : (
            <ul className="history-list">
              {history.map(item => (
                <li key={item.id} onClick={() => {
                   setAmount(item.amount); setFromCurrency(item.from); setToCurrency(item.to); setIsHistoryOpen(false);
                }}>
                  <strong>{item.amount} {item.from} → {item.result.toFixed(2)} {item.to}</strong>
                </li>
              ))}
            </ul>
          )}
        </div>

        <nav className="mobile-menu" aria-hidden={!isMenuOpen}>
           {!showHistoryInMobile ? (
             <>
               <button className="menu-item" onClick={() => setShowHistoryInMobile(true)}>History</button>
               <button className="menu-item" onClick={() => { setIsDarkMode(!isDarkMode); setIsMenuOpen(false); }}>
                 {isDarkMode ? 'Light mode' : 'Dark mode'}
               </button>
             </>
           ) : (
             <>
               <button className="menu-item" onClick={() => setShowHistoryInMobile(false)}>← Back</button>
               <div style={{padding: '10px'}}>
                 {history.map(item => (
                   <div key={item.id} style={{padding:'5px 0', borderBottom:'1px solid #ccc'}} onClick={() => {
                      setAmount(item.amount); setFromCurrency(item.from); setToCurrency(item.to); setIsMenuOpen(false);
                   }}>
                     {item.amount} {item.from} → {item.result.toFixed(2)} {item.to}
                   </div>
                 ))}
               </div>
             </>
           )}
        </nav>
      </header>

      <main>
        <h1>Currency Converter</h1>
        <div className="converter">
          <label>From:</label>
          <select value={fromCurrency} onChange={e => setFromCurrency(e.target.value)}>
            {currencies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <label>To:</label>
          <select value={toCurrency} onChange={e => setToCurrency(e.target.value)}>
            {currencies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <label>Amount:</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} />
          <button id="convert" onClick={handleConvert} disabled={isLoading}>
            {isLoading ? '...' : 'Convert'}
          </button>
          <div className="result">
            <p>Result: <strong>{result ? `${result.toFixed(2)} ${toCurrency}` : '-'}</strong></p>
            {error && <p style={{color:'red'}}>{error}</p>}
          </div>
        </div>
      </main>
      
      {(isMenuOpen || isHistoryOpen) && (
        <div style={{position:'fixed', inset:0, zIndex:90}} onClick={() => {setIsMenuOpen(false); setIsHistoryOpen(false);}} />
      )}
    </>
  );
};

export default CurrencyConverter;