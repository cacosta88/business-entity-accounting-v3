// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

//Prototype of business accounting system for a services company with multiple owners
//Owners can deposit capital, propose capital adjustments, propose expenses, vote on expenses, and vote to close accounting periods
//Profit is distributed to owners based on their ownership percentage at the time of closing the accounting period

contract YourContract {
	struct Owner {
		uint256 capital;
		uint256 capitalRequirement;
		bool isAdded;
		bool canDeposit;
		uint256 index;
	}

	struct CapitalAdjustmentProposal {
		address proposedAddress;
		uint256 proposedCapital;
		uint256 votes;
		bool isIncrease;
	}

	enum ExpenseStatus {
        Proposed,
        Approved,
        Settled,
        Cancelled
    }

	struct ExpenseProposal {
		string description;
		address recipient;
		uint256 amount;
		uint256 votes;
		ExpenseStatus status;
		uint256 period; 
	}


	struct Invoice {
		address payable payor;
		uint256 amount;
		bool isPaid;
		string description;
		uint256 period;
	}

	struct CloseAccountingPeriodProposal {
		uint256 earnedRevenuePercentage;
		uint256 votes;
		bool approved;
	}

	error OnlyAdmin();
	error OnlyOwners();
	error MismatchOwnersCapitalRequirements();
	error OwnerNotFound();
	error OwnerCannotDeposit();
	error ProposalNotFound();
	error CanOnlyVoteOnce();
	error InsufficientOwnershipPercentage();
	error ExpenseProposalNotFound();
	error CannotSettleBeforeDate();
	error ExpenseNotApproved();
	error TransferFailed();
	error IncorrectAmountSent();
	error InvoiceAlreadyPaid();
	error ClosePeriodProposalNotFound();
	error OnlyPayorCanPayInvoice();

	event CapitalDeposited(address indexed ownerAddress, uint256 amount);
	event CapitalAdjustmentProposed(
		address indexed proposedAddress,
		uint256 proposedCapital,
		bool isIncrease
	);
	event CapitalAdjustmentVoted(address indexed owner, uint256 proposalID);
	event ExpenseProposed(
		uint256 indexed expenseID,
		string description,
		address recipient,
		uint256 amount
	);
	event ExpenseVoted(
		address indexed owner,
		uint256 expenseID,
		uint256 voteWeight
	);
	event ExpenseApproved(uint256 indexed expenseID);
	event ExpenseSettled(
		uint256 indexed expenseID,
		string description,
		address recipient,
		uint256 amount,
		uint256 votes,
		ExpenseStatus status,
		uint256 period,
		uint256 accountingPeriod
	);
	event InvoiceIssued(
		uint256 indexed invoiceID,
		address payor,
		uint256 amount,
		string description,
		uint256 period
	);
	event InvoicePaid(
		uint256 indexed invoiceID,
		address payor,
		uint256 amount,
		string description,
		uint256 period,
		uint256 accountingPeriod
	);
	event ClosePeriodProposed(
		uint256 indexed proposalID,
		uint256 earnedRevenuePercentage
	);
	event ClosePeriodVoted(address indexed owner, uint256 proposalID);

	event AccountingPeriodClosed(
		uint256 indexed proposalID,
		uint256 startTime,
		uint256 endTime,
		uint256 earnedRevenuePercentage,
		uint256 distributableIncome,
		uint256 earnedGrossReceipts,
		uint256 totalExpenses,
		uint256 grossReceipts
	);
	event ClearedExpiredExpenseProposal(
		uint256 indexed proposalID,
		uint256 amount
	);

	address public admin;
	uint256 public totalCapital;
	uint256 public earmarkedFunds;
	mapping(address => Owner) public owners;
	address[] public ownerAddresses;
	mapping(uint256 => CapitalAdjustmentProposal)
		public capitalAdjustmentProposals;
	mapping(uint256 => ExpenseProposal) public expenseProposals;
	uint256[] public expenseProposalIDs;
	mapping(uint256 => uint256) public expenseProposalIndex;
	mapping(uint256 => Invoice) public invoices;

	uint256[] public invoiceIDs;
	mapping(uint256 => uint256) public invoiceIndex;

	uint256 public grossReceipts;
	uint256 public estimatedEarnedRevenuePercentage;
	uint256 public totalExpenses;
	mapping(uint256 => CloseAccountingPeriodProposal)
		public closePeriodProposals;
	uint256[] public closePeriodProposalIDs;
	mapping(uint256 => uint256) public closePeriodProposalIndex;

	uint256 public capitalAdjustmentProposalCounter = 0;

	uint256[] public activeCapitalAdjustmentProposals;

	mapping(uint256 => uint256) public activeCapitalAdjustmentProposalIndex;

	uint256 public invoiceCounter = 0;
	uint256 public expenseProposalCounter = 0;
	uint256 public closePeriodProposalCounter = 0;

	mapping(uint256 => mapping(address => bool))
		public capitalAdjustmentProposalVoters;
	mapping(uint256 => mapping(address => bool)) public expenseProposalVoters;
	mapping(uint256 => mapping(address => bool))
		public closePeriodProposalVoters;

	uint256 public currentPeriodStartTime;

	constructor(
		address[] memory initialOwners,
		uint256[] memory capitalRequirements
	) {
		if (initialOwners.length != capitalRequirements.length)
			revert MismatchOwnersCapitalRequirements();

		admin = msg.sender;
		for (uint i = 0; i < initialOwners.length; i++) {
			owners[initialOwners[i]] = Owner(
				0,
				capitalRequirements[i],
				true,
				true,
				i
			);
			ownerAddresses.push(initialOwners[i]);
		}
	}

	modifier onlyAdmin() {
		if (msg.sender != admin) revert OnlyAdmin();
		_;
	}

	modifier onlyOwners() {
		if (owners[msg.sender].isAdded == false) revert OwnerNotFound();
		_;
	}

	function calculateOwnershipPercentage(
		uint256 ownerCapital
	) public view returns (uint256) {
		return (ownerCapital * 100) / totalCapital;
	}

	function depositCapital(
		address ownerAddress,
		uint256 amount
	) external payable onlyOwners {
		if (msg.value != owners[ownerAddress].capitalRequirement)
			revert InsufficientOwnershipPercentage();
		if (owners[ownerAddress].isAdded == false) revert OwnerNotFound();
		if (owners[ownerAddress].canDeposit == false)
			revert OwnerCannotDeposit();

		owners[ownerAddress].capital += amount;
		totalCapital += amount;

		owners[ownerAddress].canDeposit = false;
		emit CapitalDeposited(ownerAddress, amount);
	}

	function createCapitalAdjustmentProposal(
		address _proposedAddress,
		uint256 _proposedCapital,
		bool _isIncrease
	) external onlyOwners {
		capitalAdjustmentProposalCounter++;
		CapitalAdjustmentProposal storage proposal = capitalAdjustmentProposals[
			capitalAdjustmentProposalCounter
		];
		proposal.proposedAddress = _proposedAddress;
		proposal.proposedCapital = _proposedCapital;
		proposal.votes = calculateOwnershipPercentage(
			owners[msg.sender].capital
		);
		capitalAdjustmentProposalVoters[capitalAdjustmentProposalCounter][
			msg.sender
		] = true;
		proposal.isIncrease = _isIncrease;

		if (calculateOwnershipPercentage(owners[msg.sender].capital) > 50) {
			owners[proposal.proposedAddress].canDeposit = true;
			delete capitalAdjustmentProposals[capitalAdjustmentProposalCounter];
		}

		if (owners[_proposedAddress].isAdded == false) {
			owners[_proposedAddress] = Owner(
				0,
				_proposedCapital,
				true,
				false,
				ownerAddresses.length
			);
			ownerAddresses.push(_proposedAddress);
		} else {
			owners[_proposedAddress].canDeposit = true;
		}

		activeCapitalAdjustmentProposals.push(capitalAdjustmentProposalCounter);
		activeCapitalAdjustmentProposalIndex[capitalAdjustmentProposalCounter] =
			activeCapitalAdjustmentProposals.length -
			1;
		emit CapitalAdjustmentProposed(
			_proposedAddress,
			_proposedCapital,
			_isIncrease
		);
	}

	function voteForCapitalProposal(uint256 proposalID) external onlyOwners {
		if (
			capitalAdjustmentProposals[proposalID].proposedAddress == address(0)
		) revert ProposalNotFound();
		if (capitalAdjustmentProposalVoters[proposalID][msg.sender])
			revert CanOnlyVoteOnce();
		Owner storage owner = owners[msg.sender];
		if (owner.capital < owner.capitalRequirement)
			revert InsufficientOwnershipPercentage();

		CapitalAdjustmentProposal storage proposal = capitalAdjustmentProposals[
			proposalID
		];
		proposal.votes += calculateOwnershipPercentage(
			owners[msg.sender].capital
		);
		capitalAdjustmentProposalVoters[proposalID][msg.sender] = true;

		if (proposal.votes > 50) {
			owners[proposal.proposedAddress].canDeposit = true;
			delete capitalAdjustmentProposals[proposalID];
			uint256 lastProposalID = activeCapitalAdjustmentProposals[
				activeCapitalAdjustmentProposals.length - 1
			];
			uint256 proposalIndex = activeCapitalAdjustmentProposalIndex[
				proposalID
			];
			activeCapitalAdjustmentProposals[proposalIndex] = lastProposalID;
			activeCapitalAdjustmentProposalIndex[
				lastProposalID
			] = proposalIndex;
			activeCapitalAdjustmentProposals.pop();
		}
		emit CapitalAdjustmentVoted(msg.sender, proposalID);
	}

	function createExpenseProposal(
		string memory description,
		address recipient,
		uint256 amount
	) external onlyOwners {
		expenseProposalCounter++;
		ExpenseProposal storage expenseProposal = expenseProposals[
			expenseProposalCounter
		];
		expenseProposal.description = description;
		expenseProposal.recipient = recipient;
		expenseProposal.amount = amount;
		expenseProposal.status = ExpenseStatus.Proposed;
		expenseProposal.period = closePeriodProposalCounter + 1;
	
		uint256 initialExpenseProposalVotes = calculateOwnershipPercentage(
			owners[msg.sender].capital
		);
		expenseProposal.votes = initialExpenseProposalVotes;
		expenseProposalVoters[expenseProposalCounter][msg.sender] = true;

		if (initialExpenseProposalVotes > 50) {
			expenseProposal.status = ExpenseStatus.Approved;
			totalExpenses += amount;
			earmarkedFunds += amount;
			emit ExpenseApproved(expenseProposalCounter);
		}

		expenseProposalIDs.push(expenseProposalCounter);
		expenseProposalIndex[expenseProposalCounter] =
			expenseProposalIDs.length -
			1;

		emit ExpenseProposed(
			expenseProposalCounter,
			description,
			recipient,
			amount
		);
	}

	function voteForExpenseProposal(uint256 expenseID) external onlyOwners {
		if (expenseProposalVoters[expenseID][msg.sender])
			revert CanOnlyVoteOnce();
		ExpenseProposal storage expenseProposal = expenseProposals[expenseID];
		if (expenseProposal.recipient == address(0))
			revert ExpenseProposalNotFound();

		uint256 votescast = calculateOwnershipPercentage(
			owners[msg.sender].capital
		);
		expenseProposal.votes += votescast;
		expenseProposalVoters[expenseID][msg.sender] = true;

		if (expenseProposal.votes > 50) {
			expenseProposal.status = ExpenseStatus.Approved;
			totalExpenses += expenseProposal.amount;
			earmarkedFunds += expenseProposal.amount;
			emit ExpenseApproved(expenseProposalCounter);


		emit ExpenseProposed(
			expenseProposalCounter,
			expenseProposal.description,
			expenseProposal.recipient,
			expenseProposal.amount);
		}

		emit ExpenseVoted(msg.sender, expenseID, votescast);
	}

	function settleExpense(
		uint256 expenseID,
		bool toSettle
	) external onlyOwners {
		ExpenseProposal storage expenseProposal = expenseProposals[expenseID];
		if (expenseProposal.recipient == address(0))
			revert ExpenseProposalNotFound();
		 if (expenseProposal.status != ExpenseStatus.Approved) {
        revert ExpenseNotApproved();
    }


		if (toSettle) {
			(bool success, ) = payable(expenseProposal.recipient).call{
				value: expenseProposal.amount
			}("");
			require(success, "TransferFailed");
			earmarkedFunds -= expenseProposal.amount;
			expenseProposal.status = ExpenseStatus.Settled;
			emit ExpenseSettled(expenseID, expenseProposal.description, expenseProposal.recipient,expenseProposal.amount, expenseProposal.votes, expenseProposal.status, expenseProposal.period, closePeriodProposalCounter + 1);
		} else {
			
			earmarkedFunds -= expenseProposal.amount;
			totalExpenses -= expenseProposal.amount;
			expenseProposal.status = ExpenseStatus.Cancelled;
		}

		uint256 lastExpenseID = expenseProposalIDs[
			expenseProposalIDs.length - 1
		];
		uint256 expenseIndex = expenseProposalIndex[expenseID];
		expenseProposalIDs[expenseIndex] = lastExpenseID;
		expenseProposalIndex[lastExpenseID] = expenseIndex;
		expenseProposalIDs.pop();

		delete expenseProposals[expenseID];
		
	}



	function issueInvoice(
		address payable _payor,
		uint256 _amount,
		string memory _description
	) external onlyOwners {
		if (owners[msg.sender].capital < 0)
			revert InsufficientOwnershipPercentage();

		invoiceCounter++;
		Invoice memory newInvoice;
		newInvoice.payor = _payor;
		newInvoice.amount = _amount;
		newInvoice.description = _description;
		newInvoice.period = closePeriodProposalCounter + 1;

		invoiceIDs.push(invoiceCounter);
		invoiceIndex[invoiceCounter] = invoiceIDs.length - 1;
		invoices[invoiceCounter] = newInvoice;

		emit InvoiceIssued(
			invoiceCounter,
			_payor,
			_amount,
			_description,
			closePeriodProposalCounter + 1
		);
	}

	function payInvoice(uint256 invoiceID) external payable {
		Invoice storage invoice = invoices[invoiceID];
		if (invoice.payor != msg.sender) revert OnlyPayorCanPayInvoice();
		if (invoice.amount != msg.value) revert IncorrectAmountSent();
		if (invoice.isPaid) revert InvoiceAlreadyPaid();

		invoice.isPaid = true;

		grossReceipts += msg.value;


		uint256 indexToRemove = invoiceIndex[invoiceID];
		uint256 lastInvoiceID = invoiceIDs[invoiceIDs.length - 1];

		invoiceIDs[indexToRemove] = lastInvoiceID;
		invoiceIndex[lastInvoiceID] = indexToRemove;
		invoiceIDs.pop();
		delete invoiceIndex[invoiceID];
		emit InvoicePaid(
			invoiceID,
			msg.sender,
			msg.value,
			invoice.description,
			invoice.period,
			closePeriodProposalCounter + 1
		);
	}

	function proposeCloseAccountingPeriod(
	) external onlyOwners {
		if (owners[msg.sender].capital == 0) revert OwnerNotFound();
		closePeriodProposalCounter++;
		CloseAccountingPeriodProposal storage proposal = closePeriodProposals[
			closePeriodProposalCounter
		];
		proposal.earnedRevenuePercentage = estimatedEarnedRevenuePercentage;
		uint256 initialOwnershipPercentage = calculateOwnershipPercentage(
			owners[msg.sender].capital
		);
		proposal.votes = initialOwnershipPercentage;

		if (initialOwnershipPercentage > 50) {
			proposal.approved = true;
		}

		closePeriodProposalIDs.push(closePeriodProposalCounter);

		emit ClosePeriodProposed(
			closePeriodProposalCounter,
			estimatedEarnedRevenuePercentage
		);
	}

	function voteForClosePeriodProposal(
		uint256 proposalID
	) external onlyOwners {
		if (owners[msg.sender].capital == 0) revert OwnerNotFound();
		CloseAccountingPeriodProposal storage proposal = closePeriodProposals[
			proposalID
		];
		if (proposal.earnedRevenuePercentage == 0)
			revert ClosePeriodProposalNotFound();

		uint256 voteCast = calculateOwnershipPercentage(
			owners[msg.sender].capital
		);
		proposal.votes += voteCast;

		if (voteCast > 50) {
			proposal.approved = true;
		}

		emit ClosePeriodVoted(msg.sender, proposalID);
	}

	function executeCloseAccountingPeriod(
		uint256 proposalID
	) external onlyOwners {
		if (owners[msg.sender].capital == 0) revert OwnerNotFound();
		CloseAccountingPeriodProposal storage proposal = closePeriodProposals[
			proposalID
		];
		if (proposal.approved == false) revert ClosePeriodProposalNotFound();

		uint256 earnedGrossReceipts = (grossReceipts *
			proposal.earnedRevenuePercentage) / 100;
		uint256 distributableIncome = 0;
		if (earnedGrossReceipts > totalExpenses) {
			distributableIncome = earnedGrossReceipts - totalExpenses;
		}

		grossReceipts -= earnedGrossReceipts;
		totalExpenses = 0;

		if (distributableIncome > 0) {
			for (uint i = 0; i < ownerAddresses.length; i++) {
				address currentOwnerAddress = ownerAddresses[i];
				uint256 ownershipPercentage = calculateOwnershipPercentage(
					owners[currentOwnerAddress].capital
				);
				uint256 ownerShare = (distributableIncome *
					ownershipPercentage) / 100;
				if (ownerShare > 0) {
					(bool success, ) = payable(currentOwnerAddress).call{
						value: ownerShare
					}("");
					if (!success) revert TransferFailed();
				}
			}
		}

		uint256 endTime = block.timestamp;

		uint256 lastProposalID = closePeriodProposalIDs[
			closePeriodProposalIDs.length - 1
		];
		uint256 proposalIndex = closePeriodProposalIndex[proposalID];
		closePeriodProposalIDs[proposalIndex] = lastProposalID;
		closePeriodProposalIndex[lastProposalID] = proposalIndex;
		closePeriodProposalIDs.pop();

		delete closePeriodProposals[proposalID];

		emit AccountingPeriodClosed(
			proposalID,
			currentPeriodStartTime,
			endTime,
			proposal.earnedRevenuePercentage,
			distributableIncome,
			earnedGrossReceipts,
			totalExpenses,
			grossReceipts
		);

		estimatedEarnedRevenuePercentage = 0;
		currentPeriodStartTime = block.timestamp;
	}

	function setEstimatedEarnedRevenue(
		uint256 _estimatedEarnedRevenuePercentage
	) external onlyOwners {
		if (owners[msg.sender].capital == 0) revert OwnerNotFound();
		estimatedEarnedRevenuePercentage = _estimatedEarnedRevenuePercentage;
	}

	function getEstimatedEarnedRevenuePercentage()
		external
		view
		returns (uint256)
	{
		return estimatedEarnedRevenuePercentage;
	}

	function getOwnerAddresses() external view returns (address[] memory) {
		return ownerAddresses;
	}

	function getGrossReceiptsAndTotalExpenses()
		external
		view
		returns (uint256[] memory)
	{
		uint256[] memory grossReceiptsAndTotalExpenses = new uint256[](2);
		grossReceiptsAndTotalExpenses[0] = grossReceipts;
		grossReceiptsAndTotalExpenses[1] = totalExpenses;
		return grossReceiptsAndTotalExpenses;
	}

	function getCapitalAdjustmentProposalDetails(
		uint256 proposalID
	) external view returns (address, uint256, uint256, bool) {
		CapitalAdjustmentProposal storage proposal = capitalAdjustmentProposals[
			proposalID
		];
		return (
			proposal.proposedAddress,
			proposal.proposedCapital,
			proposal.votes,
			proposal.isIncrease
		);
	}

	function getArrayOfActiveCapitalAdjustmentProposals()
		external
		view
		returns (uint256[] memory)
	{
		uint256[] memory _activeCapitalAdjustmentProposals = new uint256[](
			capitalAdjustmentProposalCounter
		);
		uint256 activeCapitalAdjustmentProposalCounter = 0;

		for (uint256 i = 0; i < capitalAdjustmentProposalCounter; i++) {
			if (capitalAdjustmentProposals[i].proposedAddress != address(0)) {
				_activeCapitalAdjustmentProposals[
					activeCapitalAdjustmentProposalCounter
				] = i;
				activeCapitalAdjustmentProposalCounter++;
			}
		}

		uint256[]
			memory activeCapitalAdjustmentProposalsTrimmed = new uint256[](
				activeCapitalAdjustmentProposalCounter
			);
		for (uint256 i = 0; i < activeCapitalAdjustmentProposalCounter; i++) {
			activeCapitalAdjustmentProposalsTrimmed[
				i
			] = _activeCapitalAdjustmentProposals[i];
		}

		return activeCapitalAdjustmentProposalsTrimmed;
	}

	function getOwnerDetails(
		address _address
	) external view returns (uint256[] memory) {
		uint256[] memory ownerDetails = new uint256[](4);
		ownerDetails[0] = owners[_address].capital;
		ownerDetails[1] = owners[_address].capitalRequirement;
		ownerDetails[2] = owners[_address].isAdded ? 1 : 0;
		ownerDetails[3] = owners[_address].canDeposit ? 1 : 0;
		return ownerDetails;
	}

	function getArrayOfCapital() external view returns (uint256[] memory) {
		uint256[] memory capitals = new uint256[](ownerAddresses.length);

		for (uint256 i = 0; i < ownerAddresses.length; i++) {
			capitals[i] = owners[ownerAddresses[i]].capital;
		}

		return capitals;
	}

	function getArrayOfArrays()
		external
		view
		returns (address[] memory, uint256[] memory)
	{
		address[] memory addresses = new address[](ownerAddresses.length);
		uint256[] memory capitals = new uint256[](ownerAddresses.length);

		for (uint256 i = 0; i < ownerAddresses.length; i++) {
			addresses[i] = ownerAddresses[i];
			capitals[i] = owners[ownerAddresses[i]].capital;
		}

		return (addresses, capitals);
	}

	function getExpenseProposalIDs() external view returns (uint256[] memory) {
		return expenseProposalIDs;
	}

	function getInvoiceIDs() external view returns (uint256[] memory) {
		return invoiceIDs;
	}

	function getClosePeriodProposalIDs()
		external
		view
		returns (uint256[] memory)
	{
		return closePeriodProposalIDs;
	}

	function getCapitalAdjustmentProposal(
		uint256 proposalID
	) external view returns (address, uint256, uint256, bool) {
		CapitalAdjustmentProposal storage proposal = capitalAdjustmentProposals[
			proposalID
		];
		return (
			proposal.proposedAddress,
			proposal.proposedCapital,
			proposal.votes,
			proposal.isIncrease
		);
	}


	function getActiveCapitalAdjustmentProposals()
		external
		view
		returns (uint256[][] memory)
	{
		uint256 activeCount = 0;

		for (uint256 i = 1; i <= capitalAdjustmentProposalCounter; i++) {
			if (capitalAdjustmentProposals[i].proposedAddress != address(0)) {
				activeCount++;
			}
		}

		uint256[][] memory activeProposals = new uint256[][](activeCount);
		uint256 currentIndex = 0;

		for (uint256 i = 1; i <= capitalAdjustmentProposalCounter; i++) {
			if (capitalAdjustmentProposals[i].proposedAddress != address(0)) {
				CapitalAdjustmentProposal
					memory proposal = capitalAdjustmentProposals[i];

				activeProposals[currentIndex] = new uint256[](5);
				activeProposals[currentIndex][0] = i;
				activeProposals[currentIndex][1] = uint256(
					uint160(proposal.proposedAddress)
				);
				activeProposals[currentIndex][2] = proposal.proposedCapital;
				activeProposals[currentIndex][3] = proposal.votes;
				activeProposals[currentIndex][4] = proposal.isIncrease ? 1 : 0;
				currentIndex++;
			}
		}

		return activeProposals;
	}

	function getActiveExpenseProposals()
		external
		view
		returns (uint256[][] memory)
	{
		uint256[][] memory expenseProposalsArray = new uint256[][](
			expenseProposalIDs.length
		);

		for (uint256 i = 0; i < expenseProposalIDs.length; i++) {
			ExpenseProposal storage expproposal = expenseProposals[
				expenseProposalIDs[i]
			];

			expenseProposalsArray[i] = new uint256[](6);
			expenseProposalsArray[i][0] = expenseProposalIDs[i];
		
		

			expenseProposalsArray[i][1] = uint256(
				uint160(expproposal.recipient)
			);
			expenseProposalsArray[i][2] = expproposal.amount;
			expenseProposalsArray[i][3] = expproposal.votes;
			expenseProposalsArray[i][4] = uint256(expproposal.status);
			expenseProposalsArray[i][5] = expproposal.period;
		}

		return expenseProposalsArray;
	}


    function getActiveExpenseProposalDescriptions()
        external
        view
        returns (string[] memory)
    {
 
        uint256 unapprovedCount = 0;
        for (uint256 i = 0; i < expenseProposalIDs.length; i++) {
            if (expenseProposals[expenseProposalIDs[i]].status == ExpenseStatus.Proposed) {
				unapprovedCount++;
            }
        }

    
        string[] memory expenseProposalDescriptions = new string[](
            unapprovedCount
        );

        uint256 currentIndex = 0;
        for (uint256 i = 0; i < expenseProposalIDs.length; i++) {
            if (expenseProposals[expenseProposalIDs[i]].status == ExpenseStatus.Proposed) {
                expenseProposalDescriptions[currentIndex] =
                    expenseProposals[expenseProposalIDs[i]].description;
                currentIndex++;
            }
        }

        return expenseProposalDescriptions;
    }

	function getApprovedExpenseProposals()
		external
		view
		returns (uint256[][] memory)
	{
		uint256[][] memory approvedExpenseProposals = new uint256[][](
			expenseProposalIDs.length
		);

		for (uint256 i = 0; i < expenseProposalIDs.length; i++) {
			ExpenseProposal storage expproposal = expenseProposals[
				expenseProposalIDs[i]
			];

			if (expproposal.status == ExpenseStatus.Approved) {
				approvedExpenseProposals[i] = new uint256[](6);
				approvedExpenseProposals[i][0] = expenseProposalIDs[i];
				approvedExpenseProposals[i][1] = uint256(
					uint160(expproposal.recipient)
				);
				approvedExpenseProposals[i][2] = expproposal.amount;
				approvedExpenseProposals[i][3] = expproposal.votes;
				approvedExpenseProposals[i][4] = uint256(expproposal.status);
				approvedExpenseProposals[i][5] = expproposal.period;
			}
		}

		return approvedExpenseProposals;
	}


	function getApprovedExpenseProposalDescriptions()
		external
		view
		returns (string[] memory)
	{
		uint256 approvedCount = 0;
		for (uint256 i = 0; i < expenseProposalIDs.length; i++) {
			if (
				expenseProposals[expenseProposalIDs[i]].status ==
				ExpenseStatus.Approved
			) {
				approvedCount++;
			}
		}

		string[] memory approvedExpenseProposalDescriptions = new string[](
			approvedCount
		);

		uint256 currentIndex = 0;
		for (uint256 i = 0; i < expenseProposalIDs.length; i++) {
			if (
				expenseProposals[expenseProposalIDs[i]].status ==
				ExpenseStatus.Approved
			) {
				approvedExpenseProposalDescriptions[currentIndex] = expenseProposals[
					expenseProposalIDs[i]
				]
					.description;
				currentIndex++;
			}
		}

		return approvedExpenseProposalDescriptions;
	}


}
