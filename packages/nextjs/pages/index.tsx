import { useEffect, useRef, useState } from "react";
import { CSSProperties } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { MetaHeader } from "~~/components/MetaHeader";
import { AddressInput, EtherInput, InputBase } from "~~/components/scaffold-eth";
import { Capitaladjvote, ExpAdjVote, ExpCancel, ExpSettle } from "~~/components/scaffold-eth";
import { useScaffoldContractRead, useScaffoldContractWrite, useScaffoldEventHistory } from "~~/hooks/scaffold-eth";

type OwnerState = {
  addresses: string[];
  capitals: number[];
  percentages: string[];
};

interface Proposal {
  id: number;
  address: string;
  capital: number;
  votes: number;
  isCapitalIncrease: boolean;
}

const Home: NextPage = () => {
  const [activeTab, setActiveTab] = useState(1);

  const handleTabChange = (tabNumber: number) => {
    setActiveTab(tabNumber);

    setTimeout(() => {
      goToPage(tabNumber);
    }, 10);
  };

  const tabContentStyle: CSSProperties = {
    transition: "opacity 4s ease-in-out, max-height 4s ease-in-out",
    opacity: 0,
    maxHeight: 0,
    overflow: "hidden",

    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  };

  const activeTabContentStyle: CSSProperties = {
    ...tabContentStyle,
    opacity: 1,
    maxHeight: "1000px",
    padding: "20px",
  };

  const etherToWei = (ether: string) => {
    if (!ether || isNaN(parseFloat(ether))) return BigInt(0); // Handle invalid or empty inputs
    return BigInt(Math.floor(parseFloat(ether) * 1e18)); // Convert Ether to Wei
  };

  const { data: arrayOfOwnersAndCapital } = useScaffoldContractRead({
    contractName: "YourContract",
    functionName: "getArrayOfArrays",
  });

  const [owners, setOwners] = useState<OwnerState>({ addresses: [], capitals: [], percentages: [] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const [currentPage, setCurrentPage] = useState(1);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const goToPage = (pageNumber: number) => setCurrentPage(pageNumber);

  //eslint-disable-next-line
  const handleClickOutside = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      event.stopPropagation();
      closeModal();
    }
  };

  useEffect(() => {
    const handleClickOutsideexp = (event: MouseEvent) => {
      if (expensesModalRef.current && !expensesModalRef.current.contains(event.target as Node)) {
        closeExpensesModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutsideexp);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideexp);
    };
  }, [isModalOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (expensesModalRef.current && !expensesModalRef.current.contains(event.target as Node)) {
        closeExpensesModal();
      }
    };
    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen]);

  const selectedTabStyle: CSSProperties = {
    backgroundColor: "white",
    color: "black",
    transform: "scale(1.05)",
    transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out, opacity 0.3s ease-in-out",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
    opacity: 1,
    zIndex: 10,
    position: "relative",
  };

  const unselectedTabStyle: CSSProperties = {
    backgroundColor: "lightgrey",
    color: "grey",
    transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out, opacity 0.3s ease-in-out",
    opacity: 0.65,
    position: "relative",
  };

  useEffect(() => {
    if (arrayOfOwnersAndCapital && arrayOfOwnersAndCapital.length >= 2) {
      const capitalAmounts = arrayOfOwnersAndCapital[1].map(item => parseFloat(item.toString()));
      const totalCapital = capitalAmounts.reduce((acc, item) => acc + item, 0);
      const percentages = capitalAmounts.map(capital => ((capital / totalCapital) * 100).toFixed(2));

      setOwners({
        addresses: arrayOfOwnersAndCapital[0].map(address => address.toString()),
        capitals: capitalAmounts,
        percentages: percentages,
      });
    }
  }, [arrayOfOwnersAndCapital]);

  const [newOwnerAddress, setnewOwnerAddress] = useState("");
  const [requiredCapitalAmountToAdd, setrequiredCapitalAmountToAdd] = useState<string>("");

  const { writeAsync: addOwner } = useScaffoldContractWrite({
    contractName: "YourContract",
    functionName: "createCapitalAdjustmentProposal",
    args: [newOwnerAddress, requiredCapitalAmountToAdd ? etherToWei(requiredCapitalAmountToAdd) : BigInt(0), true],
  });

  const { address } = useAccount();

  const isOwner = owners.addresses.includes(address ?? "");

  const [capitalAmounts, setCapitalAmounts] = useState<{ [key: string]: string }>({});
  console.log("capitalAmounts", capitalAmounts);
  const handleBatchCapitalAmountChange = (address: string, value: string) => {
    setCapitalAmounts(prevState => ({
      ...prevState,
      [address]: value,
    }));
  };

  const { data: ownerDetails } = useScaffoldContractRead({
    contractName: "YourContract",
    functionName: "getOwnerDetails",
    args: [address],
  });

  const [depositableAmount, setDepositableAmount] = useState<bigint>(BigInt(0));
  const [isDepositable, setDepositable] = useState(false);

  useEffect(() => {
    if (ownerDetails && ownerDetails.length >= 2) {
      const depositable = ownerDetails[3];
      const depositableNumber = Number(depositable);
      const depositableBool = depositableNumber === 1 ? true : false;
      setDepositable(depositableBool);

      if (depositableBool) {
        setDepositableAmount(ownerDetails[1]);
      }
    }
  }, [ownerDetails]);

  const { writeAsync: depositAmount } = useScaffoldContractWrite({
    contractName: "YourContract",
    functionName: "depositCapital",
    args: [address, depositableAmount],
    value: depositableAmount,
  });

  const handleCapitalAmountChange = (value: string) => {
    console.log("EtherInput value:", value);
    setrequiredCapitalAmountToAdd(value);
  };

  const { data: arrayOfActiveProposals } = useScaffoldContractRead({
    contractName: "YourContract",
    functionName: "getActiveCapitalAdjustmentProposals",
  });

  const [activeProposals, setActiveProposals] = useState<any>([]);

  useEffect(() => {
    if (arrayOfActiveProposals) {
      const arrayOfActiveProposalsNumber = arrayOfActiveProposals.map((proposalArray: readonly bigint[]) => {
        const [id, address, capital, votes, isCapitalIncrease] = proposalArray;

        return {
          id: Number(id),
          address: "0x" + address.toString(16),
          capital: (Number(capital) / 1e18).toFixed(2),
          votes: Number(votes),
          isCapitalIncrease: Number(isCapitalIncrease) === 1,
        };
      });

      setActiveProposals(arrayOfActiveProposalsNumber);
    }
  }, [arrayOfActiveProposals]);

  const { data: Depositevents } = useScaffoldEventHistory({
    contractName: "YourContract",
    eventName: "CapitalDeposited",
    fromBlock: BigInt(0),
    watch: true,

    blockData: true,
    transactionData: true,
    receiptData: true,
  });

  console.log("events", Depositevents);

  const [depositEvents, setDepositEvents] = useState<any>([]);

  useEffect(() => {
    if (Depositevents) {
      const parsedEvents = Depositevents.map((event: any) => {
        return {
          address: event.args.ownerAddress,
          amount: Number(event.args[1]) / 1e18,
          timestamp: Number(event.block.timestamp) * 1000,
        };
      });

      setDepositEvents(parsedEvents);
    }
  }, [Depositevents]);

  const { data: arrayOfGrossReceiptsAndTotalExpenses } = useScaffoldContractRead({
    contractName: "YourContract",
    functionName: "getGrossReceiptsAndTotalExpenses",
  });

  const [grossReceipts, setGrossReceipts] = useState<number>(0);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);

  useEffect(() => {
    if (arrayOfGrossReceiptsAndTotalExpenses && arrayOfGrossReceiptsAndTotalExpenses.length >= 2) {
      const grossReceiptsNumber = Number(arrayOfGrossReceiptsAndTotalExpenses[0]);
      const totalExpensesNumber = Number(arrayOfGrossReceiptsAndTotalExpenses[1]);
      setGrossReceipts(grossReceiptsNumber);
      setTotalExpenses(totalExpensesNumber);
    }
  }, [arrayOfGrossReceiptsAndTotalExpenses]);

  const { data: estimatedEarnedRevenuePercentage } = useScaffoldContractRead({
    contractName: "YourContract",
    functionName: "getEstimatedEarnedRevenuePercentage",
  });

  const [estimatedEarnedRevenuePercentageNumber, setEstimatedEarnedRevenuePercentageNumber] = useState<number>(0);

  useEffect(() => {
    if (estimatedEarnedRevenuePercentage) {
      const estimatedEarnedRevenuePercentageNumber = Number(estimatedEarnedRevenuePercentage);
      setEstimatedEarnedRevenuePercentageNumber(estimatedEarnedRevenuePercentageNumber);
    }
  }, [estimatedEarnedRevenuePercentage]);

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const invoiceModalRef = useRef<HTMLDivElement>(null);

  const [invoiceTab, setInvoiceTab] = useState("Issue Invoice");

  const openInvoiceModal = () => setIsInvoiceModalOpen(true);

  const closeInvoiceModal = () => setIsInvoiceModalOpen(false);

  const handleInvoiceTabChange = (tabName: string) => {
    setInvoiceTab(tabName);
  };
  //eslint-disable-next-line
  const handleInvoiceModalClickOutside = (event: MouseEvent) => {
    if (invoiceModalRef.current && !invoiceModalRef.current.contains(event.target as Node)) {
      closeInvoiceModal();
    }
  };
  useEffect(() => {
    if (isInvoiceModalOpen) {
      document.addEventListener("mousedown", handleInvoiceModalClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleInvoiceModalClickOutside);
    };
  }, [isInvoiceModalOpen, handleInvoiceModalClickOutside]);

  const [isIncreaseEquityModalOpen, setIsIncreaseEquityModalOpen] = useState(false);
  const increaseEquityModalRef = useRef<HTMLDivElement>(null);

  //eslint-disable-next-line
  const openIncreaseEquityModal = () => setIsIncreaseEquityModalOpen(true);

  const closeIncreaseEquityModal = () => setIsIncreaseEquityModalOpen(false);

  //eslint-disable-next-line
  const handleIncreaseEquityModalClickOutside = (event: MouseEvent) => {
    if (increaseEquityModalRef.current && !increaseEquityModalRef.current.contains(event.target as Node)) {
      closeIncreaseEquityModal();
    }
  };

  useEffect(() => {
    if (isIncreaseEquityModalOpen) {
      document.addEventListener("mousedown", handleIncreaseEquityModalClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleIncreaseEquityModalClickOutside);
    };
  }, [isIncreaseEquityModalOpen, handleIncreaseEquityModalClickOutside]);

  const [isPercentageModalOpen, setIsPercentageModalOpen] = useState(false);
  const percentageModalRef = useRef<HTMLDivElement>(null);

  //eslint-disable-next-line
  const [sliderValue, setSliderValue] = useState(0);

  const openPercentageModal = () => setIsPercentageModalOpen(true);
  const closePercentageModal = () => setIsPercentageModalOpen(false);
  //eslint-disable-next-line
  const handlePercentageModalClickOutside = (event: MouseEvent) => {
    if (percentageModalRef.current && !percentageModalRef.current.contains(event.target as Node)) {
      closePercentageModal();
    }
  };
  useEffect(() => {
    if (isPercentageModalOpen) {
      document.addEventListener("mousedown", handlePercentageModalClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handlePercentageModalClickOutside);
    };
  }, [isPercentageModalOpen, handlePercentageModalClickOutside]);

  //eslint-disable-next-line
  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(event.target.value);
    setSliderValue(newValue);
    localStorage.setItem("sliderValue", newValue.toString());
  };

  useEffect(() => {
    const savedSliderValue = localStorage.getItem("sliderValue");
    if (savedSliderValue !== null) {
      setSliderValue(Number(savedSliderValue));
    }
  }, []);

  const [isExpensesModalOpen, setIsExpensesModalOpen] = useState(false);
  const [expensesTab, setExpensesTab] = useState(1);
  const expensesModalRef = useRef<HTMLDivElement>(null);

  const openExpensesModal = () => {
    setIsExpensesModalOpen(true);
    setExpensesTab(1);
  };
  const closeExpensesModal = () => setIsExpensesModalOpen(false);

  const handleExpensesTabChange = (tabName: any) => {
    setExpensesTab(tabName);
  };

  useEffect(() => {
    const handleClickOutsideexp = (event: MouseEvent) => {
      if (expensesModalRef.current && !expensesModalRef.current.contains(event.target as Node)) {
        closeExpensesModal();
      }
    };

    if (isExpensesModalOpen) {
      document.addEventListener("mousedown", handleClickOutsideexp);
    } else {
      document.removeEventListener("mousedown", handleClickOutsideexp);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideexp);
    };
  }, [isExpensesModalOpen]);

  const [invoiceRecipientAddress, setInvoiceRecipientAddress] = useState("");

  useEffect(() => {
    if (invoiceRecipientAddress) {
      setInvoiceRecipientAddress(invoiceRecipientAddress);
    }
  }, [invoiceRecipientAddress]);

  const [invoiceAmount, setInvoiceAmount] = useState("");

  useEffect(() => {
    if (invoiceAmount) {
      setInvoiceAmount(invoiceAmount);
    }
  }, [invoiceAmount]);

  const { data: InvoiceIssuedEvents } = useScaffoldEventHistory({
    contractName: "YourContract",
    eventName: "InvoiceIssued",
    fromBlock: BigInt(0),
    watch: true,

    blockData: true,
    transactionData: true,
    receiptData: true,
  });

  console.log("events", InvoiceIssuedEvents);

  const [InvoiceIssuedEventsArray, setInvoiceIssuedEventsArray] = useState<any>([]);

  useEffect(() => {
    if (InvoiceIssuedEvents) {
      const parsedEvents = InvoiceIssuedEvents.map((event: any) => {
        return {
          invoiceID: Number(event.args.invoiceID),
          payor: event.args.payor,
          amount: Number(event.args.amount) / 1e18,
          description: event.args.description,
          period: Number(event.args.period),
          timestamp: Number(event.block.timestamp) * 1000,
        };
      });

      setInvoiceIssuedEventsArray(parsedEvents);
    }
  }, [InvoiceIssuedEvents]);

  const [invoiceDescription, setInvoiceDescription] = useState("");

  useEffect(() => {
    if (invoiceDescription) {
      setInvoiceDescription(invoiceDescription);
    }
  }, [invoiceDescription]);

  const { writeAsync: issueInvoice } = useScaffoldContractWrite({
    contractName: "YourContract",
    functionName: "issueInvoice",
    args: [invoiceRecipientAddress, etherToWei(invoiceAmount), invoiceDescription],
  });

  const { data: arrayOfInvoiceIDs } = useScaffoldContractRead({
    contractName: "YourContract",
    functionName: "getInvoiceIDs",
  });

  const [arrayOfInvoiceIDsArray, setArrayOfInvoiceIDsArray] = useState<any>([]);

  useEffect(() => {
    if (arrayOfInvoiceIDs) {
      const arrayOfInvoiceIDs_ = arrayOfInvoiceIDs.map(item => Number(item));

      setArrayOfInvoiceIDsArray(arrayOfInvoiceIDs_);
      console.log("arrayOfInvoiceIDs", arrayOfInvoiceIDs_);
    }
  }, [arrayOfInvoiceIDs]);

  const { data: InvoicePaidEvents } = useScaffoldEventHistory({
    contractName: "YourContract",
    eventName: "InvoicePaid",
    fromBlock: BigInt(0),
    watch: true,

    blockData: true,
    transactionData: true,
    receiptData: true,
  });

  const [InvoicePaidEventsArray, setInvoicePaidEventsArray] = useState<any>([]);

  useEffect(() => {
    if (InvoicePaidEvents) {
      const parsedEvents = InvoicePaidEvents.map((event: any) => {
        return {
          invoiceID: Number(event.args.invoiceID),
          payor: event.args.payor,
          amount: Number(event.args.amount) / 1e18,
          description: event.args.description,
          period: Number(event.args.period),
          currentperiod: Number(event.args.accountingPeriod),
        };
      });

      setInvoicePaidEventsArray(parsedEvents);
    }
  }, [InvoicePaidEvents]);

  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseRecipientAddress, setExpenseRecipientAddress] = useState("");
  const [expenseAmount, setExpenseAmount] = useState<string>("");

  const { writeAsync: proposeExpense } = useScaffoldContractWrite({
    contractName: "YourContract",
    functionName: "createExpenseProposal",
    args: [expenseDescription, expenseRecipientAddress, etherToWei(expenseAmount.toString())],
  });

  useEffect(() => {
    if (expenseDescription) {
      setExpenseDescription(expenseDescription);
    }
  }, [expenseDescription]);

  useEffect(() => {
    if (expenseRecipientAddress) {
      setExpenseRecipientAddress(expenseRecipientAddress);
    }
  }, [expenseRecipientAddress]);

  useEffect(() => {
    if (expenseAmount) {
      setExpenseAmount(expenseAmount);
    }
  }, [expenseAmount]);

  const [currentEstimatedRevenuePercentage, setCurrentEstimatedRevenuePercentage] = useState<number>(0);

  const { writeAsync: setEstimatedEarnedRevenue } = useScaffoldContractWrite({
    contractName: "YourContract",
    functionName: "setEstimatedEarnedRevenue",
    args: [BigInt(currentEstimatedRevenuePercentage)],
  });

  useEffect(() => {
    if (currentEstimatedRevenuePercentage) {
      setCurrentEstimatedRevenuePercentage(currentEstimatedRevenuePercentage);
      console.log("currentEstimatedRevenuePercentage", currentEstimatedRevenuePercentage);
    }
  }, [currentEstimatedRevenuePercentage]);

  const { data: arrayOfExpenseProposals } = useScaffoldContractRead({
    contractName: "YourContract",
    functionName: "getActiveExpenseProposals",
  });

  const [arrayOfExpenseProposalsArray, setArrayOfExpenseProposalsArray] = useState<any>([]);

  useEffect(() => {
    if (arrayOfExpenseProposals) {
      const arrayOfExpenseProposals_ = arrayOfExpenseProposals.map((expproposalArray: any) => {
        const [id, recipient, amount, votes, status, period] = expproposalArray;

        return {
          id: Number(id),

          recipient: "0x" + recipient.toString(16),
          amount: (Number(amount) / 1e18).toFixed(4),
          votes: Number(votes),
          status: Number(status),
          period: Number(period),
        };
      });

      setArrayOfExpenseProposalsArray(arrayOfExpenseProposals_);
      console.log("arrayOfExpenseProposals", arrayOfExpenseProposals_);
    }
  }, [arrayOfExpenseProposals]);

  const { data: arrayOfExpenseProposalDescriptions } = useScaffoldContractRead({
    contractName: "YourContract",
    functionName: "getActiveExpenseProposalDescriptions",
  });

  const [arrayOfExpenseProposalDescriptionsArray, setArrayOfExpenseProposalDescriptionsArray] = useState<any>([]);

  useEffect(() => {
    if (arrayOfExpenseProposalDescriptions) {
      setArrayOfExpenseProposalDescriptionsArray(arrayOfExpenseProposalDescriptions);
      console.log("arrayOfExpenseProposalDescriptions", arrayOfExpenseProposalDescriptions);
    }
  }, [arrayOfExpenseProposalDescriptions]);

  const { data: arrayOfExpenseApprovedDescriptions } = useScaffoldContractRead({
    contractName: "YourContract",
    functionName: "getApprovedExpenseProposalDescriptions",
  });

  const [arrayOfExpenseApprovedDescriptionsArray, setArrayOfExpenseApprovedDescriptionsArray] = useState<any>([]);

  useEffect(() => {
    if (arrayOfExpenseApprovedDescriptions) {
      setArrayOfExpenseApprovedDescriptionsArray(arrayOfExpenseApprovedDescriptions);
      console.log("arrayOfExpenseApprovedDescriptions", arrayOfExpenseApprovedDescriptions);
    }
  }, [arrayOfExpenseApprovedDescriptions]);

  const { data: ExpenseSettledEvents } = useScaffoldEventHistory({
    contractName: "YourContract",
    eventName: "ExpenseSettled",
    fromBlock: BigInt(0),
    watch: true,

    blockData: true,
    transactionData: true,
    receiptData: true,
  });

  const [ExpenseSettledEventsArray, setExpenseSettledEventsArray] = useState<any>([]);

  useEffect(() => {
    if (ExpenseSettledEvents) {
      const parsedEvents = ExpenseSettledEvents.map((event: any) => {
        return {
          expenseID: Number(event.args.expenseID),
          description: event.args.description,
          recipient: event.args.recipient,
          amount: Number(event.args.amount) / 1e18,
          votes: Number(event.args.votes),
          status: Number(event.args.status),
          period: Number(event.args.period),
          accountingPeriod: Number(event.args.accountingPeriod),
        };
      });

      setExpenseSettledEventsArray(parsedEvents);
    }
  }, [ExpenseSettledEvents]);

  const [isPeriodCloseModalOpen, setIsPeriodCloseModalOpen] = useState(false);
  const periodCloseModalRef = useRef<HTMLDivElement>(null);
  const [periodCloseTab, setPeriodCloseTab] = useState(1);
  const openPeriodCloseModal = () => setIsPeriodCloseModalOpen(true);
  const closePeriodCloseModal = () => setIsPeriodCloseModalOpen(false);

  const handlePeriodCloseTabChange = (tabName: any) => {
    setPeriodCloseTab(tabName);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (periodCloseModalRef.current && !periodCloseModalRef.current.contains(event.target as Node)) {
        closePeriodCloseModal();
      }
    };
    if (isPeriodCloseModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPeriodCloseModalOpen]);

  const { writeAsync: proposePeriodClose } = useScaffoldContractWrite({
    contractName: "YourContract",
    functionName: "proposeCloseAccountingPeriod",
  });

  const { data: currentPeriod } = useScaffoldContractRead({
    contractName: "YourContract",
    functionName: "currentPeriod",
  });

  const [currentPeriodNumber, setCurrentPeriodNumber] = useState<number>(0);

  useEffect(() => {
    if (currentPeriod) {
      const currentPeriodNumber = Number(currentPeriod);
      setCurrentPeriodNumber(currentPeriodNumber);
    }
  }, [currentPeriod]);

  const { writeAsync: voteForClosePeriodProposal } = useScaffoldContractWrite({
    contractName: "YourContract",
    functionName: "voteForClosePeriodProposal",
  });

  const { data: AccountingPeriodClosedEvents } = useScaffoldEventHistory({
    contractName: "YourContract",
    eventName: "AccountingPeriodClosed",
    fromBlock: BigInt(0),
    watch: true,

    blockData: true,
    transactionData: true,
    receiptData: true,
  });

  const [AccountingPeriodClosedEventsArray, setAccountingPeriodClosedEventsArray] = useState<any>([]);

  useEffect(() => {
    if (AccountingPeriodClosedEvents) {
      const parsedEvents = AccountingPeriodClosedEvents.map((event: any) => {
        return {
          period: Number(event.args.period),
          startTime: Number(event.args.startTime),
          endTime: Number(event.args.endTime),
          earnedRevenuePercentage: Number(event.args.earnedRevenuePercentage),
          distributableIncome: Number(event.args.distributableIncome),
          earnedGrossReceipts: Number(event.args.earnedGrossReceipts),
          totalExpenses: Number(event.args.totalExpenses),
          grossReceipts: Number(event.args.grossReceipts),
          timestamp: Number(event.block.timestamp) * 1000,
        };
      });

      setAccountingPeriodClosedEventsArray(parsedEvents);
    }
  }, [AccountingPeriodClosedEvents]);

  const { writeAsync: withdrawDistribution } = useScaffoldContractWrite({
    contractName: "YourContract",
    functionName: "withdraw",
  });

  const { data: pendingWithdrawals } = useScaffoldContractRead({
    contractName: "YourContract",
    functionName: "getPendingWithdrawals",
    args: [address],
  });

  const [pendingWithdrawalsArray, setPendingWithdrawalsArray] = useState<number>(0);

  useEffect(() => {
    if (pendingWithdrawals) {
      const parsedWithdrawals = Number(pendingWithdrawals) / 1e18;
      setPendingWithdrawalsArray(parsedWithdrawals);
    }
  }, [pendingWithdrawals]);

  const { writeAsync: proposeBatchCapitalIncrease } = useScaffoldContractWrite({
    contractName: "YourContract",
    functionName: "proposeBatchCapitalIncrease",
    args: [Object.keys(capitalAmounts), Object.values(capitalAmounts).map(amount => etherToWei(amount))],
  });

  const { data: arrayOfBatchCapitalIncreaseProposal } = useScaffoldContractRead({
    contractName: "YourContract",
    functionName: "getBatchCapitalIncreaseProposals",
  });

  const [arrayOfBatchCapitalIncreaseProposalArray, setArrayOfBatchCapitalIncreaseProposalArray] = useState<any>([]);

  useEffect(() => {
    if (arrayOfBatchCapitalIncreaseProposal) {
      //for each item in the array convert from wei to eth, its one array that only has amount and nothing else
      const arrayOfBatchCapitalIncreaseProposal_ = arrayOfBatchCapitalIncreaseProposal.map((item: any) => {
        return Number(item) / 1e18;
      });

      setArrayOfBatchCapitalIncreaseProposalArray(arrayOfBatchCapitalIncreaseProposal_);
    }
  });

  const { writeAsync: voteForBatchCapitalIncrease } = useScaffoldContractWrite({
    contractName: "YourContract",
    functionName: "voteForBatchCapitalIncrease",
  });

  return (
    <>
      <MetaHeader />
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="flex-grow bg-base-300 w-full mt-0 px-0 py-10">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center min-w-[250px] w-auto rounded-3xl break-words">
              <table className="min-w-full divide-y divide-gray-200 shadow-lg rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Address
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Capital
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Ownership (%)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {owners.addresses.map((address, index) => {
                    const capital = owners.capitals[index] / 1e18;
                    if (capital <= 0) return null; // Skip rows with capital <= 0
                    return (
                      <tr key={index} className="hover:bg-gray-100">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{address}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{capital.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {isNaN(parseFloat(owners.percentages[index])) ? 0 : owners.percentages[index]}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center min-w-[250px] w-auto rounded-3xl break-words">
              <button onClick={openModal} className="btn btn-primary">
                Add Equity Owner
              </button>
              <button className="btn btn-primary mt-4" onClick={openIncreaseEquityModal}>
                Increase Equity
              </button>
              {isModalOpen && (
                <div
                  style={{
                    position: "fixed",
                    top: "10%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 1000,
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    padding: "20px",
                    borderRadius: "10px",
                  }}
                >
                  <div
                    ref={modalRef}
                    style={{
                      backgroundColor: "white",
                      padding: "20px",
                      borderRadius: "10px",
                      color: "black",
                      backgroundImage: "url(background1.png)",
                    }}
                  >
                    <button onClick={closeModal} className="btn btn-sm btn-circle absolute right-2 top-2">
                      ✕
                    </button>
                    <div className="flex justify-center">
                      {["Add Owner", "Active Proposals", "Deposit", "Events"].map((tabText, index) => (
                        <a
                          key={index}
                          className={`tab tab-lg ${currentPage === index + 1 ? "tab-active" : ""}`}
                          onClick={() => handleTabChange(index + 1)}
                          style={{
                            ...(currentPage === index + 1
                              ? { ...selectedTabStyle, backgroundPosition: "center" }
                              : { ...unselectedTabStyle, backgroundPosition: "center" }),
                            backgroundImage: currentPage === index + 1 ? "url(button2.png)" : "none",
                            filter: currentPage === index + 1 ? "brightness(100%)" : "none", // Adjust brightness for better readability
                          }}
                        >
                          {tabText}
                        </a>
                      ))}
                    </div>
                    <br />
                    {currentPage === 1 && (
                      <div style={activeTab === 1 ? activeTabContentStyle : tabContentStyle}>
                        <div
                          style={{ display: "flex", alignItems: "center", marginBottom: "20px", marginLeft: "-60px" }}
                        >
                          <span
                            style={{
                              marginRight: "23px",
                              background: "rgba(0, 0, 0, 0.6)",
                              padding: "5px",
                              borderRadius: "5px",
                              color: "white",
                            }}
                          >
                            New owner address:
                          </span>

                          <AddressInput
                            onChange={setnewOwnerAddress}
                            value={newOwnerAddress}
                            placeholder="New owner address"
                          />
                        </div>
                        <br />
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                          <span
                            style={{
                              marginRight: "23px",
                              background: "rgba(0, 0, 0, 0.6)",
                              padding: "5px",
                              borderRadius: "5px",
                              color: "white",
                            }}
                          >
                            Capital Requirement:
                          </span>
                          <EtherInput
                            onChange={handleCapitalAmountChange}
                            value={requiredCapitalAmountToAdd}
                            placeholder="Capital requirement"
                          />
                        </div>
                        <br />
                        <button className="btn btn-primary" onClick={() => addOwner()}>
                          Create New Owner Proposal
                        </button>
                      </div>
                    )}
                    {currentPage === 2 && (
                      <div style={activeTab === 2 ? activeTabContentStyle : tabContentStyle}>
                        {activeProposals.length > 0 ? (
                          <table className="min-w-full divide-y divide-gray-200 shadow-lg rounded-lg overflow-hidden">
                            <thead>
                              <tr className="bg-slate-100">
                                <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  ID
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Proposed Address
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Proposed Capital
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Votes
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Is Capital Increase
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {activeProposals.map((proposal: Proposal, index: number) => (
                                <tr key={index} className="hover:bg-gray-100">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    <Capitaladjvote proposalID={proposal.id} />
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {proposal.address}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {proposal.capital}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {proposal.votes}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {proposal.isCapitalIncrease ? "Yes" : "No"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p
                            style={{
                              background: "rgba(0, 0, 0, 0.6)",
                              padding: "5px",
                              borderRadius: "5px",
                              color: "white",
                            }}
                          >
                            No active proposals at the moment
                          </p>
                        )}
                      </div>
                    )}
                    {currentPage === 3 && (
                      <div style={activeTab === 3 ? activeTabContentStyle : tabContentStyle}>
                        {isOwner && isDepositable && (
                          <button className="btn btn-primary" onClick={() => depositAmount()}>
                            Deposit {depositableAmount ? `${(Number(depositableAmount) / 1e18).toFixed(2)} eth` : ""}
                            <br />
                            to attain <br />
                            ownership
                          </button>
                        )}

                        {!isDepositable && (
                          <div>
                            <p
                              style={{
                                background: "rgba(0, 0, 0, 0.6)",
                                padding: "5px",
                                borderRadius: "5px",
                                color: "white",
                              }}
                            >
                              Your are not authorized to deposit
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    {currentPage === 4 && (
                      <div style={activeTab === 4 ? activeTabContentStyle : tabContentStyle}>
                        {depositEvents.length > 0 ? (
                          <table className="min-w-full divide-y divide-gray-200 shadow-lg rounded-lg overflow-hidden">
                            <thead>
                              <tr className="bg-slate-100">
                                <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Depositor Address
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Amount <br />
                                  Deposited <br /> as Capital
                                  <br /> Contribution
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Block Timestamp
                                </th>
                                {/* Add other headers here */}
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {depositEvents.map((event: any, index: number) => (
                                <tr key={index} className="hover:bg-gray-100">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {event.address}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {event.amount.toFixed(2)} ETH
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {new Date(event.timestamp).toLocaleString()}{" "}
                                    {/* Convert timestamp to readable format */}
                                  </td>
                                  {/* Add other data cells here */}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p
                            style={{
                              background: "rgba(0, 0, 0, 0.6)",
                              padding: "5px",
                              borderRadius: "5px",
                              color: "white",
                            }}
                          >
                            No Deposit Events Yet
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <br />
          <br />
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center min-w-[250px] w-auto rounded-3xl break-words">
              {isInvoiceModalOpen && (
                <div
                  style={{
                    position: "fixed",
                    top: "10%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 2040,
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    padding: "20px",
                    borderRadius: "10px",
                  }}
                >
                  <div
                    ref={invoiceModalRef}
                    style={{
                      backgroundColor: "white",
                      padding: "20px",
                      borderRadius: "10px",
                      color: "black",
                      backgroundImage: "url(background1.png)",
                    }}
                  >
                    <button onClick={closeInvoiceModal} className="btn btn-sm btn-circle absolute right-2 top-2">
                      ✕
                    </button>
                    <div className="flex justify-center">
                      {["Issue Invoice", "Outstanding Invoices", "Paid Invoices"].map((tabText, index) => (
                        <a
                          key={index}
                          className={`tab tab-lg ${invoiceTab === tabText ? "tab-active" : ""}`}
                          onClick={() => handleInvoiceTabChange(tabText)}
                          style={{
                            ...(invoiceTab === tabText
                              ? { ...selectedTabStyle, backgroundPosition: "center" }
                              : { ...unselectedTabStyle, backgroundPosition: "center" }),
                            backgroundImage: invoiceTab === tabText ? "url(button2.png)" : "none",
                            filter: invoiceTab === tabText ? "brightness(100%)" : "none",
                          }}
                        >
                          {tabText}
                        </a>
                      ))}
                    </div>
                    <br />
                    {invoiceTab === "Issue Invoice" && (
                      <div style={invoiceTab === "Issue Invoice" ? activeTabContentStyle : tabContentStyle}>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                          <span
                            style={{
                              marginRight: "23px",
                              background: "rgba(0, 0, 0, 0.6)",
                              padding: "5px",
                              borderRadius: "5px",
                              color: "white",
                            }}
                          >
                            Invoice Recipient:
                          </span>
                          <AddressInput
                            onChange={setInvoiceRecipientAddress}
                            value={invoiceRecipientAddress}
                            placeholder="Invoice recipient address"
                          />
                        </div>
                        <br />

                        <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                          <span
                            style={{
                              marginRight: "23px",
                              background: "rgba(0, 0, 0, 0.6)",
                              padding: "5px",
                              borderRadius: "5px",
                              color: "white",
                            }}
                          >
                            Invoice Amount:
                          </span>
                          <EtherInput onChange={setInvoiceAmount} value={invoiceAmount} placeholder="Invoice amount" />
                        </div>
                        <br />

                        <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                          <span
                            style={{
                              marginRight: "23px",
                              background: "rgba(0, 0, 0, 0.6)",
                              padding: "5px",
                              borderRadius: "5px",
                              color: "white",
                            }}
                          >
                            Invoice Description:
                          </span>
                          <InputBase
                            onChange={setInvoiceDescription}
                            value={invoiceDescription}
                            placeholder="Invoice description"
                          />
                        </div>

                        <br />
                        <button className="btn btn-primary" onClick={() => issueInvoice()}>
                          Issue Invoice
                        </button>
                      </div>
                    )}
                    {invoiceTab === "Outstanding Invoices" && (
                      <div style={invoiceTab === "Outstanding Invoices" ? activeTabContentStyle : tabContentStyle}>
                        <table className="min-w-full divide-y divide-gray-200 shadow-lg rounded-lg overflow-hidden">
                          <thead>
                            <tr className="bg-slate-100">
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Invoice ID
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Invoice Recipient
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Invoice Amount
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Invoice Description
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Invoice Period
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {InvoiceIssuedEventsArray.filter((invoice: any) =>
                              arrayOfInvoiceIDsArray.includes(invoice.invoiceID),
                            ).map((invoice: any, index: number) => (
                              <tr key={index} className="hover:bg-gray-100">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {invoice.invoiceID}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {invoice.payor}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {invoice.amount}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {invoice.description}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {invoice.period}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {invoiceTab === "Paid Invoices" && (
                      <div style={invoiceTab === "Paid Invoices" ? activeTabContentStyle : tabContentStyle}>
                        <table className="min-w-full divide-y divide-gray-200 shadow-lg rounded-lg overflow-hidden">
                          <thead>
                            <tr className="bg-slate-100">
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Invoice ID
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Invoice Recipient
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Invoice Amount
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Invoice Description
                              </th>
                              <th
                                scope="col"
                                className="px-6 pys-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Invoice Period
                              </th>
                              <th
                                scope="col"
                                className="px-6 pys-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Period Paid
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {InvoicePaidEventsArray.map((invoice: any, index: number) => (
                              <tr key={index} className="hover:bg-gray-100">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {invoice.invoiceID}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {invoice.payor}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {invoice.amount}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {invoice.description}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {invoice.period}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {invoice.currentperiod}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {isIncreaseEquityModalOpen && (
                <div
                  style={{
                    position: "fixed",
                    top: "10%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 2040,
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    padding: "20px",
                    borderRadius: "10px",
                  }}
                >
                  <div
                    ref={invoiceModalRef}
                    style={{
                      backgroundColor: "white",
                      padding: "20px",
                      borderRadius: "10px",
                      color: "black",
                      backgroundImage: "url(background1.png)",
                    }}
                  >
                    <button onClick={closeIncreaseEquityModal} className="btn btn-sm btn-circle absolute right-2 top-2">
                      ✕
                    </button>
                    {[
                      "Propose Equity Increase",
                      "Vote on Equity Increase",
                      "Deposit",
                      "Execute Capital Increase",
                      "Events",
                    ].map((tabText, index) => (
                      <a
                        key={index}
                        className={`tab tab-lg ${currentPage === index + 1 ? "tab-active" : ""}`}
                        onClick={() => handleTabChange(index + 1)}
                        style={{
                          ...(currentPage === index + 1
                            ? { ...selectedTabStyle, backgroundPosition: "center" }
                            : { ...unselectedTabStyle, backgroundPosition: "center" }),
                          backgroundImage: currentPage === index + 1 ? "url(button2.png)" : "none",
                          filter: currentPage === index + 1 ? "brightness(100%)" : "none", // Adjust brightness for better readability
                        }}
                      >
                        {tabText}
                      </a>
                    ))}
                    {currentPage === 1 && (
                      <div style={activeTab === 1 ? activeTabContentStyle : tabContentStyle}>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                          <table className="min-w-full divide-y divide-gray-200 shadow-lg rounded-lg overflow-hidden">
                            <thead className="bg-gray-50">
                              <tr>
                                <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Address
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Capital
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Ownership (%)
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Proposed Capital Increase
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {owners.addresses.map((address, index) => {
                                const capital = owners.capitals[index] / 1e18;
                                return (
                                  <tr key={index} className="hover:bg-gray-100">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                      {address}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {capital.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {isNaN(parseFloat(owners.percentages[index])) ? 0 : owners.percentages[index]}%
                                    </td>

                                    <td>
                                      <div>
                                        <EtherInput
                                          onChange={value => handleBatchCapitalAmountChange(address, value)}
                                          value={capitalAmounts[address] || ""}
                                          placeholder="Capital requirement"
                                        />
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        <button
                          className="btn btn-primary"
                          onClick={() => {
                            // Trigger contract write of the stored percentage
                            proposeBatchCapitalIncrease();
                          }}
                        >
                          Propose Capital Increase
                        </button>
                      </div>
                    )}
                    {currentPage === 2 && (
                      <div style={activeTab === 2 ? activeTabContentStyle : tabContentStyle}>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                          <table className="min-w-full divide-y divide-gray-200 shadow-lg rounded-lg overflow-hidden">
                            <thead className="bg-gray-50">
                              <tr>
                                <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Address
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Capital
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Ownership (%)
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Proposed Capital Increase
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {owners.addresses.map((address, index) => {
                                const capital = owners.capitals[index] / 1e18;
                                return (
                                  <tr key={index} className="hover:bg-gray-100">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                      {address}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {capital.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {isNaN(parseFloat(owners.percentages[index])) ? 0 : owners.percentages[index]}%
                                    </td>

                                    <td>{arrayOfBatchCapitalIncreaseProposalArray[index] || "N/A"}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        <button
                          className="btn btn-primary"
                          onClick={() => {
                            voteForBatchCapitalIncrease();
                          }}
                        >
                          Vote on Capital Increase
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {isPercentageModalOpen && (
                <div
                  style={{
                    position: "fixed",
                    top: "10%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 2040,
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    padding: "20px",
                    borderRadius: "10px",
                  }}
                >
                  <div
                    ref={percentageModalRef}
                    style={{
                      backgroundColor: "white",
                      padding: "20px",
                      borderRadius: "10px",
                      color: "black",
                      backgroundImage: "url(background1.png)",
                    }}
                  >
                    <button onClick={closePercentageModal} className="btn btn-sm btn-circle absolute right-2 top-2">
                      ✕
                    </button>
                    <div className="mt-3 text-center">
                      <label
                        style={{
                          background: "rgba(0, 0, 0, 0.6)",
                          padding: "5px",
                          borderRadius: "5px",
                          color: "white",
                        }}
                        htmlFor="revenue-percentage"
                        className="block text-gray-700 text-sm font-bold mb-2"
                      >
                        Adjust Revenue Percentage
                      </label>
                      <input
                        style={{
                          background: "rgba(0, 0, 0, 0.6)",
                          padding: "5px",
                          borderRadius: "5px",
                          color: "white",
                        }}
                        type="range"
                        id="revenue-percentage"
                        name="revenue-percentage"
                        min="0"
                        max="100"
                        value={currentEstimatedRevenuePercentage}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                          setCurrentEstimatedRevenuePercentage(Number(event.target.value))
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                      />
                      <p
                        className="text-gray-500 mt-2"
                        style={{
                          background: "rgba(0, 0, 0, 0.6)",
                          padding: "5px",
                          borderRadius: "5px",
                          color: "white",
                        }}
                      >
                        Value: {currentEstimatedRevenuePercentage}%
                      </p>

                      <div className="items-center px-4 py-3">
                        <button
                          id="ok-btn"
                          className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                          onClick={() => {
                            // Trigger contract write of the stored percentage
                            setEstimatedEarnedRevenue();
                          }}
                        >
                          OK
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <table className="min-w-full divide-y divide-gray-200 shadow-lg rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-slate-100">
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Income Statement
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Period: {currentPeriodNumber}{" "}
                    </th>{" "}
                    {/* Blank cell added */}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="flex items-start justify-start px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left">
                      <button
                        onClick={openInvoiceModal}
                        className="px-2 py-1 text-xs font-medium leading-none text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
                      >
                        Issue <br />
                        Invoice
                      </button>

                      <span className="ml-2">Gross Receipts</span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {(grossReceipts / 10 ** 18).toFixed(4)}
                    </td>
                  </tr>
                  <tr>
                    <td className="flex items-start justify-start px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left">
                      <button
                        onClick={openPercentageModal}
                        className="px-2 py-1 text-xs font-medium leading-none text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
                      >
                        Adjust
                      </button>
                      <span className="ml-2">Estimated Revenue Percentage</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {estimatedEarnedRevenuePercentageNumber}%
                    </td>
                  </tr>
                  <tr>
                    <td
                      className="py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                      style={{ paddingLeft: "38px" }}
                    >
                      Estimated Earned Revenue
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {((grossReceipts * (estimatedEarnedRevenuePercentageNumber / 100)) / 10 ** 18).toFixed(4)}
                    </td>
                  </tr>
                  <tr>
                    <td className="flex items-start justify-start px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left">
                      <button
                        onClick={openExpensesModal}
                        style={{ marginRight: "8px" }}
                        className="px-2 py-1 text-xs font-medium leading-none text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
                      >
                        Manage <br /> Expenses
                      </button>
                      Total Expenses
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {(totalExpenses / 10 ** 18).toFixed(4)}
                    </td>
                  </tr>
                  {isExpensesModalOpen && (
                    <div
                      style={{
                        position: "fixed",
                        top: "10%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        zIndex: 1000,
                        backgroundColor: "rgba(0, 0, 0, 0.6)",
                        padding: "20px",
                        borderRadius: "10px",
                      }}
                    >
                      <div
                        ref={expensesModalRef} // If you are using a ref like in your other modals
                        style={{
                          backgroundColor: "white",
                          padding: "20px",
                          borderRadius: "10px",
                          color: "black",
                          backgroundImage: "url(background1.png)", // If you have a specific background
                        }}
                      >
                        <button onClick={closeExpensesModal} className="btn btn-sm btn-circle absolute right-2 top-2">
                          ✕
                        </button>
                        <div className="flex justify-center">
                          {[
                            "Propose Expense Accrual",
                            "Vote on Active Expense Accrual",
                            "Settle Expense",
                            "Paid Expenses",
                          ].map((tabText, index) => (
                            <a
                              key={index}
                              className={`tab tab-lg ${expensesTab === index + 1 ? "tab-active" : ""}`}
                              onClick={() => handleExpensesTabChange(index + 1)}
                              style={{
                                ...(expensesTab === index + 1
                                  ? { ...selectedTabStyle, backgroundPosition: "center" }
                                  : { ...unselectedTabStyle, backgroundPosition: "center" }),
                                backgroundImage: expensesTab === index + 1 ? "url(button2.png)" : "none",
                                filter: expensesTab === index + 1 ? "brightness(100%)" : "none",
                              }}
                            >
                              {tabText}
                            </a>
                          ))}
                        </div>
                        <br />

                        {/* Content for each tab */}

                        {expensesTab === 1 && (
                          <div style={expensesTab === 1 ? activeTabContentStyle : tabContentStyle}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                marginBottom: "20px",
                                marginLeft: "-74px",
                              }}
                            >
                              <span
                                style={{
                                  marginRight: "23px",
                                  background: "rgba(0, 0, 0, 0.6)",
                                  padding: "5px",
                                  borderRadius: "5px",
                                  color: "white",
                                  //center text
                                  display: "flex",
                                  justifyContent: "center",
                                }}
                              >
                                Expense Recipient:
                              </span>
                              <AddressInput
                                onChange={setExpenseRecipientAddress}
                                value={expenseRecipientAddress}
                                placeholder="Expense recipient address"
                              />
                            </div>

                            <br />

                            <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                              <span
                                style={{
                                  marginRight: "23px",
                                  background: "rgba(0, 0, 0, 0.6)",
                                  padding: "5px",
                                  borderRadius: "5px",
                                  color: "white",
                                }}
                              >
                                Expense Amount:
                              </span>
                              <EtherInput
                                onChange={setExpenseAmount}
                                value={expenseAmount}
                                placeholder="Expense amount"
                              />
                            </div>

                            <br />

                            <div style={{ display: "flex", alignItems: "center", marginLeft: "-80px" }}>
                              <span
                                style={{
                                  marginRight: "23px",
                                  background: "rgba(0, 0, 0, 0.6)",
                                  padding: "5px",
                                  borderRadius: "5px",
                                  color: "white",
                                }}
                              >
                                Expense Description:
                              </span>
                              <InputBase
                                onChange={setExpenseDescription}
                                value={expenseDescription}
                                placeholder="Expense description"
                              />
                            </div>

                            <br />

                            <span style={{ marginRight: "23px", padding: "30px", borderRadius: "5px", color: "white" }}>
                              <button className="btn btn-primary" onClick={() => proposeExpense()}>
                                Propose Expense Accrual
                              </button>
                            </span>
                          </div>
                        )}

                        {expensesTab === 2 && (
                          <div>
                            <table className="min-w-full divide-y divide-gray-200 shadow-lg rounded-lg overflow-hidden">
                              <thead>
                                <tr className="bg-slate-100">
                                  <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    Expense ID
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    Expense Description
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    Expense Recipient
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    Expense Amount
                                  </th>

                                  <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    Votes
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    Status
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    Period Issued
                                  </th>
                                </tr>
                              </thead>

                              <tbody className="bg-white divide-y divide-gray-200">
                                {arrayOfExpenseProposalsArray
                                  .filter((expenseProposal: any) => expenseProposal.status === 0)
                                  .map((expenseProposal: any, index: number) => (
                                    <tr key={expenseProposal.id} className="hover:bg-gray-100">
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        <ExpAdjVote proposalID={expenseProposal.id} />
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {arrayOfExpenseProposalDescriptionsArray[index]}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {expenseProposal.recipient}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {expenseProposal.amount}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {expenseProposal.votes}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {expenseProposal.status === 0 && "Proposed"}
                                        {expenseProposal.status === 1 && "Approved"}
                                        {expenseProposal.status === 2 && "Settled"}
                                        {expenseProposal.status === 3 && "Canceled"}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {expenseProposal.period}
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                        {expensesTab === 3 && (
                          <div>
                            <table className="min-w-full divide-y divide-gray-200 shadow-lg rounded-lg overflow-hidden">
                              <thead>
                                <tr className="bg-slate-100">
                                  <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    Expense ID
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    Expense Description
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    Expense Recipient
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    Expense Amount
                                  </th>

                                  <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    Votes
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    Status
                                  </th>

                                  <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    Period Issued
                                  </th>
                                </tr>
                              </thead>

                              <tbody className="bg-white divide-y divide-gray-200">
                                {arrayOfExpenseProposalsArray
                                  .filter((expenseProposal: any) => expenseProposal.status === 1)
                                  .map((expenseProposal: any, index: number) => (
                                    <tr key={expenseProposal.id} className="hover:bg-gray-100">
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        <ExpSettle proposalID={expenseProposal.id} />
                                        <br />
                                        <ExpCancel proposalID={expenseProposal.id} />
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {arrayOfExpenseApprovedDescriptionsArray[index]}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {expenseProposal.recipient}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {expenseProposal.amount}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {expenseProposal.votes}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {expenseProposal.status === 0 && "Proposed"}
                                        {expenseProposal.status === 1 && "Approved"}
                                        {expenseProposal.status === 2 && "Settled"}
                                        {expenseProposal.status === 3 && "Canceled"}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {expenseProposal.period}
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {expensesTab === 4 && (
                          <div>
                            <div>
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th
                                      scope="col"
                                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                      Expense ID
                                    </th>
                                    <th
                                      scope="col"
                                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                      Expense Description
                                    </th>
                                    <th
                                      scope="col"
                                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                      Expense Recipient
                                    </th>
                                    <th
                                      scope="col"
                                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                      Expense Amount
                                    </th>
                                    <th
                                      scope="col"
                                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                      Votes
                                    </th>
                                    <th
                                      scope="col"
                                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                      Status
                                    </th>
                                    <th
                                      scope="col"
                                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                      Period Issued
                                    </th>
                                    <th
                                      scope="col"
                                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                      Period Paid
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {ExpenseSettledEventsArray.map((expenseProposal: any, index: number) => (
                                    <tr key={index} className="hover:bg-gray-100">
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {expenseProposal.expenseID}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {expenseProposal.description}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {expenseProposal.recipient}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {expenseProposal.amount}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {expenseProposal.votes}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {expenseProposal.status === 0 && "Proposed"}
                                        {expenseProposal.status === 1 && "Approved"}
                                        {expenseProposal.status === 2 && "Settled"}
                                        {expenseProposal.status === 3 && "Canceled"}
                                      </td>

                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {expenseProposal.period}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {expenseProposal.accountingPeriod}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      <button
                        onClick={openPeriodCloseModal}
                        style={{ marginRight: "8px" }}
                        className="px-2 py-1 text-xs font-medium leading-none text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
                      >
                        Manage <br /> Period <br />
                        Close
                      </button>
                      Projected Operating Income
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {(
                        (grossReceipts * (estimatedEarnedRevenuePercentageNumber / 100) - totalExpenses) /
                        10 ** 18
                      ).toFixed(4)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {isPeriodCloseModalOpen && (
              <div
                style={{
                  position: "fixed",
                  top: "10%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 1000,
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                  padding: "20px",
                  borderRadius: "10px",
                }}
              >
                <div
                  ref={periodCloseModalRef}
                  style={{
                    backgroundColor: "white",
                    padding: "20px",
                    borderRadius: "10px",
                    color: "black",
                    backgroundImage: "url(background1.png)",
                  }}
                >
                  <button onClick={closePeriodCloseModal} className="btn btn-sm btn-circle absolute right-2 top-2">
                    ✕
                  </button>

                  <div className="flex justify-center">
                    {["Propose Period Close", "Vote on Period Close", "Historical"].map((tabText, index) => (
                      <a
                        key={index}
                        className={`tab tab-lg ${periodCloseTab === index + 1 ? "tab-active" : ""}`}
                        onClick={() => handlePeriodCloseTabChange(index + 1)}
                        style={{
                          ...(periodCloseTab === index + 1
                            ? { ...selectedTabStyle, backgroundPosition: "center" }
                            : { ...unselectedTabStyle, backgroundPosition: "center" }),
                          backgroundImage: periodCloseTab === index + 1 ? "url(button2.png)" : "none",
                          filter: periodCloseTab === index + 1 ? "brightness(100%)" : "none",
                        }}
                      >
                        {tabText}
                      </a>
                    ))}
                  </div>
                  {/* Content for propose period close tab */}

                  {periodCloseTab === 1 && (
                    <div style={periodCloseTab === 1 ? activeTabContentStyle : tabContentStyle}>
                      <br />

                      <button className="btn btn-primary" onClick={() => proposePeriodClose()}>
                        Propose Period Close
                      </button>
                    </div>
                  )}

                  {periodCloseTab === 2 && (
                    <div style={periodCloseTab === 2 ? activeTabContentStyle : tabContentStyle}>
                      <button className="btn btn-primary" onClick={() => voteForClosePeriodProposal()}>
                        Vote on Period Close
                      </button>
                    </div>
                  )}

                  {periodCloseTab === 3 && (
                    <div style={periodCloseTab === 3 ? activeTabContentStyle : tabContentStyle}>
                      <table className="min-w-full divide-y divide-gray-200 shadow-lg rounded-lg overflow-hidden">
                        <thead>
                          <tr className="bg-slate-100">
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Period Number
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Gross Receipts
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Earned Revenue Percentage
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Earned Gross Receipts
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Expenses
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Operating Income
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {AccountingPeriodClosedEventsArray.map((period: any, index: number) => (
                            <tr key={index} className="hover:bg-gray-100">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {period.period}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {period.grossReceipts / 10 ** 18}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {period.earnedRevenuePercentage}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {period.earnedGrossReceipts / 10 ** 18}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {period.totalExpenses / 10 ** 18}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {period.earnedGrossReceipts / 10 ** 18 - period.totalExpenses / 10 ** 18}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center min-w-[250px] w-auto rounded-3xl break-words">
              <button
                onClick={() => {
                  withdrawDistribution();
                }}
                className="btn btn-primary"
              >
                Withdraw Distribution <br />
                Available Amount: {pendingWithdrawalsArray}
              </button>
            </div>
          </div>
          <br />
          <br />

          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center min-w-[250px] w-auto rounded-3xl break-words">
              <p></p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center min-w-[250px] w-auto rounded-3xl break-words">
              <p></p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
