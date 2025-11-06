import { expect } from "chai";
import { ethers } from "hardhat";
import { YourContract } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("YourContract - Business Entity Accounting", function () {
  let yourContract: YourContract;
  let owner1: SignerWithAddress;
  let owner2: SignerWithAddress;
  let owner3: SignerWithAddress;
  let nonOwner: SignerWithAddress;

  beforeEach(async () => {
    [owner1, owner2, owner3, nonOwner] = await ethers.getSigners();

    const yourContractFactory = await ethers.getContractFactory("YourContract");
    const initialOwners = [owner1.address, owner2.address];
    const capitalRequirements = [ethers.utils.parseEther("1.0"), ethers.utils.parseEther("1.0")];

    yourContract = (await yourContractFactory.deploy(initialOwners, capitalRequirements)) as YourContract;
    await yourContract.deployed();
  });

  describe("Deployment", function () {
    it("Should deploy with correct initial owners", async function () {
      const ownerAddresses = await yourContract.getOwnerAddresses();
      expect(ownerAddresses.length).to.equal(2);
      expect(ownerAddresses[0]).to.equal(owner1.address);
      expect(ownerAddresses[1]).to.equal(owner2.address);
    });

    it("Should have correct capital requirements", async function () {
      const owner1Details = await yourContract.getOwnerDetails(owner1.address);
      expect(owner1Details[1]).to.equal(ethers.utils.parseEther("1.0"));
    });

    it("Should start at period 1", async function () {
      const currentPeriod = await yourContract.currentPeriod();
      expect(currentPeriod).to.equal(1);
    });
  });

  describe("Capital Management", function () {
    it("Should allow owner to deposit capital", async function () {
      const depositAmount = ethers.utils.parseEther("1.0");
      await expect(
        yourContract.connect(owner1).depositCapital(owner1.address, depositAmount, {
          value: depositAmount,
        }),
      )
        .to.emit(yourContract, "CapitalDeposited")
        .withArgs(owner1.address, depositAmount);

      const totalCapital = await yourContract.totalCapital();
      expect(totalCapital).to.equal(depositAmount);
    });

    it("Should not allow deposit with incorrect amount", async function () {
      const incorrectAmount = ethers.utils.parseEther("0.5");
      await expect(
        yourContract.connect(owner1).depositCapital(owner1.address, incorrectAmount, {
          value: incorrectAmount,
        }),
      ).to.be.reverted;
    });

    it("Should not allow non-owner to deposit", async function () {
      const depositAmount = ethers.utils.parseEther("1.0");
      await expect(
        yourContract.connect(nonOwner).depositCapital(owner1.address, depositAmount, {
          value: depositAmount,
        }),
      ).to.be.revertedWithCustomError(yourContract, "OwnerNotFound");
    });

    it("Should allow creating capital adjustment proposal", async function () {
      // First, deposit capital to have voting power
      await yourContract
        .connect(owner1)
        .depositCapital(owner1.address, ethers.utils.parseEther("1.0"), { value: ethers.utils.parseEther("1.0") });

      const newOwnerCapital = ethers.utils.parseEther("0.5");
      await expect(
        yourContract.connect(owner1).createCapitalAdjustmentProposal(owner3.address, newOwnerCapital, true),
      ).to.emit(yourContract, "CapitalAdjustmentProposed");
    });
  });

  describe("Expense Management", function () {
    beforeEach(async () => {
      // Deposit capital for both owners
      await yourContract
        .connect(owner1)
        .depositCapital(owner1.address, ethers.utils.parseEther("1.0"), { value: ethers.utils.parseEther("1.0") });
      await yourContract
        .connect(owner2)
        .depositCapital(owner2.address, ethers.utils.parseEther("1.0"), { value: ethers.utils.parseEther("1.0") });
    });

    it("Should allow creating expense proposal", async function () {
      const expenseAmount = ethers.utils.parseEther("0.1");
      await expect(
        yourContract.connect(owner1).createExpenseProposal("Office supplies", nonOwner.address, expenseAmount),
      ).to.emit(yourContract, "ExpenseProposed");
    });

    it("Should allow voting on expense proposal", async function () {
      const expenseAmount = ethers.utils.parseEther("0.1");
      await yourContract.connect(owner1).createExpenseProposal("Office supplies", nonOwner.address, expenseAmount);

      await expect(yourContract.connect(owner2).voteForExpenseProposal(1)).to.emit(yourContract, "ExpenseVoted");
    });

    it("Should approve expense with majority vote", async function () {
      const expenseAmount = ethers.utils.parseEther("0.1");

      // Owner1 creates proposal (50% vote)
      await yourContract.connect(owner1).createExpenseProposal("Office supplies", nonOwner.address, expenseAmount);

      // Owner2 votes (another 50%, total 100% > 50%)
      await yourContract.connect(owner2).voteForExpenseProposal(1);

      const expenseProposal = await yourContract.expenseProposals(1);
      expect(expenseProposal.status).to.equal(1); // Approved
    });
  });

  describe("Invoice Management", function () {
    beforeEach(async () => {
      // Deposit capital for owner1
      await yourContract
        .connect(owner1)
        .depositCapital(owner1.address, ethers.utils.parseEther("1.0"), { value: ethers.utils.parseEther("1.0") });
    });

    it("Should allow owner to issue invoice", async function () {
      const invoiceAmount = ethers.utils.parseEther("0.5");
      await expect(
        yourContract.connect(owner1).issueInvoice(nonOwner.address, invoiceAmount, "Consulting services"),
      ).to.emit(yourContract, "InvoiceIssued");
    });

    it("Should allow payor to pay invoice", async function () {
      const invoiceAmount = ethers.utils.parseEther("0.5");

      // Issue invoice
      await yourContract.connect(owner1).issueInvoice(nonOwner.address, invoiceAmount, "Consulting services");

      // Pay invoice
      await expect(yourContract.connect(nonOwner).payInvoice(1, { value: invoiceAmount })).to.emit(
        yourContract,
        "InvoicePaid",
      );

      const grossReceipts = await yourContract.grossReceipts();
      expect(grossReceipts).to.equal(invoiceAmount);
    });

    it("Should not allow incorrect amount payment", async function () {
      const invoiceAmount = ethers.utils.parseEther("0.5");
      const incorrectAmount = ethers.utils.parseEther("0.3");

      await yourContract.connect(owner1).issueInvoice(nonOwner.address, invoiceAmount, "Consulting services");

      await expect(
        yourContract.connect(nonOwner).payInvoice(1, { value: incorrectAmount }),
      ).to.be.revertedWithCustomError(yourContract, "IncorrectAmountSent");
    });
  });

  describe("Accounting Period Management", function () {
    beforeEach(async () => {
      // Setup: deposit capital, create revenue, and set estimated revenue
      await yourContract
        .connect(owner1)
        .depositCapital(owner1.address, ethers.utils.parseEther("1.0"), { value: ethers.utils.parseEther("1.0") });
      await yourContract
        .connect(owner2)
        .depositCapital(owner2.address, ethers.utils.parseEther("1.0"), { value: ethers.utils.parseEther("1.0") });

      // Issue and pay an invoice
      const invoiceAmount = ethers.utils.parseEther("1.0");
      await yourContract.connect(owner1).issueInvoice(nonOwner.address, invoiceAmount, "Consulting services");
      await yourContract.connect(nonOwner).payInvoice(1, { value: invoiceAmount });

      // Set estimated earned revenue percentage
      await yourContract.connect(owner1).setEstimatedEarnedRevenue(100);
    });

    it("Should allow proposing period close", async function () {
      // Owner1 proposes (50%)
      await yourContract.connect(owner1).proposeCloseAccountingPeriod();

      // Owner2 votes (50%, total 100% > 50%)
      await expect(yourContract.connect(owner2).voteForClosePeriodProposal()).to.emit(
        yourContract,
        "AccountingPeriodClosed",
      );
    });

    it("Should distribute profits to owners", async function () {
      const owner1BalanceBefore = await ethers.provider.getBalance(owner1.address);

      // Close period
      await yourContract.connect(owner1).proposeCloseAccountingPeriod();
      await yourContract.connect(owner2).voteForClosePeriodProposal();

      // Check pending withdrawals
      const pendingWithdrawal = await yourContract.getPendingWithdrawals(owner1.address);
      expect(pendingWithdrawal).to.be.gt(0);

      // Withdraw
      await yourContract.connect(owner1).withdraw();

      const owner1BalanceAfter = await ethers.provider.getBalance(owner1.address);
      expect(owner1BalanceAfter).to.be.gt(owner1BalanceBefore);
    });

    it("Should increment period after closing", async function () {
      await yourContract.connect(owner1).proposeCloseAccountingPeriod();
      await yourContract.connect(owner2).voteForClosePeriodProposal();

      const currentPeriod = await yourContract.currentPeriod();
      expect(currentPeriod).to.equal(2);
    });
  });

  describe("View Functions", function () {
    beforeEach(async () => {
      await yourContract
        .connect(owner1)
        .depositCapital(owner1.address, ethers.utils.parseEther("1.0"), { value: ethers.utils.parseEther("1.0") });
      await yourContract
        .connect(owner2)
        .depositCapital(owner2.address, ethers.utils.parseEther("1.0"), { value: ethers.utils.parseEther("1.0") });
    });

    it("Should calculate ownership percentage correctly", async function () {
      const owner1Capital = ethers.utils.parseEther("1.0");
      const percentage = await yourContract.calculateOwnershipPercentage(owner1Capital);
      expect(percentage).to.equal(50); // 1 ETH out of 2 ETH total
    });

    it("Should return gross receipts and total expenses", async function () {
      const result = await yourContract.getGrossReceiptsAndTotalExpenses();
      expect(result.length).to.equal(2);
      expect(result[0]).to.equal(0); // No receipts yet
      expect(result[1]).to.equal(0); // No expenses yet
    });

    it("Should return array of capitals", async function () {
      const capitals = await yourContract.getArrayOfCapital();
      expect(capitals.length).to.equal(2);
      expect(capitals[0]).to.equal(ethers.utils.parseEther("1.0"));
      expect(capitals[1]).to.equal(ethers.utils.parseEther("1.0"));
    });
  });
});
