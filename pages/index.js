import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [depositHistory, setDepositHistory] = useState([]);
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);

  // Volatility calculator state variables
  const [prevClose, setPrevClose] = useState("");
  const [dailyVolatility, setDailyVolatility] = useState("");
  const [todayHigh, setTodayHigh] = useState("");
  const [todayLow, setTodayLow] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [targets, setTargets] = useState([]);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts[0]);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts[0]);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    if (atm) {
      let tx = await atm.deposit(1);
      await tx.wait();
      getBalance();
      updateDepositHistory();
    }
  };

  const withdraw = async () => {
    if (atm) {
      let tx = await atm.withdraw(1);
      await tx.wait();
      getBalance();
      updateWithdrawalHistory();
    }
  };

  const calculateTargets = () => {
    if (!prevClose || !dailyVolatility || !todayHigh || !todayLow || !currentPrice) {
      alert("Please fill in all the fields");
      return;
    }

    const prevClosePrice = parseFloat(prevClose);
    const volatility = parseFloat(dailyVolatility);
    const highPrice = parseFloat(todayHigh);
    const lowPrice = parseFloat(todayLow);
    const price = parseFloat(currentPrice);

    if (isNaN(prevClosePrice) || isNaN(volatility) || isNaN(highPrice) || isNaN(lowPrice) || isNaN(price)) {
      alert("Please enter valid numbers for all fields");
      return;
    }

    // Calculate targets
    const target1 = price + (2 * volatility);
    const target2 = price + (volatility * 1.5);
    const target3 = price + volatility;
    const target4 = price + (0.5 * volatility);
    setTargets([target1.toFixed(2), target2.toFixed(2), target3.toFixed(2), target4.toFixed(2)]);
  };

  const updateDepositHistory = () => {
    const newDeposit = {
      amount: 1,
      timestamp: new Date().toLocaleString()
    };
    setDepositHistory([...depositHistory, newDeposit]);
  };

  const updateWithdrawalHistory = () => {
    const newWithdrawal = {
      amount: 1,
      timestamp: new Date().toLocaleString()
    };
    setWithdrawalHistory([...withdrawalHistory, newWithdrawal]);
  };

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <div>
          <label>
            Previous Day Closing Price:
            <input type="text" value={prevClose} onChange={(e) => setPrevClose(e.target.value)} />
          </label>
        </div>
        <div>
          <label>
            Daily Volatility:
            <input type="text" value={dailyVolatility} onChange={(e) => setDailyVolatility(e.target.value)} />
          </label>
        </div>
        <div>
          <label>
            Today's High Price:
            <input type="text" value={todayHigh} onChange={(e) => setTodayHigh(e.target.value)} />
          </label>
        </div>
        <div>
          <label>
            Today's Low Price:
            <input type="text" value={todayLow} onChange={(e) => setTodayLow(e.target.value)} />
          </label>
        </div>
        <div>
          <label>
            Current Price:
            <input type="text" value={currentPrice} onChange={(e) => setCurrentPrice(e.target.value)} />
          </label>
        </div>
        <button onClick={calculateTargets}>Calculate Targets</button>
        <div>
          <p>Targets:</p>
          <ul>
            {targets.map((target, index) => (
              <li key={index}>{target}</li>
            ))}
          </ul>
        </div>
        <button onClick={deposit}>Deposit 1 ETH</button>
        <button onClick={withdraw}>Withdraw 1 ETH</button>
        <div>
          <h2>Transaction History</h2>
          <div>
            <h3>Deposits:</h3>
            <ul>
              {depositHistory.map((deposit, index) => (
                <li key={index}>
                  {deposit.amount} ETH - {deposit.timestamp}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Withdrawals:</h3>
            <ul>
              {withdrawalHistory.map((withdrawal, index) => (
                <li key={index}>
                  {withdrawal.amount} ETH - {withdrawal.timestamp}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
        }
      `}</style>
    </main>
  );
}
