//eslint-disable-next-line
import { useEffect, useRef, useState } from "react";
//import { CSSProperties } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { MetaHeader } from "~~/components/MetaHeader";
//import { AddressInput, EtherInput, InputBase } from "~~/components/scaffold-eth";
import { Address } from "~~/components/scaffold-eth";
import { InvoicePaidCheck } from "~~/components/scaffold-eth";
//import { Capitaladjvote, ExpAdjVote, ExpCancel, ExpSettle } from "~~/components/scaffold-eth";
//eslint-disable-next-line
import { useScaffoldContractRead, useScaffoldContractWrite, useScaffoldEventHistory } from "~~/hooks/scaffold-eth";

const Invoice: NextPage = () => {
  const { address } = useAccount();

  const { data: InvoiceIssuedEvents } = useScaffoldEventHistory({
    contractName: "YourContract",
    eventName: "InvoiceIssued",
    fromBlock: BigInt(0),
    watch: true,

    blockData: true,
    transactionData: true,
    receiptData: true,
  });

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

  return (
    <>
      <MetaHeader />
      <div className="flex items-center flex-col flex-grow pt-10">
        <Address address={address} />
        {InvoiceIssuedEventsArray.length > 0 && (
          <table className="table-auto">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Payor</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Period</th>
                <th>Timestamp</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {InvoiceIssuedEventsArray.map((event: any, index: number) => (
                <tr key={index}>
                  <td>{event.invoiceID}</td>
                  <td>{event.payor}</td>
                  <td>{event.amount}</td>
                  <td>{event.description}</td>
                  <td>{event.period}</td>
                  <td>{new Date(event.timestamp).toLocaleString()}</td>
                  <td>
                    <InvoicePaidCheck proposalID={Number(event.invoiceID)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default Invoice;
