import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

type PayInvoiceProps = {
  proposalID: number;
  amount: bigint;
};

export const PayInvoice = ({ proposalID, amount }: PayInvoiceProps) => {
  const etherToWei = (ether: string) => {
    if (!ether || isNaN(parseFloat(ether))) return BigInt(0);
    return BigInt(Math.floor(parseFloat(ether) * 1e18));
  };

  const { writeAsync: payTheInvoice } = useScaffoldContractWrite({
    contractName: "YourContract",
    functionName: "payInvoice",
    args: [BigInt(proposalID)],
    value: etherToWei(amount.toString()),
  });

  return (
    <button className="btn btn-primary" onClick={() => payTheInvoice()}>
      Pay
    </button>
  );
};
