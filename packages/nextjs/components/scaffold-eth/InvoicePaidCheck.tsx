import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";

type InvoicePaidCheckProps = {
  proposalID: number;
};

export const InvoicePaidCheck = ({ proposalID }: InvoicePaidCheckProps) => {
  const { data: invoiceStatus } = useScaffoldContractRead({
    contractName: "YourContract",
    functionName: "getInvoicePaid",
    args: [BigInt(proposalID)],
  });

  console.log("invoiceStatus", invoiceStatus);

  return invoiceStatus ? <span>true</span> : <span>false</span>;
};
