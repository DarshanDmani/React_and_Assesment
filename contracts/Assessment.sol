// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;

    event Deposit(address indexed user, uint256 amount, uint256 timestamp);
    event Withdraw(address indexed user, uint256 amount, uint256 timestamp);

    struct Transaction {
        address user;
        uint256 amount;
        uint256 timestamp;
    }

    Transaction[] public depositHistory;
    Transaction[] public withdrawalHistory;

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns(uint256){
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        uint _previousBalance = balance;

        // perform transaction
        balance += _amount;

        // record deposit history
        depositHistory.push(Transaction({
            user: msg.sender,
            amount: _amount,
            timestamp: block.timestamp
        }));

        // emit the event
        emit Deposit(msg.sender, _amount, block.timestamp);
    }

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint _previousBalance = balance;
        require(balance >= _withdrawAmount, "Insufficient balance");

        // withdraw the given amount
        balance -= _withdrawAmount;

        // record withdrawal history
        withdrawalHistory.push(Transaction({
            user: msg.sender,
            amount: _withdrawAmount,
            timestamp: block.timestamp
        }));

        // emit the event
        emit Withdraw(msg.sender, _withdrawAmount, block.timestamp);
    }

    function getDepositHistoryLength() public view returns (uint) {
        return depositHistory.length;
    }

    function getWithdrawalHistoryLength() public view returns (uint) {
        return withdrawalHistory.length;
    }

    function getDeposit(uint index) public view returns (address, uint256, uint256) {
        require(index < depositHistory.length, "Index out of bounds");
        Transaction memory transaction = depositHistory[index];
        return (transaction.user, transaction.amount, transaction.timestamp);
    }

    function getWithdrawal(uint index) public view returns (address, uint256, uint256) {
        require(index < withdrawalHistory.length, "Index out of bounds");
        Transaction memory transaction = withdrawalHistory[index];
        return (transaction.user, transaction.amount, transaction.timestamp);
    }

    function calculateTargets(uint256 prevClose, uint256 dailyVolatility, uint256 todayHigh, uint256 todayLow, uint256 currentPrice) public pure returns (uint256[4] memory) {
        // Calculate targets
        uint256[4] memory targets;
        targets[0] = currentPrice + (2 * dailyVolatility);
        targets[1] = currentPrice + (dailyVolatility * 15 / 10);
        targets[2] = currentPrice + dailyVolatility;
        targets[3] = currentPrice + (5 * dailyVolatility / 10);
        return targets;
    }
}
