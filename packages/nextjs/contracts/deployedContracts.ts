/**
 * This file is autogenerated by Scaffold-ETH.
 * You should not edit it manually or your changes might be overwritten.
 */
import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";

const deployedContracts = {
  31337: {
    YourContract: {
      address: "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0",
      abi: [
        {
          inputs: [
            {
              internalType: "address[]",
              name: "initialOwners",
              type: "address[]",
            },
            {
              internalType: "uint256[]",
              name: "capitalRequirements",
              type: "uint256[]",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          inputs: [],
          name: "CanOnlyVoteOnce",
          type: "error",
        },
        {
          inputs: [],
          name: "CannotSettleBeforeDate",
          type: "error",
        },
        {
          inputs: [],
          name: "ClosePeriodProposalNotFound",
          type: "error",
        },
        {
          inputs: [],
          name: "ExpenseNotApproved",
          type: "error",
        },
        {
          inputs: [],
          name: "ExpenseProposalNotFound",
          type: "error",
        },
        {
          inputs: [],
          name: "IncorrectAmountSent",
          type: "error",
        },
        {
          inputs: [],
          name: "InsufficientOwnershipPercentage",
          type: "error",
        },
        {
          inputs: [],
          name: "InvoiceAlreadyPaid",
          type: "error",
        },
        {
          inputs: [],
          name: "MismatchOwnersCapitalRequirements",
          type: "error",
        },
        {
          inputs: [],
          name: "OnlyAdmin",
          type: "error",
        },
        {
          inputs: [],
          name: "OnlyOwners",
          type: "error",
        },
        {
          inputs: [],
          name: "OnlyPayorCanPayInvoice",
          type: "error",
        },
        {
          inputs: [],
          name: "OwnerCannotDeposit",
          type: "error",
        },
        {
          inputs: [],
          name: "OwnerNotFound",
          type: "error",
        },
        {
          inputs: [],
          name: "ProposalNotFound",
          type: "error",
        },
        {
          inputs: [],
          name: "TransferFailed",
          type: "error",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "proposalID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "startTime",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "endTime",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "earnedRevenuePercentage",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "distributableIncome",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "earnedGrossReceipts",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "totalExpenses",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "grossReceipts",
              type: "uint256",
            },
          ],
          name: "AccountingPeriodClosed",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "proposedAddress",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "proposedCapital",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "bool",
              name: "isIncrease",
              type: "bool",
            },
          ],
          name: "CapitalAdjustmentProposed",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "proposalID",
              type: "uint256",
            },
          ],
          name: "CapitalAdjustmentVoted",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "ownerAddress",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "CapitalDeposited",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "proposalID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "ClearedExpiredExpenseProposal",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "proposalID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "earnedRevenuePercentage",
              type: "uint256",
            },
          ],
          name: "ClosePeriodProposed",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "proposalID",
              type: "uint256",
            },
          ],
          name: "ClosePeriodVoted",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "expenseID",
              type: "uint256",
            },
          ],
          name: "ExpenseApproved",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "expenseID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "string",
              name: "description",
              type: "string",
            },
            {
              indexed: false,
              internalType: "address",
              name: "recipient",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "ExpenseProposed",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "expenseID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "string",
              name: "description",
              type: "string",
            },
            {
              indexed: false,
              internalType: "address",
              name: "recipient",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "votes",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "enum YourContract.ExpenseStatus",
              name: "status",
              type: "uint8",
            },
          ],
          name: "ExpenseSettled",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "expenseID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "voteWeight",
              type: "uint256",
            },
          ],
          name: "ExpenseVoted",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "invoiceID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "address",
              name: "payor",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "string",
              name: "description",
              type: "string",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "period",
              type: "uint256",
            },
          ],
          name: "InvoiceIssued",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "invoiceID",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "address",
              name: "payor",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "string",
              name: "description",
              type: "string",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "period",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "accountingPeriod",
              type: "uint256",
            },
          ],
          name: "InvoicePaid",
          type: "event",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "activeCapitalAdjustmentProposalIndex",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "activeCapitalAdjustmentProposals",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "admin",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "ownerCapital",
              type: "uint256",
            },
          ],
          name: "calculateOwnershipPercentage",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "capitalAdjustmentProposalCounter",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          name: "capitalAdjustmentProposalVoters",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "capitalAdjustmentProposals",
          outputs: [
            {
              internalType: "address",
              name: "proposedAddress",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "proposedCapital",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "votes",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "isIncrease",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "closePeriodProposalCounter",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "closePeriodProposalIDs",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "closePeriodProposalIndex",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          name: "closePeriodProposalVoters",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "closePeriodProposals",
          outputs: [
            {
              internalType: "uint256",
              name: "earnedRevenuePercentage",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "votes",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "approved",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_proposedAddress",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_proposedCapital",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "_isIncrease",
              type: "bool",
            },
          ],
          name: "createCapitalAdjustmentProposal",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "string",
              name: "description",
              type: "string",
            },
            {
              internalType: "address",
              name: "recipient",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "createExpenseProposal",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "currentPeriodStartTime",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "ownerAddress",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "depositCapital",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [],
          name: "earmarkedFunds",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "estimatedEarnedRevenuePercentage",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "proposalID",
              type: "uint256",
            },
          ],
          name: "executeCloseAccountingPeriod",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "expenseProposalCounter",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "expenseProposalIDs",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "expenseProposalIndex",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          name: "expenseProposalVoters",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "expenseProposals",
          outputs: [
            {
              internalType: "string",
              name: "description",
              type: "string",
            },
            {
              internalType: "address",
              name: "recipient",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "votes",
              type: "uint256",
            },
            {
              internalType: "enum YourContract.ExpenseStatus",
              name: "status",
              type: "uint8",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "getActiveCapitalAdjustmentProposals",
          outputs: [
            {
              internalType: "uint256[][]",
              name: "",
              type: "uint256[][]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "getActiveExpenseProposalDescriptions",
          outputs: [
            {
              internalType: "string[]",
              name: "",
              type: "string[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "getActiveExpenseProposals",
          outputs: [
            {
              internalType: "uint256[][]",
              name: "",
              type: "uint256[][]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "getApprovedExpenseProposalDescriptions",
          outputs: [
            {
              internalType: "string[]",
              name: "",
              type: "string[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "getApprovedExpenseProposals",
          outputs: [
            {
              internalType: "uint256[][]",
              name: "",
              type: "uint256[][]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "getArrayOfActiveCapitalAdjustmentProposals",
          outputs: [
            {
              internalType: "uint256[]",
              name: "",
              type: "uint256[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "getArrayOfArrays",
          outputs: [
            {
              internalType: "address[]",
              name: "",
              type: "address[]",
            },
            {
              internalType: "uint256[]",
              name: "",
              type: "uint256[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "getArrayOfCapital",
          outputs: [
            {
              internalType: "uint256[]",
              name: "",
              type: "uint256[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "proposalID",
              type: "uint256",
            },
          ],
          name: "getCapitalAdjustmentProposal",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "proposalID",
              type: "uint256",
            },
          ],
          name: "getCapitalAdjustmentProposalDetails",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "getClosePeriodProposalIDs",
          outputs: [
            {
              internalType: "uint256[]",
              name: "",
              type: "uint256[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "getEstimatedEarnedRevenuePercentage",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "getExpenseProposalIDs",
          outputs: [
            {
              internalType: "uint256[]",
              name: "",
              type: "uint256[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "getGrossReceiptsAndTotalExpenses",
          outputs: [
            {
              internalType: "uint256[]",
              name: "",
              type: "uint256[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "getInvoiceIDs",
          outputs: [
            {
              internalType: "uint256[]",
              name: "",
              type: "uint256[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "getOwnerAddresses",
          outputs: [
            {
              internalType: "address[]",
              name: "",
              type: "address[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_address",
              type: "address",
            },
          ],
          name: "getOwnerDetails",
          outputs: [
            {
              internalType: "uint256[]",
              name: "",
              type: "uint256[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "grossReceipts",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "invoiceCounter",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "invoiceIDs",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "invoiceIndex",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "invoices",
          outputs: [
            {
              internalType: "address payable",
              name: "payor",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "isPaid",
              type: "bool",
            },
            {
              internalType: "string",
              name: "description",
              type: "string",
            },
            {
              internalType: "uint256",
              name: "period",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address payable",
              name: "_payor",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
            {
              internalType: "string",
              name: "_description",
              type: "string",
            },
          ],
          name: "issueInvoice",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "ownerAddresses",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          name: "owners",
          outputs: [
            {
              internalType: "uint256",
              name: "capital",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "capitalRequirement",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "isAdded",
              type: "bool",
            },
            {
              internalType: "bool",
              name: "canDeposit",
              type: "bool",
            },
            {
              internalType: "uint256",
              name: "index",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "invoiceID",
              type: "uint256",
            },
          ],
          name: "payInvoice",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "earnedRevenuePercentage",
              type: "uint256",
            },
          ],
          name: "proposeCloseAccountingPeriod",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_estimatedEarnedRevenuePercentage",
              type: "uint256",
            },
          ],
          name: "setEstimatedEarnedRevenue",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "expenseID",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "toSettle",
              type: "bool",
            },
          ],
          name: "settleExpense",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "totalCapital",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "totalExpenses",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "proposalID",
              type: "uint256",
            },
          ],
          name: "voteForCapitalProposal",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "proposalID",
              type: "uint256",
            },
          ],
          name: "voteForClosePeriodProposal",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "expenseID",
              type: "uint256",
            },
          ],
          name: "voteForExpenseProposal",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
      inheritedFunctions: {},
    },
  },
} as const;

export default deployedContracts satisfies GenericContractsDeclaration;
